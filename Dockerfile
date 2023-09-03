# STAGE 1: Setup
############################################
# FROM --platform=linux/amd64 node:16-alpine AS setup
FROM node:16-alpine AS setup
LABEL maintainer="web@ikehunter.dev"

COPY ./angular.json /app/angular.json
COPY ./package.json /app/package.json

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

COPY . /app
# ARG API_BASE="http://localhost:3000"
# ARG API_BASE="https://0.0.0.0:8000"
ARG CONFIG=production
# RUN export API_BASE=$API_BASE && \
#     npm run ng run Weather-Wise-Client:collect-vars

RUN npm run ng build -- --output-path=dist/ --configuration=${CONFIG}

# STAGE 3: Final
############################################
FROM setup AS final
COPY --from=build /app/dist/ /app/dist/

VOLUME /app/dist

CMD ["tail", "-f", "/dev/null"]


