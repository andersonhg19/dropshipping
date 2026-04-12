# =========================
# Etapa 1: deps
# =========================
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.19 --activate
COPY package.json yarn.lock ./
ENV YARN_NETWORK_TIMEOUT=120000
RUN yarn install --frozen-lockfile --network-timeout 120000 --production=false

# =========================
# Etapa 2: build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8841
ARG NEXT_PUBLIC_ID_COMPANY=1
ARG NEXT_PUBLIC_TZ=America/Bogota
ARG NEXT_PUBLIC_CACHE_SECRET=changeme123
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ID_COMPANY=$NEXT_PUBLIC_ID_COMPANY
ENV NEXT_PUBLIC_TZ=$NEXT_PUBLIC_TZ
ENV NEXT_PUBLIC_CACHE_SECRET=$NEXT_PUBLIC_CACHE_SECRET
RUN rm -rf .next
RUN yarn build

# =========================
# Etapa 3: runtime (standalone)
# =========================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN apk add --no-cache curl

# standalone ya incluye un server mínimo + solo las dependencias necesarias
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
