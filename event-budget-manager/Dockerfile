# Use official Node.js image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy only package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else (server.js, data/, etc.)
COPY . .

# Ensure the 'data' folder exists inside the container
RUN mkdir -p ./data

# Expose the port your app runs on
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]

