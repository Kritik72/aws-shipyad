const os = require('os');
const pkg = require('../package.json');

const allowedEnvs = ['local', 'test', 'stage', 'production'];
const rawEnv = (process.env.APP_ENV || 'local').toLowerCase();

module.exports = {
  name: 'Shipyard',
  version: process.env.APP_VERSION || pkg.version,
  env: allowedEnvs.includes(rawEnv) ? rawEnv : 'local',
  port: parseInt(process.env.PORT, 10) || 3000,
  hostname: os.hostname(), // shows the pod name when running in Kubernetes
  logFormat: process.env.LOG_FORMAT || 'combined',
  shutdownTimeoutMs: parseInt(process.env.SHUTDOWN_TIMEOUT_MS, 10) || 10000,
  startedAt: new Date()
};
