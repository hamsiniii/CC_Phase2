# Use official Node.js image for build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY bun.lockb ./
RUN npm install

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Use a lightweight web server for production
FROM nginx:alpine

# Copy built assets to nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8081
EXPOSE 8081

# Override default nginx config to serve from 8081
RUN sed -i 's/80;/8081;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

