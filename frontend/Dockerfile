FROM node:18-alpine

WORKDIR /app

# Copy package files from the build context
# Since Railway sets build context to repo root, we need to copy from frontend/
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Set environment variables
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE $PORT

# Start the app - Use Railway's PORT environment variable
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
