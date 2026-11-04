# syntax=docker/dockerfile:1
FROM node:20-alpine
RUN apk add --no-cache git && \
    addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY . .
RUN chown -R app:app /app
USER app
EXPOSE 3008
CMD ["node", "index.js"]
