FROM node:18 AS build

WORKDIR /editor

# Download app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

# Copy in our code to be built (dependencies / node_modules excluded through .dockerignore)
COPY . .
RUN yarn run build

FROM nginx:stable-alpine
ENV DEPLOYMENT_PATH=/usr/share/nginx/html
COPY --from=build /editor/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint-setup-envars.sh /docker-entrypoint.d/
