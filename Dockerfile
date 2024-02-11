FROM node:20-alpine

RUN apk add --no-cache libc6-compat

RUN npm i -g pnpm

WORKDIR /control.ts

COPY package*.json .

COPY . .

RUN pnpm i

EXPOSE ${PORT}

CMD [ "npm", "run", "dev" ]
