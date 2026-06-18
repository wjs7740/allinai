# AllinCode

AllinCode is an AI gateway portal and add-on layer for existing AI gateway deployments. It adds a polished user-facing homepage, pricing entry, dashboard shortcuts, affiliate growth pages, usage ranking, model health, and campaign pages.

The goal is simple: install AllinCode in front of your current gateway service, and immediately get a more commercial, Code0-style product experience without reinstalling or migrating the original system.

## What It Does

- **Modern Homepage**: Code0-inspired black/green visual style with model marquee, feature cards, popular models, quick start, and API examples.
- **Business Tabs**: Pricing, dashboard, orders, API keys, affiliate rebates, usage ranking, model health, and campaign pages are exposed from the top navigation.
- **Sidecar Deployment**: AllinCode can run as an independent Docker service in front of an existing gateway instance.
- **Non-Invasive Integration**: Existing login, dashboard, API, admin, payment, key management, and model routing stay handled by the upstream gateway.
- **Simple Routing**: AllinCode owns `/`, `/home/`, and `/allincode/*`; all other paths proxy to the upstream gateway service.

## Architecture

```text
User Browser
  |
  v
AllinCode Add-on (Nginx + static portal)
  |-- /, /home/, /allincode/*  -> AllinCode portal
  |-- /login, /dashboard, /api, /admin, /v1, ... -> existing gateway
```

AllinCode is intentionally lightweight. It is a portal and reverse-proxy shell around the existing platform, not a replacement for the gateway itself.

## Quick Start

Copy the example environment file:

```bash
cp .env.addon.example .env
```

Edit `.env`:

```env
ALLINCODE_PORT=3000
SUB2API_BASE_URL=http://host.docker.internal:8080
CLIENT_MAX_BODY_SIZE=50m
NGINX_RESOLVER=127.0.0.11
```

Start the add-on:

```bash
docker compose -f docker-compose.addon.yml up -d --build
```

Open:

```text
http://your-server-ip:3000/
```

## Common Upstream Settings

If your gateway runs on the host machine:

```env
SUB2API_BASE_URL=http://host.docker.internal:8080
```

If your gateway is another Docker Compose service:

```env
SUB2API_BASE_URL=http://sub2api:8080
```

If your gateway already has a public domain:

```env
SUB2API_BASE_URL=https://api.example.com
```

## Development

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Build the add-on portal with the isolated asset prefix:

```bash
cd frontend
VITE_PUBLIC_BASE=/allincode/ pnpm build
```

On Windows PowerShell:

```powershell
cd frontend
$env:VITE_PUBLIC_BASE="/allincode/"
pnpm build
```

## Important Files

- `frontend/src/views/HomeView.vue`: AllinCode portal homepage.
- `addon/nginx.conf.template`: Reverse proxy rules for sidecar mode.
- `addon/Dockerfile`: Multi-stage Docker build for the add-on image.
- `docker-compose.addon.yml`: Minimal deployment file.
- `.env.addon.example`: Minimal configuration template.
- `docs/ALLINCODE_ADDON_DEPLOY.md`: Detailed add-on deployment guide.

## Relationship With sub2api

AllinCode is based on and compatible with the sub2api ecosystem. The upstream project provides the underlying gateway, user, billing, admin, key, monitoring, and routing capabilities. AllinCode adds a branded commercial front layer and an easier deployment wrapper.

Original upstream project: [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api)

## License

This project keeps the upstream license terms. See [LICENSE](LICENSE).
