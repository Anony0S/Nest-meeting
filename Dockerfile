FROM node:22-alpine as build-stage

WORKDIR /app

COPY package.json .

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

# production stage
FROM node:22-alpine as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm i -g pnpm

RUN pnpm install --production

EXPOSE 3005

CMD ["node", "/app/main.js"]
