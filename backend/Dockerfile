# ================================
# Stage 1: Dependencies
# ================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production --ignore-scripts

# ================================
# Stage 2: Production Image
# ================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy production dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
