# syntax=docker/dockerfile:1

# ---- Stage 1: install production dependencies only ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 2: small runtime image ----
FROM node:22-alpine AS runtime

# Patch OS packages so the image scan stays clean
RUN apk upgrade --no-cache

# Image tag from CI, shown by /api/info (falls back to package.json version)
ARG APP_VERSION=""
ENV NODE_ENV=production \
    PORT=3000 \
    APP_VERSION=${APP_VERSION}

WORKDIR /app

# Files stay owned by root, so the app user can read but not modify them
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY views ./views
COPY public ./public

# Run as the built-in non-root "node" user
USER node

EXPOSE 3000

# Run node directly (not npm) so SIGTERM reaches the app for graceful shutdown
CMD ["node", "src/server.js"]