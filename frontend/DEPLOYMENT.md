# Deployment Guide

Usta Bonus Admin Dashboard'ni deploy qilish uchun qadamlarni bajaring.

## Development Environment'da Run Qilish

### 1. Terminal'da frontend folder'da bo'ling
```bash
cd frontend
```

### 2. Dependencies o'rnatish
```bash
npm install
```

### 3. Environment variables o'rnatish
`.env.local` faylini yarating:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Development server'ni run qilish
```bash
npm run dev
```

Server http://localhost:3000 da ishga tushibdi.

## Production Build

### Build yaratish
```bash
npm run build
```

### Production mode'da run qilish
```bash
npm run start
```

## Vercel'ga Deploy Qilish

### Option 1: GitHub'dan Direct Deployment

1. Loyihani GitHub'ga push qiling
2. Vercel'ga kirib, "New Project" bosmang
3. GitHub repository'ni tanlang
4. Build settings:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
5. Environment variables'ni qo'shing:
   - `NEXT_PUBLIC_API_URL=https://api.example.com` (production URL)
6. Deploy bosmang

### Option 2: Vercel CLI'dan

```bash
# Vercel CLI'ni o'rnatish
npm i -g vercel

# Frontend folder'dan deploy qilish
cd frontend
vercel

# Production'ga promote qilish
vercel --prod
```

## Environment Variables

### Production'da kerakli variables:

```env
# API URL (production backend'ining URL'i)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Performance Optimization

### Build Size Monitoring
```bash
npm run build
# Size output ko'ring
```

### Image Optimization
- Next.js avtomatik ravishda images'ni optimize qiladi
- Frontend allaqachon optimized components'dan foydalanadi

### Caching Strategy
- React Query client-side caching'ni 5 minut davomida qo'llanadi
- Backend dan kelgan ma'lumotlar cached'lanadi

## Troubleshooting

### API Connection Issues
1. `.env.local` faylida `NEXT_PUBLIC_API_URL` to'g'ri ekanini tekshiring
2. Backend server'i ishga tusha ekanini tekshiring
3. CORS sozlamalarini backend'da tekshiring

### Build Errors
```bash
# Cache'ni o'chirish
rm -rf .next
npm install
npm run build
```

### Port Issues
```bash
# Default port (3000) ishlatilgan bo'lsa, boshqa port'dan run qilish
npm run dev -- -p 3001
```

## Monitoring

### Deployment Status
- Vercel Dashboard'dan real-time logs ko'rish mumkin
- Production issues'lar uchun Sentry integration'ni sozlay olasiz

### Performance Monitoring
- Vercel Web Analytics avtomatik ravishda yoqilgan
- Core Web Vitals monitoring'ni ko'ring

## Rollback

Agar something going wrong bo'lsa:

```bash
# Oldingi version'ga qaytish (Vercel Dashboard'dan)
# Deployments -> Select previous version -> Promote to Production
```

## Security

### HTTPS
- Vercel avtomatik HTTPS qo'llaydi
- Custom domain'da SSL sertifikat avtomatik sozlanadi

### Environment Variables
- `.env.local` file'i Git'ga commit qilmang
- Production variables'larni Vercel Settings'dan sozlang

### CORS
Backend'da CORS sozlamalarini to'g'ri qiling:
```javascript
cors({
  origin: ['https://yourdomain.com', 'http://localhost:3000'],
  credentials: true
})
```

## Maintenance

### Regular Updates
```bash
# Dependencies'ni check qilish
npm outdated

# Dependencies'ni update qilish
npm update
```

### Monitoring Logs
- Vercel Dashboard'dan logs ko'ring
- Backend errors'lar uchun backend logs'ni tekshiring

## Support

Agar deployment muammolari bo'lsa:
1. Vercel Documentation: https://vercel.com/docs
2. Next.js Documentation: https://nextjs.org/docs
3. Email: admin@ustabodus.uz
