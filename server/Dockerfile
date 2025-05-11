# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Environment variables (can be overridden in Render)
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Health check (important for Render)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run as non-root user for security
RUN chown -R node:node /app
USER node

# Start command
CMD ["node", "server.js"]