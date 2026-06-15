FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY services/auth-service ./services/auth-service
RUN npm install
RUN cd services/auth-service && npx prisma generate && npx tsc

FROM node:20-alpine
WORKDIR /app/services/auth-service
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/prisma ./prisma
COPY --from=builder /app/services/auth-service/package.json ./
ENV NODE_PATH=/app/node_modules
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
