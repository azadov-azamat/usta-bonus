# Usta Bonus Admin Dashboard - Complete Guide

Bu loyiha Usta Bonus platform uchun yangi admin dashboard'ni o'z ichiga oladi. Frontend va backend ayriy bo'lib joylashgan.

## Proyekt Struktura

```
usta-bonus/
├── routes/
│   ├── admin.js               # Admin API endpoints
│   └── ...
├── models/                    # Database models
├── services/                  # Business logic
│
├── frontend/                  # Next.js Admin Dashboard (NEW)
│   ├── app/
│   │   ├── admin/            # Admin panel pages
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── hooks/           # React hooks (React Query)
│   │   └── utils/           # Utility functions
│   ├── package.json
│   ├── README.md            # Frontend documentation
│   └── DEPLOYMENT.md        # Deployment guide
│
└── ... (backend files)
```

## Quick Start

### 1. Backend Setup (Existing)
```bash
# Backend dependencies'ni o'rnatish (agar o'rnatilmagan bo'lsa)
npm install

# Backend server'ni run qilish
npm start
# Server 3001 port'da ishga tushadi
```

### 2. Frontend Setup (New)
```bash
# Frontend folder'ga o'tish
cd frontend

# Dependencies'ni o'rnatish
npm install

# Development server'ni run qilish
npm run dev
# Server http://localhost:3000 da ishga tushadi
```

### 3. Admin Dashboard'ga Kirish
Browser'da http://localhost:3000/admin/users o'ting

## Features

### Admin Dashboard qismlar:

#### 1. **Foydalanuvchilar Boshqaruvi** (`/admin/users`)
- Barcha foydalanuvchilarning ro'yxati
- Name, username, phone, balans, jami oldi ma'lumotlari
- Sorting quvvati
- Har bir foydalanuvchiga tez o'tish

#### 2. **Mahsulotlar Boshqaruvi** (`/admin/products`)
- Mahsulotlar ro'yxati
- **Excel Import**: Excel fayldan mahsulotlarni import qilish
- **Excel Export**: Shablonni yuklab olish
- **Data Export**: Barcha mahsulotlarni Excel'ga eksport qilish
- Mahsulot tafsilotlariga o'tish

#### 3. **Promokodlar** (`/admin/products/[id]`)
- Har bir mahsulotga tegishli promokodlarni ko'rish
- Promokod va chegirmani ko'rish
- Promokodni clipboard'ga nusxalash
- Jami/faol/mavjud kodlar statistikasi

#### 4. **Chiqarish Arziları** (`/admin/withdrawal-requests`)
- Barcha chiqarish arizalarining ro'yxati
- Ariza holatini monitoring qilish (Kutilayotgan/Tasdiqlangan/Rad etilgan)
- Har bir arizaga rasm yuklash
- Rasmlarni preview va download qilish
- Foydalanuvchi ma'lumotlari (ID, Telefon)

## Technology Stack

### Frontend
- **Next.js 15** - React framework
- **React Query** - Server state management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **XLSX** - Excel import/export
- **Axios** - HTTP client

### Backend (Existing)
- **Express.js** - Web framework
- **Sequelize** - ORM
- **PostgreSQL** - Database
- **Multer** - File upload

## API Integration

### Endpoints Structure

```
/api/admin/              # All admin endpoints
├── users               # GET - Barcha foydalanuvchilar
├── products            # GET - Barcha mahsulotlar
├── products/import     # POST - Excel import
├── products/:id        # GET - Mahsulot tafsilotlari + promokodlar
├── withdrawals         # GET - Barcha arizalar
└── withdrawals/:id/complete  # POST - Rasm yuklash va ariza yakunlash
```

## React Query Hooks

Frontend'da foydalaniladigan custom hooks'lar:

```typescript
// Foydalanuvchilar
const { data: users, isLoading } = useUsers()

// Mahsulotlar
const { data: products } = useProducts()
const { data: product } = useProduct(id)

// Import
const importMutation = useImportProducts()
importMutation.mutate(formData)

// Promokodlar
const { data: codes } = usePromoCodesByProduct(productId)

// Chiqarish arziları
const { data: requests } = useWithdrawalRequests()
const uploadMutation = useUploadWithdrawalImage()
uploadMutation.mutate({ id, file })
```

## Excel Import/Export

### Template Format
```
| Name         | Quantity | BonusAmount |
|--------------|----------|-------------|
| Product A    | 100      | 5000        |
| Product B    | 50       | 2500        |
```

### Import Process
1. "Import qilish" tugmasini bosing
2. Excel faylni tanlang yoki sudring
3. System mahsulotlarni database'ga qo'shadi
4. Har bir mahsulot uchun promokodlar avtomatik yaratiladi

## Development Tips

### Code Structure
- **DRY Principle** - Repetitsiyasiz kod
- **Clean Code** - Oqiladigan va tushunadigan
- **Reusable Components** - Qayta foydalaniladigan komponentlar
- **Type Safety** - Full TypeScript coverage

### Custom Hooks Pattern
```typescript
// hooks/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  })
}
```

### Component Pattern
```typescript
// components/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  actions?: Action<T>[]
}

export function DataTable<T>({ data, columns, actions }: DataTableProps<T>) {
  // Implementation
}
```

## Common Tasks

### Yangi sahifa qo'shish
1. `app/admin/[name]/page.tsx` faylini yarating
2. `AdminLayout` component'ini ishlatish
3. React Query hooks'larni import qiling
4. DataTable yoki boshqa komponentlarni foydalaning

### API endpoint'i qo'shish
1. `backend/routes/admin.js` ga endpoint qo'shing
2. Response formatini aniqla
3. `frontend/lib/api.ts` da API client'ni update qiling
4. Custom hook yarating (`useNewFeature`)

### Styling
- Tailwind CSS classes ishlatish
- Design tokens (`--primary`, `--secondary`, `--muted` va boshqalar) foydalaning
- Dark mode avtomatik qo'llaniladi

## Troubleshooting

### Frontend Frontend ishlamayotgan bo'lsa
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### API bilan ulanish muammosi
1. Backend server'i ishga tusha ekanini tekshiring (`npm start` - 3001)
2. `.env.local` faylida `NEXT_PUBLIC_API_URL=http://localhost:3001` ekanini tekshiring
3. Backend CORS sozlamalarini tekshiring

### TypeScript errors
```bash
cd frontend
npm run type-check
```

## Security

- ✅ Environment variables secure'da saqlanadi
- ✅ CORS protection
- ✅ XSS protection (React default)
- ✅ Type-safe API calls
- ✅ Input validation

## Performance

- ✅ React Query caching
- ✅ Component memoization (kerak bo'lganda)
- ✅ Image optimization
- ✅ Code splitting (Next.js automatic)

## Monitoring & Logging

### Development
- Browser DevTools
- Console logging (debug statements)

### Production
- Vercel Analytics
- Error monitoring (optional: Sentry)
- Backend logs

## Future Improvements

- [ ] User authentication/authorization
- [ ] Advanced filtering va search
- [ ] Batch operations
- [ ] Real-time updates (WebSocket)
- [ ] PDF export
- [ ] Email notifications
- [ ] Activity logging

## Documentation

- Frontend README: `frontend/README.md`
- Deployment Guide: `frontend/DEPLOYMENT.md`
- Backend Documentation: (existing project)

## Support

- Issues yoki savollar bo'lsa: admin@ustabodus.uz
- GitHub Issues'da report qiling
- Pull requests welcome!

## License

MIT

---

**Last Updated**: 2026-03-27
**Version**: 1.0.0
**Status**: Production Ready
