# Shipyard

A Node.js (Express + EJS) web application with a multi-page UI and JSON API, built as the
demo app for a DevOps project: containerize, deploy to Amazon EKS with Helm, expose with an
ALB ingress, and promote through test, stage, and production with Jenkins.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install          # install dependencies
npm start            # start on http://localhost:3000
npm run dev          # start with auto-reload (nodemon)
npm test             # run the test suite (Jest + Supertest)
```

Run as a specific environment or port:

```bash
APP_ENV=stage PORT=8080 npm start                 # Linux / macOS
$env:APP_ENV="stage"; $env:PORT="8080"; npm start # Windows PowerShell
```

## Pages

| Path            | Page |
|-----------------|------|
| `/`             | Home: version per environment, release flow, serving pod |
| `/services`     | What the platform handles |
| `/dashboard`    | Live data from the API, filter deployments by environment |
| `/architecture` | Request path, delivery path, ingress routes |
| `/api-docs`     | Endpoint list with a built-in console to run requests |
| `/contact`      | Form that posts JSON to the API |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/info` | Name, version, environment, hostname (pod name), uptime |
| GET  | `/api/environments` | test / stage / production status |
| GET  | `/api/deployments?env=&limit=` | Recent deployments |
| GET  | `/api/services` | Platform services |
| POST | `/api/contact` | `{ name, email, topic, message }` returns 201 or 400 with field errors |
| GET  | `/health` | Liveness probe |
| GET  | `/ready` | Readiness probe (503 during shutdown) |
| GET  | `/metrics` | Prometheus text metrics |

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/info
curl "http://localhost:3000/api/deployments?env=production"
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@example.com","topic":"pipeline","message":"How does promotion work?"}'
```

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Listen port (container port) |
| `APP_ENV` | `local` | `local`, `test`, `stage`, `production`; shown in the UI badge |
| `APP_VERSION` | from package.json | Override with the image tag in your pipeline |
| `LOG_FORMAT` | `combined` | morgan log format |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Max wait for connections to close on SIGTERM |

## Notes for the next steps

- Container port is `3000`. Liveness `/health`, readiness `/ready`.
- Handles `SIGTERM` gracefully: readiness flips to 503, then the server drains and exits.
- Set `APP_ENV` and `APP_VERSION` per environment through Helm values.
- `trust proxy` is enabled so client IPs are correct behind the ALB.
- Security headers via helmet with a strict CSP (no inline scripts or styles).
- Data is in memory (`src/data/store.js`), so each pod has its own copy and it resets on restart.
- Use `npm ci` in CI for reproducible installs (commit `package-lock.json`).

## Structure

```
src/
  server.js        start + graceful shutdown
  app.js           express app (exported for tests)
  config.js        env-based config
  state.js         readiness flag, request counter
  routes/          health.js, api.js, pages.js
  data/store.js    in-memory data
views/             EJS pages and partials
public/            css, js, img
tests/             Jest + Supertest
```
