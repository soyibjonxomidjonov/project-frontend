# 1) Build the static SPA (Next.js `output: export` → ./out)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# All client config is baked in at build time; values come from .env via compose.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=false
ARG NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=false
ARG NEXT_PUBLIC_ENABLE_TRANSLATION=false
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=$NEXT_PUBLIC_ENABLE_DEMO_FIXTURES \
    NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=$NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN \
    NEXT_PUBLIC_ENABLE_TRANSLATION=$NEXT_PUBLIC_ENABLE_TRANSLATION
RUN npm run build

# 2) Serve the static files with nginx (SPA fallback)
FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
