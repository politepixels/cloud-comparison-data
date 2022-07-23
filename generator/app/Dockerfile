# BUILD STAGE
FROM node:16-alpine3.15

WORKDIR /app

RUN apk update
RUN apk add --update alpine-sdk

COPY package.json package-lock.json /app/

RUN npm install --only=prod

ENV APP_DEBUG=false
ENV PROVIDERS_PATH=/providers
ENV DATA_PATH=/data

RUN mkdir -p /data /providers

COPY ${PWD} /app/

ENTRYPOINT [ "/app/entrypoint.sh" ]