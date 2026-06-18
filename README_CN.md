# AllinCode

AllinCode 是一个 AI 网关前台增强应用，可以作为外挂套在现有网关前面运行。它负责更商业化的首页、套餐入口、数据面板入口、邀请返利、用量排行、模型健康和活动页面；原有网关继续负责登录、用户、API Key、支付、后台管理和模型转发。

当前版本兼容 sub2api，可以做到不重装、不迁移、不改核心服务。

## 核心能力

- **现代化首页**：Code0 风格的黑底、绿色光栅、玻璃卡片、热门模型和快速上手区域。
- **业务导航**：套餐选购、数据面板、订单查询、API 密钥、邀请返利、用量排行、模型健康、活动抽奖。
- **外挂部署**：AllinCode 作为独立 Docker 服务运行在现有网关前面。
- **低侵入集成**：原系统的登录、管理后台、API、支付、密钥、模型路由都不动。
- **简单配置**：只需要配置 `SUB2API_BASE_URL` 指向现有网关地址。

## 架构

```text
用户浏览器
  |
  v
AllinCode 外挂服务（Nginx + 静态前台）
  |-- /, /home/, /allincode/*  -> AllinCode 前台
  |-- /login, /dashboard, /api, /admin, /v1, ... -> 原有网关
```

## 快速启动

复制配置：

```bash
cp .env.addon.example .env
```

编辑 `.env`：

```env
ALLINCODE_PORT=3000
SUB2API_BASE_URL=http://host.docker.internal:8080
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

## 常见配置

如果原网关运行在宿主机 8080 端口：

```env
SUB2API_BASE_URL=http://host.docker.internal:8080
```

如果原网关是 Docker Compose 里的服务：

```env
SUB2API_BASE_URL=http://sub2api:8080
```

如果原网关已有公网域名：

```env
SUB2API_BASE_URL=https://api.example.com
```

## 重要文件

- `frontend/src/views/HomeView.vue`：AllinCode 首页。
- `addon/nginx.conf.template`：外挂反向代理规则。
- `addon/Dockerfile`：外挂镜像构建文件。
- `docker-compose.addon.yml`：最简部署入口。
- `.env.addon.example`：环境变量模板。
- `docs/ALLINCODE_ADDON_DEPLOY.md`：详细部署说明。

## 与 sub2api 的关系

AllinCode 是兼容 sub2api 的增强前台和外挂部署层。sub2api 提供底层网关、用户、计费、后台、密钥和模型路由能力；AllinCode 提供品牌化前台和更方便的商业化入口。

上游项目：[Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api)
