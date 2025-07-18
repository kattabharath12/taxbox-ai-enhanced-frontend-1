FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with verbose output to see what's happening
RUN npm ci

# Copy source code
COPY . .

# Set environment variables to disable strict linting
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
