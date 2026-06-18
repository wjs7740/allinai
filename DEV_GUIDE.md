# AllinCode Development Guide

This repository contains AllinCode, a branded add-on layer for existing sub2api deployments.

## Project Shape

| Area | Purpose |
| --- | --- |
| `frontend/` | Vue 3 portal UI and existing management frontend codebase |
| `frontend/src/views/HomeView.vue` | AllinCode public homepage |
| `addon/` | Nginx sidecar Docker image and reverse-proxy templates |
| `docker-compose.addon.yml` | Minimal add-on deployment entry |
| `docs/ALLINCODE_ADDON_DEPLOY.md` | Deployment guide for the sidecar mode |
| `backend/` | Upstream-compatible gateway/backend code retained for compatibility |

## Development Commands

Install frontend dependencies:

```bash
cd frontend
pnpm install
```

Run frontend dev server:

```bash
cd frontend
pnpm dev
```

Type-check:

```bash
cd frontend
pnpm typecheck
```

Build for sidecar deployment:

```bash
cd frontend
VITE_PUBLIC_BASE=/allincode/ pnpm build
```

Windows PowerShell:

```powershell
cd frontend
$env:VITE_PUBLIC_BASE="/allincode/"
pnpm build
```

Validate Docker Compose config:

```bash
docker compose -f docker-compose.addon.yml config
```

## Sidecar Routing Rules

AllinCode owns:

- `/`
- `/home/`
- `/allincode/*`

Everything else is proxied to `SUB2API_BASE_URL`, including:

- `/login`
- `/register`
- `/dashboard`
- `/purchase`
- `/orders`
- `/keys`
- `/affiliate`
- `/usage`
- `/monitor`
- `/admin/*`
- `/api/*`
- `/v1/*`

## Branding Rules

- Public-facing project name: `AllinCode`.
- Use `sub2api` only when describing upstream compatibility or environment variable names such as `SUB2API_BASE_URL`.
- Avoid exposing implementation notes such as “mock Code0 style” or “sub2api core remains unchanged” in product UI copy.
- Keep the homepage user-facing and product-oriented.

## Notes

The repository still contains upstream-compatible backend and admin code. Do not rename protocol identifiers, database defaults, websocket subprotocols, migration internals, or API paths unless you are intentionally changing compatibility behavior.
