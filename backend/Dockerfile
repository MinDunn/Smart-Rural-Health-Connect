FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port defined in main.ts
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
