# Use Node.js LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy root package files for workspace support
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy server source
COPY server/ ./server/

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app
CMD [ "npm", "start", "--prefix", "server" ]
