FROM zzrot/alpine-node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install

ENV REDIS_HOST 192.168.99.100
ENV REDIS_PORT 6379

EXPOSE 3002

CMD [ "npm", "start"]
