FROM node:22 AS build

WORKDIR /editor

# Download app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

# Copy in our code to be built (dependencies / node_modules excluded through .dockerignore)
COPY . .
RUN yarn run build


FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /editor/build /usr/share/nginx/html
