const createApp = require('./app');
const config = require('./config');
const state = require('./state');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`${config.name} v${config.version} [${config.env}] listening on http://localhost:${config.port}`);
});

// Graceful shutdown: Kubernetes sends SIGTERM before killing the pod.
function shutdown(signal) {
  console.log(`${signal} received: marking not ready and closing server`);
  state.ready = false;

  server.close(() => {
    console.log('All connections closed. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, config.shutdownTimeoutMs).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
