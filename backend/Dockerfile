FROM node:22-alpine

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy project source code
COPY . .

# Expose backend port
EXPOSE 3333

# Generate client and start dev server
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
