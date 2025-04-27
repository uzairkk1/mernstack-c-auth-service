# Use the official Node.js image as our base
# Using node 18-alpine as it is light weight
FROM node:18-alpine AS builder 

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
# Running CI since we want to install the exact same version dependencies
RUN npm ci

# Copy the rest of our app's source code into the container
# Left . refers the Project Working Directory
# Right . Referes the Docker Working Directory
COPY . .

# Command in our PKG JSON
RUN npm run build



#PRODUCTION BUILD
FROM node:18-alpine AS production 
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY --from=builder /app/dist ./
EXPOSE 5500
CMD ["node", "src/server.js"]