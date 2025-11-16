FROM node:20-alpine

# Create a non-root user and group
RUN addgroup app && adduser -S -G app app

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Switch to root to set permissions
USER root
RUN chown -R app:app .

# Switch back to non-root userdocker build -t marketplace-with-auction .
USER app

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

RUN npm run build

# Expose port 5173
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]