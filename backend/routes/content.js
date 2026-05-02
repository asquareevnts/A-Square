import express from 'express';
import { randomUUID } from 'crypto';
import { getContentByKey, setContentByKey } from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const CONTENT_KEYS = {
  products: 'products',
  events: 'events',
  gallery: 'gallery',
  contact: 'contact',
  social: 'social',
  feedback: 'feedback'
};

function parseList(value) {
  return Array.isArray(value) ? value : [];
}

router.get('/products', async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.products);
  res.json({ success: true, items: parseList(data) });
});

router.put('/products', requireAdmin, async (req, res) => {
  const items = parseList(req.body?.items);
  await setContentByKey(CONTENT_KEYS.products, items);
  res.json({ success: true, items });
});

router.get('/events', async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.events);
  res.json({ success: true, items: parseList(data) });
});

router.put('/events', requireAdmin, async (req, res) => {
  const items = parseList(req.body?.items);
  await setContentByKey(CONTENT_KEYS.events, items);
  res.json({ success: true, items });
});

router.get('/gallery', async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.gallery);
  res.json({ success: true, items: parseList(data) });
});

router.put('/gallery', requireAdmin, async (req, res) => {
  const items = parseList(req.body?.items);
  await setContentByKey(CONTENT_KEYS.gallery, items);
  res.json({ success: true, items });
});

router.get('/contact', async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.contact);
  res.json({ success: true, info: data && typeof data === 'object' ? data : {} });
});

router.put('/contact', requireAdmin, async (req, res) => {
  const info = req.body?.info && typeof req.body.info === 'object' ? req.body.info : {};
  await setContentByKey(CONTENT_KEYS.contact, info);
  res.json({ success: true, info });
});

router.get('/social', async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.social);
  res.json({ success: true, links: data && typeof data === 'object' ? data : {} });
});

router.put('/social', requireAdmin, async (req, res) => {
  const links = req.body?.links && typeof req.body.links === 'object' ? req.body.links : {};
  await setContentByKey(CONTENT_KEYS.social, links);
  res.json({ success: true, links });
});

router.get('/feedback', requireAdmin, async (req, res) => {
  const data = await getContentByKey(CONTENT_KEYS.feedback);
  res.json({ success: true, items: parseList(data) });
});

router.post('/feedback', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({ success: false, message: 'Feedback message is required.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ success: false, message: 'Feedback message is too long.' });
  }

  const entry = {
    id: randomUUID(),
    name: name || 'Anonymous',
    email: email || null,
    message,
    submittedAt: new Date().toISOString()
  };

  const existing = parseList(await getContentByKey(CONTENT_KEYS.feedback));
  const nextItems = [entry, ...existing].slice(0, 500);
  await setContentByKey(CONTENT_KEYS.feedback, nextItems);

  return res.status(201).json({ success: true, item: entry });
});

export default router;
