FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages ./packages
COPY apps/mcp-server ./apps/mcp-server
RUN npm install
CMD ["npx", "tsx", "apps/mcp-server/src/index.ts"]
