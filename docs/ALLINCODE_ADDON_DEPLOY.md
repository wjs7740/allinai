# AllinCode 外挂部署指南

AllinCode 可以作为现有 AI 网关的增强前台运行。当前版本兼容 sub2api，不需要重装或改造原有 sub2api。

## 最简单安装

复制配置文件：

```bash
cp .env.addon.example .env
```

编辑 `.env`：

```env
ALLINCODE_PORT=3000
SUB2API_BASE_URL=http://你的现有网关地址:8080
CLIENT_MAX_BODY_SIZE=50m
NGINX_RESOLVER=127.0.0.11
```

启动：

```bash
docker compose -f docker-compose.addon.yml up -d --build
```

访问：

```text
http://服务器IP:3000/
```

## 路由规则

AllinCode 只接管：

- `/`
- `/home/`
- `/allincode/*`

其它路径全部转发到原有网关：

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

## 已有 Nginx / Caddy

如果你已有反向代理，只要把访问入口代理到 AllinCode 容器即可。AllinCode 容器内部会继续把非首页路径转发给 `SUB2API_BASE_URL`。

示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
}
```

## 常见配置

如果现有网关就运行在宿主机 8080 端口：

```env
SUB2API_BASE_URL=http://host.docker.internal:8080
```

如果现有网关是另一个 Docker Compose 服务，例如服务名叫 `sub2api`：

```env
SUB2API_BASE_URL=http://sub2api:8080
```

如果现有网关已经有公网域名：

```env
SUB2API_BASE_URL=https://api.example.com
```
