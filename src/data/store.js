// In-memory data. Replace with a real database later if needed.
const crypto = require('crypto');
const config = require('../config');

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

const environments = [
  {
    name: 'test',
    label: 'Test',
    namespace: 'shipyard-test',
    host: 'test.shipyard.example.com',
    version: '1.1.0-rc.3',
    status: 'healthy',
    replicas: { ready: 1, desired: 1 },
    approval: 'Automatic on merge to develop',
    lastDeployedAt: minutesAgo(18)
  },
  {
    name: 'stage',
    label: 'Stage',
    namespace: 'shipyard-stage',
    host: 'stage.shipyard.example.com',
    version: '1.0.2',
    status: 'healthy',
    replicas: { ready: 2, desired: 2 },
    approval: 'Automatic after test passes',
    lastDeployedAt: minutesAgo(190)
  },
  {
    name: 'production',
    label: 'Production',
    namespace: 'shipyard-prod',
    host: 'shipyard.example.com',
    version: '1.0.1',
    status: 'healthy',
    replicas: { ready: 3, desired: 3 },
    approval: 'Manual approval in Jenkins',
    lastDeployedAt: minutesAgo(2890)
  }
];

const deployments = [
  { id: 'd-1042', version: '1.1.0-rc.3', env: 'test', status: 'succeeded', author: 'priya.k', commit: '9f3c2ab', durationSec: 214, startedAt: minutesAgo(18) },
  { id: 'd-1041', version: '1.1.0-rc.2', env: 'test', status: 'failed', author: 'priya.k', commit: '41d8e07', durationSec: 96, startedAt: minutesAgo(64) },
  { id: 'd-1040', version: '1.0.2', env: 'stage', status: 'succeeded', author: 'arjun.m', commit: 'c7a19f4', durationSec: 248, startedAt: minutesAgo(190) },
  { id: 'd-1039', version: '1.0.2', env: 'test', status: 'succeeded', author: 'arjun.m', commit: 'c7a19f4', durationSec: 201, startedAt: minutesAgo(240) },
  { id: 'd-1038', version: '1.0.1', env: 'production', status: 'succeeded', author: 'neha.s', commit: '2be6d90', durationSec: 312, startedAt: minutesAgo(2890) },
  { id: 'd-1037', version: '1.0.1', env: 'stage', status: 'succeeded', author: 'neha.s', commit: '2be6d90', durationSec: 239, startedAt: minutesAgo(3010) },
  { id: 'd-1036', version: '1.0.0', env: 'production', status: 'rolled back', author: 'neha.s', commit: 'e81f3c2', durationSec: 405, startedAt: minutesAgo(4420) },
  { id: 'd-1035', version: '1.0.0', env: 'stage', status: 'succeeded', author: 'rahul.d', commit: 'e81f3c2', durationSec: 226, startedAt: minutesAgo(4600) }
];

const services = [
  { id: 'ci', title: 'Continuous integration', tools: ['Jenkins', 'Jest'], description: 'Every push runs install, lint, and tests. A failing build stops before anything is packaged.' },
  { id: 'images', title: 'Container images', tools: ['Docker', 'Amazon ECR'], description: 'Passing builds are packaged into an image tagged with the commit and pushed to the registry.' },
  { id: 'releases', title: 'Helm releases', tools: ['Helm', 'kubectl'], description: 'One chart, three values files. Each environment gets its own namespace, replica count, and host.' },
  { id: 'routing', title: 'Ingress routing', tools: ['AWS Load Balancer Controller', 'ALB'], description: 'An ALB ingress sends website and /api traffic to the service, with TLS at the load balancer.' },
  { id: 'health', title: 'Health checks', tools: ['Liveness', 'Readiness'], description: 'Kubernetes probes /health and /ready. Pods stop receiving traffic before they shut down.' },
  { id: 'rollback', title: 'Rollbacks', tools: ['helm rollback'], description: 'If a release misbehaves, the previous revision is one command away in any environment.' }
];

const stages = [
  { title: 'Commit', detail: 'Code is pushed to GitHub' },
  { title: 'Build and test', detail: 'Jenkins installs, tests, builds the image' },
  { title: 'Test', detail: 'Deployed automatically for QA' },
  { title: 'Stage', detail: 'Production-like checks' },
  { title: 'Production', detail: 'Released after manual approval' }
];

const messages = [];
const MAX_MESSAGES = 100;

function getEnvironments() {
  // The environment this instance runs in reports its live version.
  return environments.map((e) =>
    e.name === config.env ? { ...e, version: config.version, current: true } : { ...e, current: false }
  );
}

function getDeployments({ env, limit } = {}) {
  let list = deployments;
  if (env) list = list.filter((d) => d.env === env);
  if (limit) list = list.slice(0, limit);
  return list;
}

function addMessage({ name, email, topic, message }) {
  const entry = {
    id: crypto.randomBytes(4).toString('hex'),
    name,
    email,
    topic,
    message,
    receivedAt: new Date().toISOString()
  };
  messages.unshift(entry);
  if (messages.length > MAX_MESSAGES) messages.pop();
  return entry;
}

module.exports = {
  services,
  stages,
  getEnvironments,
  getDeployments,
  addMessage,
  messageCount: () => messages.length,
  envNames: environments.map((e) => e.name)
};
