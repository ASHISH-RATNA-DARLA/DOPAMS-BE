FROM node:21.0.0

# ARG is available only at build time and not at runtime, so setting it to ENV
ARG PORT
ARG NODE_ENV
ARG DATABASE_URL

ENV PORT=${PORT} \ 
    NODE_ENV=${NODE_ENV} \
    DATABASE_URL=${DATABASE_URL} 

COPY package*.json ./

WORKDIR /opt/server/cirkle-master

COPY . .

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && yarn install

EXPOSE 80
CMD [ "yarn", "run", "dev" ]