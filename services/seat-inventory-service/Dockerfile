FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY services/seat-inventory-service ./services/seat-inventory-service
RUN npm install
RUN npm run build -w @bus/shared
RUN npm run build -w @bus/seat-inventory-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/seat-inventory-service/dist ./services/seat-inventory-service/dist
COPY --from=builder /app/services/seat-inventory-service/package.json ./services/seat-inventory-service/
ENV NODE_PATH=/app/node_modules
CMD ["node", "services/seat-inventory-service/dist/index.js"]
