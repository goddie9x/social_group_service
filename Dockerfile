FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3008
CMD ["npm","start"]