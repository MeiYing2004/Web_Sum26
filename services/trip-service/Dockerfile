FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY services/trip-service ./services/trip-service
RUN npm install
RUN npm run build -w @bus/shared
RUN cd services/trip-service && npx prisma generate && npx tsc

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/trip-service/dist ./services/trip-service/dist
COPY --from=builder /app/services/trip-service/prisma ./services/trip-service/prisma
COPY --from=builder /app/services/trip-service/package.json ./services/trip-service/
ENV NODE_PATH=/app/node_modules
WORKDIR /app/services/trip-service
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && node dist/index.js"]
