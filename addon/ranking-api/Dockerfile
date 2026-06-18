FROM node:22-alpine

WORKDIR /app

COPY addon/ranking-api/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY addon/ranking-api/server.js ./

EXPOSE 8081

CMD ["node", "server.js"]
