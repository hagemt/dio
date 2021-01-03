FROM node:alpine AS builder
COPY .npmrc package.json yarn.lock ./
RUN yarn install --ignore-platform
COPY . ./
RUN npm run next -- build

FROM node:alpine
RUN yarn global add next react react-dom --ignore-platform
COPY --from=builder .next ./
ENV NODE_ENV=production
CMD [ "next", "start" ]
