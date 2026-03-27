# Turon Bot

Telegram bot va admin paneldan iborat promo tizimi:

- usta botda registratsiyadan o'tadi
- til tanlaydi: `uz`, `ru`, `uz-cyrl`
- promokodni aktivlashtirib balansiga bonus oladi
- balansdan kartaga o'tkazish uchun ariza yuboradi
- admin panelda foydalanuvchilar, mahsulotlar va arizalar ko'rinadi
- admin Excel yuklaydi va har mahsulot uchun unikal promokodlar generatsiya qilinadi
- admin kvitansiya rasmi yuklab, uni foydalanuvchining Telegram botiga yuboradi
- admin panelga `admin` role va login/parol orqali kiriladi

## Texnologiyalar

- Backend: Express, Telegraf, Sequelize, PostgreSQL
- Frontend: Vite, React, TypeScript
- Upload/import: Multer, XLSX
- i18n: i18next

## Sozlash

1. Paketlarni o'rnating:

```bash
yarn install
```

2. `.env.example` dan `.env` yarating:

```bash
cp .env.example .env
```

3. `.env` ichida quyidagilarni to'ldiring:

- `BOT_TOKEN`
- `DATABASE_URL`
- `PORT`
- `BOT_BASE_URL` (`production` uchun)
- `BOT_WEBHOOK_PATH`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`
- `ADMIN_AUTH_SECRET`
- `DB_SYNC_ALTER`

Mavjud bazaga yangi ustunlarni tushirish kerak bo'lsa, bir martalik `DB_SYNC_ALTER=true` qilib serverni ishga tushiring. Schema yangilangandan keyin uni yana `false` ga qaytarish tavsiya qilinadi.

## Ishga tushirish

Backend va bot:

```bash
yarn start
```

Admin panel development:

```bash
yarn dev:admin
```

Admin panel production build:

```bash
yarn build:admin
```

Build qilingan admin panel backend orqali `/admin` da serve qilinadi.

## Admin autentifikatsiya

- `users` jadvaliga `role`, `login`, `password_hash`, `password_salt` maydonlari qo'shilgan
- admin user `.env` dagi `ADMIN_LOGIN` va `ADMIN_PASSWORD` orqali yaratiladi yoki yangilanadi
- parol oddiy matnda saqlanmaydi, `salt + hash` ko'rinishida yoziladi
- admin sessiya `httpOnly` cookie orqali boshqariladi

## Admin panel bo'limlari

- `/admin` - registratsiyadan o'tgan userlar ro'yxati
- `/admin/products` - mahsulotlar va Excel import
- `/admin/withdrawals` - karta o'tkazma arizalari va kvitansiya yuborish

## Bot menyusi

Registratsiyadan keyin `keyboard button` orqali quyidagi bo'limlar chiqadi:

- `Promokodni aktivlashtirish`
- `Promokodlarim`
- `Balansim`
- `Pul yechish`
