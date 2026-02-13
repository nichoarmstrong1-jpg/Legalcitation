FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first for Docker layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/citation-parser/package.json packages/citation-parser/
COPY packages/rule-engine/package.json packages/rule-engine/
COPY packages/verification/package.json packages/verification/
COPY apps/api/package.json apps/api/
RUN npm ci

# Copy source code and base config
COPY packages/ packages/
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./
COPY drizzle/ drizzle/

# Build packages in dependency order
RUN npm run build -w packages/shared && \
    npm run build -w packages/citation-parser && \
    npm run build -w packages/rule-engine && \
    npm run build -w packages/verification && \
    npm run build -w apps/api

# --- Production runner ---
FROM node:22-alpine
WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/shared/package.json packages/shared/
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/citation-parser/package.json packages/citation-parser/
COPY --from=builder /app/packages/citation-parser/dist packages/citation-parser/dist
COPY --from=builder /app/packages/rule-engine/package.json packages/rule-engine/
COPY --from=builder /app/packages/rule-engine/dist packages/rule-engine/dist
COPY --from=builder /app/packages/verification/package.json packages/verification/
COPY --from=builder /app/packages/verification/dist packages/verification/dist
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/drizzle drizzle

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
