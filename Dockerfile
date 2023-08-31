FROM --platform=linux/amd64 node:16-alpine AS node
LABEL maintainer="web@ikehunter.dev"

COPY ./angular.json /app/angular.json
COPY ./package.json /app/package.json
COPY . /app
WORKDIR /app

RUN apk update && \
    apk add --update --no-cache python3 make g++ && \
    export PYTHON=/usr/bin/python3 && \
    npm install && \
    npm install -g @angular/cli@latest && \
    npm install http-server -g && \
    ng build

# WORKDIR /app/dist/weather-wise-client

# EXPOSE 80

# CMD ["http-server", "-p", "4200"]

FROM --platform=linux/amd64 nginx:1.25.2-alpine
COPY --from=node /app/dist/weather-wise-client/ /usr/share/nginx/html


