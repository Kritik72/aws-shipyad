const express = require('express');
const config = require('../config');
const store = require('../data/store');

const router = express.Router();

const TOPICS = ['general', 'pipeline', 'kubernetes', 'bug'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/info', (req, res) => {
  res.json({
    name: config.name,
    version: config.version,
    environment: config.env,
    hostname: config.hostname,
    node: process.version,
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: config.startedAt.toISOString()
  });
});

router.get('/environments', (req, res) => {
  res.json({ data: store.getEnvironments() });
});

router.get('/deployments', (req, res) => {
  const { env } = req.query;
  if (env && !store.envNames.includes(env)) {
    return res.status(400).json({ error: `env must be one of: ${store.envNames.join(', ')}` });
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 50);
  const data = store.getDeployments({ env, limit });
  res.json({ count: data.length, data });
});

router.get('/services', (req, res) => {
  res.json({ data: store.services });
});

router.post('/contact', (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic : 'general';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const errors = {};
  if (!name || name.length > 100) errors.name = 'Enter your name (up to 100 characters).';
  if (!EMAIL_RE.test(email) || email.length > 200) errors.email = 'Enter a valid email address.';
  if (!TOPICS.includes(topic)) errors.topic = `Topic must be one of: ${TOPICS.join(', ')}.`;
  if (message.length < 10 || message.length > 2000) errors.message = 'Message must be 10 to 2000 characters.';

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  const entry = store.addMessage({ name, email, topic, message });
  res.status(201).json({ id: entry.id, receivedAt: entry.receivedAt });
});

module.exports = router;
