FROM node:22-alpine

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite dev server exposing host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
