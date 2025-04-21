# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy all app files
COPY . .

# Expose the service port
EXPOSE 3010

# Start the service
CMD ["node", "server.js"]

