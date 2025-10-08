# Multi-stage build for AI Code Review App

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm ci --only=production
COPY Frontend/ ./
RUN npm run build

# Stage 2: Setup Backend
FROM node:18-alpine AS backend-setup
WORKDIR /app/backend
COPY Backend/package*.json ./
RUN npm ci --only=production
COPY Backend/ ./

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy backend
COPY --from=backend-setup --chown=nextjs:nodejs /app/backend ./backend

# Copy frontend build
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]
