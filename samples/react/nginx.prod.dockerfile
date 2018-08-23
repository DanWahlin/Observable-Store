##### Stage 1
FROM node:latest as node
LABEL author="Dan Wahlin"
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build

##### Stage 2
FROM nginx:alpine
VOLUME /var/cache/nginx
COPY --from=node /app/build /usr/share/nginx/html
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# docker build -t nginx-react -f nginx.prod.dockerfile .
# docker run -p 8080:80 nginx-react