FROM node:14.15.3-alpine

WORKDIR /workdir

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm start