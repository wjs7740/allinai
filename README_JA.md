# AllinCode

AllinCode は、既存の sub2api 環境の前段に配置できる AI ゲートウェイ用ポータル / アドオンです。sub2api のコア機能を変更せず、商用サービス向けのホームページ、料金導線、ダッシュボード入口、紹介報酬、利用ランキング、モデル稼働状況、キャンペーンページを追加します。

## 概要

- Code0 風の黒背景とグリーンアクセントを使ったモダンなトップページ
- 料金、注文、API Key、紹介報酬、利用ランキング、モデル健康状態などの上部ナビゲーション
- 既存 sub2api を再インストールせずに利用できる sidecar デプロイ
- `/`、`/home/`、`/allincode/*` は AllinCode が担当
- `/login`、`/dashboard`、`/api`、`/admin`、`/v1` などは既存 sub2api に転送

## クイックスタート

```bash
cp .env.addon.example .env
```

`.env` を編集します:

```env
ALLINCODE_PORT=3000
SUB2API_BASE_URL=http://host.docker.internal:8080
CLIENT_MAX_BODY_SIZE=50m
NGINX_RESOLVER=127.0.0.11
```

起動:

```bash
docker compose -f docker-compose.addon.yml up -d --build
```

アクセス:

```text
http://your-server-ip:3000/
```

## sub2api との関係

AllinCode は sub2api エコシステムをベースにした拡張レイヤーです。ユーザー、課金、管理画面、API Key、モデルルーティングなどの中核機能は既存 sub2api が担当し、AllinCode はブランド化された商用フロントページと簡単な導入パッケージを提供します。

Upstream: [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api)
