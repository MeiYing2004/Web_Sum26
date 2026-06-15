FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service
RUN npm install && npm run build -w @bus/shared
RUN cd services/analytics-service && npx prisma generate && npx tsc

FROM node:20-alpine
WORKDIR /app/services/analytics-service
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/services/analytics-service/dist ./dist
COPY --from=builder /app/services/analytics-service/prisma ./prisma
COPY --from=builder /app/services/analytics-service/package.json ./
ENV NODE_PATH=/app/node_modules
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
