FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/user-service ./services/user-service
RUN npm install
CMD ["npx", "tsx", "services/user-service/src/index.ts"]
