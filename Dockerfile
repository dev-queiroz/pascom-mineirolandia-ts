# Build Stage
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
# Copia os brasões da pasta src/assets
COPY --from=builder /app/src/assets ./src/assets

RUN mkdir -p uploads
EXPOSE 3000

# Executa as migrações no Neon e inicia o app
CMD npx prisma migrate deploy && node dist/main