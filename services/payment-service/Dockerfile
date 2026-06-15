FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/payment-service ./services/payment-service
RUN npm install && npm run build -w @bus/shared
RUN cd services/payment-service && npx prisma generate && npx tsc

FROM node:20-alpine
WORKDIR /app/services/payment-service
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/services/payment-service/dist ./dist
COPY --from=builder /app/services/payment-service/prisma ./prisma
COPY --from=builder /app/services/payment-service/package.json ./
ENV NODE_PATH=/app/node_modules
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
