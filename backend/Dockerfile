# ─── Build Stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate

# ─── Production Stage ─────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001
WORKDIR /app

COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/prisma ./prisma
COPY --chown=nodeapp:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nodeapp:nodejs logs

USER nodeapp

EXPOSE 5000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
