const express = require('express');
const config = require('../config');
const state = require('../state');

const router = express.Router();

// Liveness probe: is the process alive?
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Readiness probe: should Kubernetes send traffic here?
router.get('/ready', (req, res) => {
  if (!state.ready) return res.status(503).json({ status: 'shutting-down' });
  res.json({ status: 'ready' });
});

// Minimal Prometheus-format metrics
router.get('/metrics', (req, res) => {
  const uptime = (Date.now() - config.startedAt.getTime()) / 1000;
  const mem = process.memoryUsage();
  res.type('text/plain; version=0.0.4').send(
    [
      '# HELP shipyard_http_requests_total Total HTTP requests handled.',
      '# TYPE shipyard_http_requests_total counter',
      `shipyard_http_requests_total ${state.requestCount}`,
      '# HELP shipyard_uptime_seconds Process uptime in seconds.',
      '# TYPE shipyard_uptime_seconds gauge',
      `shipyard_uptime_seconds ${uptime.toFixed(0)}`,
      '# HELP shipyard_memory_rss_bytes Resident memory in bytes.',
      '# TYPE shipyard_memory_rss_bytes gauge',
      `shipyard_memory_rss_bytes ${mem.rss}`,
      `shipyard_build_info{version="${config.version}",env="${config.env}"} 1`,
      ''
    ].join('\n')
  );
});

module.exports = router;
