FROM node:22-alpine

WORKDIR /app

COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install

CMD ["npm", "start"]
