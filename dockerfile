FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1545

CMD [ "npx", "ts-node", "src/app.ts" ]