import express from 'express';
import {
  createQuoteRequest,
  getQuoteRequestById,
  listQuoteRequests,
  setQuoteRequestWhatsAppMessageId,
  updateQuoteRequestStatus,
} from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function normalizeWhatsAppNumber(rawNumber) {
  const digits = String(rawNumber || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

function formatDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildProductLines(cartItems) {
  return cartItems.map((item, index) => {
    const qty = Number(item.qty) || 1;
    const unitPrice = Number(item.price) || 0;
    const lineTotal = unitPrice * qty;
    return `${index + 1}. ${item.name} - Qty: ${qty}, Unit: INR ${unitPrice}, Total: INR ${lineTotal}`;
  });
}

async function sendWhatsAppTextMessage(to, body) {
  const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_CLOUD_API_VERSION || 'v22.0';

  if (!token || !phoneNumberId) {
    return { success: false, skipped: true, reason: 'WhatsApp Cloud API config missing' };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      skipped: false,
      reason: responseBody?.error?.message || 'Failed to send WhatsApp message',
    };
  }

  return {
    success: true,
    skipped: false,
    messageId: responseBody?.messages?.[0]?.id || null,
  };
}

function serializeQuote(quote) {
  if (!quote) return null;
  return {
    id: quote.id,
    customerName: quote.customer_name,
    phone: quote.phone,
    email: quote.email,
    requirementDate: quote.requirement_date,
    eventLocation: quote.event_location,
    notes: quote.notes,
    cartItems: quote.requested_items,
    totalAmount: quote.total_amount,
    status: quote.status,
    adminNotes: quote.admin_notes,
    reviewedBy: quote.reviewed_by,
    whatsappMessageId: quote.whatsapp_message_id,
    createdAt: quote.created_at,
    updatedAt: quote.updated_at,
  };
}

router.post('/request', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      requirementDate,
      eventLocation,
      notes,
      cartItems,
      totalAmount,
    } = req.body;

    if (!customerName || !phone || !requirementDate || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        error: 'Name, phone, requirement date and cart items are required',
      });
    }

    const adminNumber = normalizeWhatsAppNumber(process.env.ADMIN_WHATSAPP_NUMBER);

    const lines = buildProductLines(cartItems);
    const formattedDate = formatDateLabel(requirementDate);

    const quote = await createQuoteRequest({
      userId: req.user?.id || null,
      customerName,
      phone,
      email,
      requirementDate,
      eventLocation,
      notes,
      cartItems,
      totalAmount,
      whatsappMessageId: null,
    });

    const customerPhone = normalizeWhatsAppNumber(phone);
    const adminMessage = [
      '*New Quote Request*',
      '',
      `Quote ID: #${quote.id}`,
      `Customer Name: ${customerName}`,
      `Phone: ${phone}`,
      `Email: ${email || 'Not provided'}`,
      `Required Date: ${formattedDate}`,
      `Event Location: ${eventLocation || 'Not provided'}`,
      '',
      '*Requested Products:*',
      ...lines,
      '',
      `Estimated Total: INR ${Number(totalAmount || 0).toLocaleString('en-IN')}`,
      `Additional Notes: ${notes || 'None'}`,
      '',
      'Please review this request in the Admin Dashboard and mark ACCEPTED or REJECTED.',
    ].join('\n');

    const sendResult = adminNumber
      ? await sendWhatsAppTextMessage(adminNumber, adminMessage)
      : { success: false, skipped: true, reason: 'Admin WhatsApp number is not configured' };
    if (sendResult.success && sendResult.messageId) {
      await setQuoteRequestWhatsAppMessageId(quote.id, sendResult.messageId);
    }

    const payloadQuote = serializeQuote(await getQuoteRequestById(quote.id));

    // Optional customer acknowledgement when Cloud API is configured.
    if (customerPhone && process.env.WHATSAPP_SEND_CUSTOMER_ACK === 'true') {
      const acknowledgement = [
        'Thanks for your quote request with Asquare Events.',
        `Request ID: #${payloadQuote.id}`,
        `Required Date: ${formattedDate}`,
        'Our team will review and update your request status soon.',
      ].join('\n');
      await sendWhatsAppTextMessage(customerPhone, acknowledgement);
    }

    res.json({
      success: true,
      quote: payloadQuote,
      whatsapp: sendResult,
      message: sendResult.success
        ? 'Quote request submitted and sent to admin on WhatsApp.'
        : 'Quote request submitted. WhatsApp send is pending because Cloud API is not fully configured.',
    });
  } catch (error) {
    console.error('Quote request error:', error);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const limit = Number(req.query?.limit || 100);
    const items = (await listQuoteRequests(limit)).map(serializeQuote);
    res.json({ success: true, items });
  } catch (error) {
    console.error('List quotes error:', error);
    res.status(500).json({ error: 'Failed to load quote requests' });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const quoteId = String(req.params.id || '');
    const { status, adminNotes } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();

    if (!['ACCEPTED', 'REJECTED'].includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED' });
    }

    const reviewer = req.user?.full_name || req.user?.email || 'admin';
    const updated = await updateQuoteRequestStatus(quoteId, normalizedStatus, adminNotes, reviewer);
    if (!updated) {
      return res.status(404).json({ error: 'Quote request not found' });
    }

    const customerPhone = normalizeWhatsAppNumber(updated.phone);
    let sendResult = { success: false, skipped: true, reason: 'No customer phone number' };
    if (customerPhone) {
      const statusLabel = normalizedStatus === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
      const customerMessage = [
        `Your quote request #${updated.id} is ${statusLabel}.`,
        `Required Date: ${formatDateLabel(updated.requirement_date)}`,
        `Team note: ${adminNotes || 'No additional note from admin.'}`,
        'For further assistance, please reply to this message or contact our support team.',
      ].join('\n');

      sendResult = await sendWhatsAppTextMessage(customerPhone, customerMessage);
    }

    const fresh = await getQuoteRequestById(quoteId);
    res.json({ success: true, item: serializeQuote(fresh), whatsapp: sendResult });
  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

export default router;