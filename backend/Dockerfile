FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npx prisma generate

COPY . .

EXPOSE 3334

CMD ["sh", "-c", "npx prisma generate && npm run dev"]
