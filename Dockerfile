# Dockerfile to build node server image
#


FROM node:10 as intermediate
#USER "node"
WORKDIR /home/node/app
COPY . /home/node/app
ENV NODE_ENV dev
RUN rm -rf ./node_modules && npm install

# Multi-stage build Part 2
# Copy in the project from the container that installed the node modules
# TODO: refactor to single stage build
FROM node:10
#USER "node"
WORKDIR /home/node/app
COPY --from=intermediate /home/node/app .
