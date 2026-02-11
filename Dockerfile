FROM node:20-alpine AS builder

#  Use apk instead of apt-get
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm audit fix --force || true


# 🔥 Force update vulnerable transitive dependencies
RUN npm install cross-spawn@7.0.5 glob@10.5.0 tar@7.5.7 --save-exact --force

# Optional: Verify no audit issues remain
RUN npm audit --audit-level=high || true

# Stage 2: Production
FROM node:20-alpine

#  Use apk instead of apt-get
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

# Alpine uses adduser/addgroup syntax
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /sbin/nologin -D nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]