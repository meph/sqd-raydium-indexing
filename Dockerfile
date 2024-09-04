# Use the official Node.js 20 image from Docker Hub
FROM node:20

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies using npm ci
RUN npm ci

# Copy the rest of the application files to the working directory
COPY . .

# Copy the .env file from the local directory to the container
#COPY .env .env

# Expose the port that your app runs on (replace 3000 with your app's port if different)
# EXPOSE 3000

# Define the command to run your app
CMD ["npx", "ts-node", "src/main.ts"]