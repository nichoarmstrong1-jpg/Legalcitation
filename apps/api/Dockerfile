# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY packages/citation-parser/package.json packages/citation-parser/
COPY packages/rule-engine/package.json packages/rule-engine/
COPY packages/verification/package.json packages/verification/
COPY apps/api/package.json apps/api/
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w packages/shared && \
    npm run build -w packages/citation-parser && \
    npm run build -w packages/rule-engine && \
    npm run build -w packages/verification && \
    npm run build -w apps/api

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api
USER api

COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=api:nodejs /app/packages/shared/package.json ./packages/shared/
COPY --from=builder --chown=api:nodejs /app/packages/citation-parser/dist ./packages/citation-parser/dist
COPY --from=builder --chown=api:nodejs /app/packages/citation-parser/package.json ./packages/citation-parser/
COPY --from=builder --chown=api:nodejs /app/packages/rule-engine/dist ./packages/rule-engine/dist
COPY --from=builder --chown=api:nodejs /app/packages/rule-engine/package.json ./packages/rule-engine/
COPY --from=builder --chown=api:nodejs /app/packages/verification/dist ./packages/verification/dist
COPY --from=builder --chown=api:nodejs /app/packages/verification/package.json ./packages/verification/
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:nodejs /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=api:nodejs /app/package.json ./

CMD ["node", "apps/api/dist/server.js"]
