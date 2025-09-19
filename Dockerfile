# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Expose the port your app runs on
EXPOSE 5001

# Start the app
CMD ["node", "index.js"]
