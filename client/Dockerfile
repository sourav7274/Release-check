# Stage 1: Build
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install

# Copy source
COPY client/ ./client/

# Build the app
RUN npm run build --prefix client

# Stage 2: Serve
FROM nginx:stable-alpine

# Copy built files from stage 1
COPY --from=build-stage /app/client/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
