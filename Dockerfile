FROM node:20-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine

RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY src ./src

RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /sbin/nologin -D nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]