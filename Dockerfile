FROM node:20.19.4-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:dev"]