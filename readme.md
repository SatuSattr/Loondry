![Banner](https://i.imgur.com/lBCA8WS.png)

# Loondry

Laundry Point of Sales (POS) Ecosystem — a laundry management application consisting of three services:

## Structure

| Apps | Path | Stack |
|------|------|-------|
| **REST API** | [`apps/api`](./api) | Laravel + Sanctum |
| **Web Admin** | [`apps/dashboard`](./dashboard) | Vite + React + shadcn/ui |
| **Mobile App** | [`apps/mobile`](./mobile) | Expo + React Native |

## Getting Started

All applications can be run simultaneously. Here's a quick guide for each service:

### 1. Backend API

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Full API documentation is available at [`apps/api/readme.md`](apps/api/readme.md).

### 2. Web Admin Dashboard

```bash
cd apps/dashboard
npm install
npm run dev
```

### 3. Mobile App

```bash
cd apps/mobile
npm install
npx expo start
```

## System Requirements

- Node.js >= 20
- PHP >= 8.2 + Composer
- MySQL / MariaDB
- Expo Go (mobile testing)
