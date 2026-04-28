FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg curl

RUN npm install pm2 -g

COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install

# RUN npm run build

# Show current folder structure in logs
# RUN ls -al -R

# CMD [ "pm2-runtime", "start", "pm2.json" ]
# pm2 start npm --name "nextjs-app" -- start
# pm2 start start.js --name "nextjs-app"
# CMD [ "pm2", "start", "pm2.json" ]

# CMD ["tail", "-f", "/dev/null"]
# docker exec -it app-nodejs sh
# pm2-runtime start ecosystem.config.js
# pm2 list
# pm2 logs
CMD ["npm", "start"]