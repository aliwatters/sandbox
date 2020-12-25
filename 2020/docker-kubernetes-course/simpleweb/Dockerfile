FROM node:alpine

WORKDIR /usr/app

COPY ./package.json ./
COPY ./index.js ./

RUN npm install

CMD ["npm", "start"]
