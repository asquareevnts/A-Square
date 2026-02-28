import express from 'express';
import { getContentByKey, setContentByKey } from '../db/database.js';

const router = express.Router();

const CONTENT_KEYS = {
  products: 'products',
  events: 'events',
  gallery: 'gallery',
  contact: 'contact'
};

function parseList(value) {
  return Array.isArray(value) ? value : [];
}

router.get('/products', (req, res) => {
  const data = getContentByKey(CONTENT_KEYS.products);
  res.json({ success: true, items: parseList(data) });
});

router.put('/products', (req, res) => {
  const items = parseList(req.body?.items);
  setContentByKey(CONTENT_KEYS.products, items);
  res.json({ success: true, items });
});

router.get('/events', (req, res) => {
  const data = getContentByKey(CONTENT_KEYS.events);
  res.json({ success: true, items: parseList(data) });
});

router.put('/events', (req, res) => {
  const items = parseList(req.body?.items);
  setContentByKey(CONTENT_KEYS.events, items);
  res.json({ success: true, items });
});

router.get('/gallery', (req, res) => {
  const data = getContentByKey(CONTENT_KEYS.gallery);
  res.json({ success: true, items: parseList(data) });
});

router.put('/gallery', (req, res) => {
  const items = parseList(req.body?.items);
  setContentByKey(CONTENT_KEYS.gallery, items);
  res.json({ success: true, items });
});

router.get('/contact', (req, res) => {
  const data = getContentByKey(CONTENT_KEYS.contact);
  res.json({ success: true, info: data && typeof data === 'object' ? data : {} });
});

router.put('/contact', (req, res) => {
  const info = req.body?.info && typeof req.body.info === 'object' ? req.body.info : {};
  setContentByKey(CONTENT_KEYS.contact, info);
  res.json({ success: true, info });
});

export default router;
