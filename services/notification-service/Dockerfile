FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/notification-service ./services/notification-service
RUN npm install && npm run build -w @bus/shared
CMD ["npx", "tsx", "services/notification-service/src/index.ts"]
