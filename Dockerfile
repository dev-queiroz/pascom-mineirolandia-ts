FROM node:20-alpine AS builder

RUN apk add --no-color openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Estágio 2: Production
FROM node:20-alpine

RUN apk add --no-color openssl libc6-compat

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/assets ./src/assets

RUN mkdir -p uploads

EXPOSE 3000

CMD npx prisma migrate deploy && node dist/main