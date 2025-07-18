FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

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
