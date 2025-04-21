# Use official Node.js image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]

