FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/ai-service ./services/ai-service
RUN npm install
EXPOSE 8765
CMD ["npx", "tsx", "services/ai-service/src/index.ts"]
