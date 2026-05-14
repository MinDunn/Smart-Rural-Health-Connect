FROM node:20-bookworm-slim

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --no-package-lock

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port defined in main.ts
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
