FROM library/node:16-alpine
LABEL maintainer=hagemt@users.noreply.github.com
USER node
RUN mkdir -p /home/node/code
WORKDIR /home/node/code
COPY .npmrc package.json yarn.lock ./
RUN yarn install --ignore-platform
ADD site.tar ./
# this ^ is a gross hack
ARG HTTP_PORT=3000
EXPOSE $HTTP_PORT
ENV PORT=$HTTP_PORT
ENV NODE_ENV=production
CMD [ "yarn", "start" ]
