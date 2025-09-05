# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, etc.)
COPY package*.json ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install

# Copy the Prisma schema to generate the client
COPY prisma ./prisma/

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build


# Stage 2: Create the final production image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json again
COPY package*.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --omit=dev

# Copy the compiled code and generated Prisma client from the 'builder' stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the port the app runs on
EXPOSE 5000

# The command to start the application
# This uses tsconfig-paths/register to resolve your module aliases like '@config'
CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]