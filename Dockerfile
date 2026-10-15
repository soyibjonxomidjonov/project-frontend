FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=/backend
ARG NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=false
ARG NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=true
ARG API_INTERNAL_URL=http://api:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=$NEXT_PUBLIC_ENABLE_DEMO_FIXTURES
ENV NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=$NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV DOCKER_BUILD=true
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
