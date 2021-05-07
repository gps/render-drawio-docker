# FROM node:14-buster-slim

FROM timbru31/node-alpine-git:14

COPY index.js /workdir/index.js
COPY package.json /workdir/package.json
COPY package-lock.json /workdir/package-lock.json
COPY entrypoint.sh /workdir/entrypoint.sh

WORKDIR /workdir

RUN npm install

ENTRYPOINT ["/workdir/entrypoint.sh"]
