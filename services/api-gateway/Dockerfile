FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
RUN npm install
RUN npm run build -w @bus/shared
RUN npm run build -w @bus/api-gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json ./services/api-gateway/
ENV NODE_PATH=/app/node_modules
CMD ["node", "services/api-gateway/dist/index.js"]
