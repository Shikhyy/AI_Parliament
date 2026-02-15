FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json turbo.json ./

# Copy apps and packages
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm ci

# Build the specific app
RUN npx turbo run build --filter=parliament-mcp

# Expose port (MCP and API)
EXPOSE 9000
EXPOSE 3000

# Set working directory to the app
WORKDIR /app/apps/parliament-mcp

# Start the app
CMD ["npm", "start"]
