# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git
COPY . .
RUN npm install

WORKDIR /app/shared
RUN npm run build

WORKDIR /app/backend
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app/backend
RUN apk add --no-cache git

COPY --from=builder /app/backend ./
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3001

CMD ["sh", "-c", "npx drizzle-kit push:pg --config=drizzle.config.ts && node dist/backend/src/index.js"]