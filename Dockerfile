FROM zzrot/alpine-node

# Need git for not-published npm modules
RUN apk update && \
    apk add --no-cache git openssh

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install
COPY . /usr/src/app

ENV REDIS_HOST 192.168.99.100
ENV REDIS_PORT 6379

EXPOSE 3002

CMD [ "npm", "start"]
