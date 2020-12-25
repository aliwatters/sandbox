FROM node:alpine

WORKDIR /usr/app

# Dependencies
COPY ./package.json ./
RUN npm install

# Install source
COPY ./index.js ./

CMD ["npm", "start"]
