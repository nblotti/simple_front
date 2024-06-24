# Stage 1: Build Angular app
FROM node:slim AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Angular application with production settings
RUN npm run build --prod

# Verify if the build directory exists and print it out for debugging
RUN ls -l /app/dist/simple_front/browser

# Stage 2: Serve application with nginx
FROM nginx:stable-alpine3.19-slim

# Create a non-root user and group
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

# Create required directories and adjust permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/cache/nginx /var/run /var/log/nginx

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Change ownership of nginx configuration files
RUN chown -R nginxuser:nginxgroup /etc/nginx

# Change the user to the newly created non-root user
USER nginxuser

# Copy built Angular app from the build stage
COPY --from=build /app/dist/simple_front/browser /usr/share/nginx/html

# Validate the Nginx configuration
RUN nginx -t

# Verify the nginx directory structure for debugging
RUN ls -l /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
