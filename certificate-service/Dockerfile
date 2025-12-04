# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript sources
RUN npm run build

RUN mkdir -p dist/assets && cp -r src/assets/* dist/assets/
RUN mkdir -p dist/grpc && cp -r src/grpc/*.proto dist/grpc/
RUN mkdir -p dist/config && cp -r src/config/* dist/config/

# Expose the port
EXPOSE 50052

# Command to run the application
CMD ["node", "dist/server.js"]