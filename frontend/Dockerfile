FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with specific npm settings to avoid warnings
RUN npm ci --omit=dev --silent

# Copy source code
COPY . .

# Set environment variable to disable ESLint warnings as errors during build
ENV CI=false

# Build the app
RUN npm run build

# Install serve globally for production
RUN npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the app - Railway provides PORT env variable
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
