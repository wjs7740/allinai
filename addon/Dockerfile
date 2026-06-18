FROM node:20-alpine AS frontend-builder

WORKDIR /app

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend ./
ENV VITE_PUBLIC_BASE=/allincode/
RUN pnpm exec vue-tsc --noEmit --pretty false && pnpm exec vite build

FROM nginx:1.27-alpine

COPY addon/99-websocket-map.conf /etc/nginx/conf.d/00-websocket-map.conf
COPY addon/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=frontend-builder /backend/internal/web/dist /usr/share/nginx/html/allincode

EXPOSE 80
