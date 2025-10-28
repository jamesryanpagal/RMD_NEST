FROM node:20.19.4-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN rm -rf src prisma .git .github tests docker-start.sh docker-compose.yml

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]