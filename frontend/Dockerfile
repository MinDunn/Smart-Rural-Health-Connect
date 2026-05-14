FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Use vite preview to serve the build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
