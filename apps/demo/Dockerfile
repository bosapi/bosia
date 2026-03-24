# ─── Stage 1: Build ──────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Install dependencies (monorepo root + workspace packages)
COPY package.json bun.lockb ./
COPY packages/bosbun/package.json packages/bosbun/
COPY apps/demo/package.json apps/demo/
RUN bun install --frozen-lockfile

# Copy source
COPY packages/bosbun packages/bosbun
COPY apps/demo apps/demo

# Build (Tailwind + client bundle + server bundle)
WORKDIR /app/apps/demo
RUN NODE_ENV=production bun run ../../packages/bosbun/src/core/build.ts

# ─── Stage 2: Runtime ────────────────────────────────────
FROM oven/bun:1-alpine
WORKDIR /app

# External dependencies not bundled into the server (elysia, @elysiajs/static)
COPY --from=builder /app/packages/bosbun/node_modules ./node_modules

# Built artifacts
COPY --from=builder /app/apps/demo/dist ./dist
COPY --from=builder /app/apps/demo/public ./public

ENV NODE_ENV=production
EXPOSE 9000

CMD ["bun", "run", "dist/server/index.js"]
