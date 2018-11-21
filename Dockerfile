FROM node:8-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

RUN mkdir /data
RUN mkdir /src

VOLUME ['/usr/src/app/src']

EXPOSE 8000
CMD ["npm", "start"]