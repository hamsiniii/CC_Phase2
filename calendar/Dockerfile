# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Copy all files
COPY . .

# Expose the backend port
EXPOSE 3002

# Start the server
CMD ["node", "server.js"]

