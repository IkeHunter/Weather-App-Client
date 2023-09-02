# STAGE 1: Setup
############################################
# FROM --platform=linux/amd64 node:16-alpine AS setup
FROM node:16-alpine AS setup
LABEL maintainer="web@ikehunter.dev"

COPY ./angular.json /app/angular.json
COPY ./package.json /app/package.json
COPY . /app
WORKDIR /app

RUN apk update && \
    apk add --update --no-cache python3 make g++ && \
    export PYTHON=/usr/bin/python3 && \
    npm install
    # npm install -g @angular/cli@latest && \
    # npm install http-server -g

# STAGE 2: Build
############################################
FROM setup AS build

RUN npm run ng build -- --output-path=dist/

# STAGE 3: Final
############################################
FROM setup AS final
COPY --from=build /app/dist/ /app/dist/

CMD ["tail", "-f", "/dev/null"]


