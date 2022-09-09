FROM node:18.0.0-alpine as deps
RUN apk update 
WORKDIR /usr/backend
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps as development
COPY . .
EXPOSE ${BACKEND_PORT_CONTAINER}
CMD ["yarn", "start:dev"]

FROM deps as production
COPY . .
RUN yarn build
EXPOSE ${BACKEND_PORT_CONTAINER}
CMD ["yarn", "start:prod"]