# Stage 1: Build Angular app
FROM node:20-slim AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

RUN ls -l .
# Copy the rest of the application code to the working directory
COPY . .

# Build the Angular application
RUN npm run build --prod

# Verify if the build directory exists and print it out for debugging
RUN ls -l /app/dist/simple_front/browser

# Stage 2: Serve application with nginx
FROM nginx:stable-alpine3.19-slim

# Copy built Angular app from the build stage
COPY --from=build /app/dist/simple_front/browser /usr/share/nginx/html

# Overwrite default Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Validate Nginx configuration
RUN nginx -t

# Verify nginx directory structure for debugging
RUN ls -l /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
