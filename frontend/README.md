# Usta Bonus Admin Dashboard

Modern Next.js asosida yozilgan admin dashboard. Bu loyiha biznes boshqaruvi uchun zarur bo\'lgan barcha xususiyatlarni taqdim etadi.

## Xususiyatlar

### 1. Foydalanuvchilar Boshqaruvi
- Barcha foydalanuvchilarning ro'yhatini ko'rish
- Foydalanuvchi ma'lumotlarini sorting qilish
- Foydalanuvchi balans va holatini kuzatish

### 2. Mahsulotlar Boshqaruvi
- Mahsulotlar ro'yhatini ko'rish
- **Excel fayldan import qilish** - Shabloni yuklab olib, ma'lumotlarni import qiling
- **Ma'lumotlarni Excel qilish** - Barcha mahsulotlarni Excel formatda eksport qiling
- Excel shablonini yuklab olish
- Mahsulot tafsilotlariga o'tish

### 3. Promokodlar
- Har bir mahsulotga tegishli promokodlarni ko'rish
- Promokod va chegirmani ko'rish
- Promokodni tez nusxalash (copy)

### 4. Chiqarish Arziları Boshqaruvi
- Barcha chiqarish arizalarining ro'yhatini ko'rish
- Ariza holatini monitoring qilish (Kutilayotgan, Tasdiqlangan, Rad etilgan)
- Rasm yuklash va ko'rish
- Rasmlarni download qilish

## Texnologiyalar

- **Next.js 15** - React framework
- **React Query** (@tanstack/react-query) - Server state management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **XLSX** - Excel import/export
- **Axios** - API requests

## O\'rnatish

### 1. Dependencies o\'rnatish
```bash
cd frontend
npm install
```

### 2. Environment variables o\'rnatish
`.env.local` faylini yarating va quyidagilarni qo'shing:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Development serverini ishga tushirish
```bash
npm run dev
```

http://localhost:3000 oching

## Loyiha Tuzilishi

```
frontend/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Dashboard
│   │   ├── users/
│   │   │   └── page.tsx          # Foydalanuvchilar ro'yxati
│   │   ├── products/
│   │   │   ├── page.tsx          # Mahsulotlar ro'yxati
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Mahsulot tafsilotlari
│   │   └── withdrawal-requests/
│   │       └── page.tsx          # Chiqarish arziları
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── AdminLayout.tsx           # Admin panel layout
│   ├── Sidebar.tsx               # Lateral menu
│   ├── Header.tsx                # Yuqori header
│   ├── DataTable.tsx             # Qayta foydalaniladigan jadvali
│   ├── Button.tsx                # Tugma komponenti
│   ├── Badge.tsx                 # Badge komponenti
│   ├── Card.tsx                  # Karta komponenti
│   ├── UploadZone.tsx            # File upload zone
│   └── ImagePreview.tsx          # Rasm preview
├── lib/
│   ├── api.ts                    # API client (Axios)
│   ├── hooks/
│   │   ├── useUsers.ts           # Foydalanuvchilar hooks
│   │   ├── useProducts.ts        # Mahsulotlar hooks
│   │   ├── usePromoCodes.ts      # Promokodlar hooks
│   │   └── useWithdrawal.ts      # Chiqarish hooks
│   └── utils/
│       └── excel.ts              # Excel utility functions
└── package.json
```

## API Integratsiyasi

Admin dashboard backend Express API bilan integratsiyalangan. Quyidagi endpoints ishlatiladi:

### Foydalanuvchilar
- `GET /api/users` - Barcha foydalanuvchilar

### Mahsulotlar
- `GET /api/products` - Barcha mahsulotlar
- `GET /api/products/:id` - Mahsulot tafsilotlari
- `POST /api/products/import` - Excel import
- `POST /api/products` - Yangi mahsulot qo'shish
- `PUT /api/products/:id` - Mahsulot tahrirlash
- `DELETE /api/products/:id` - Mahsulot o'chirish

### Promokodlar
- `GET /api/products/:id/promo-codes` - Mahsulotga tegishli promokodlar
- `GET /api/promo-codes` - Barcha promokodlar

### Chiqarish Arziları
- `GET /api/withdrawal-requests` - Barcha arizalar
- `GET /api/withdrawal-requests/:id` - Ariza tafsilotlari
- `POST /api/withdrawal-requests/:id/image` - Rasm yuklash

## React Query Ishlatilysh

React Query state management uchun ishlatiladi. Custom hooks orqali data fetching amalga oshiriladi:

```typescript
// Foydalanuvchilar olish
const { data: users, isLoading, error } = useUsers()

// Mahsulotlarni import qilish
const importMutation = useImportProducts()
importMutation.mutate(formData)
```

## Styling va Design

- **Tailwind CSS** - Utility-first CSS framework
- **Design Tokens** - CSS variables orqali tema sozlash
- **Dark Mode** - Avtomatik dark/light tema
- **Responsive** - Mobile-first approach

## Features

### DataTable Component
- Sorting (alifbo boʻyicha)
- Loading states
- Custom render functions
- Row actions
- Pagination (future)

### UploadZone Component
- Drag and drop
- File size validation
- Loading states
- Error handling

### Excel Integration
- Template export
- Data import
- Data export
- XLSX format

## Development

### Code Structure
- **DRY Principle** - Kod repetitsiyasini bartaraf etish
- **Clean Code** - O'qiladigan va tushunadigan kod
- **Type Safety** - TypeScript bilan to'liq type coverage
- **Reusable Components** - Boshqa joyda ham ishlatilishi mumkin

### Hooks
Custom hooks orqali logic qayta foydalanishga tayyorlangan:
- API call logic
- State management
- Side effects

## Performance

- React Query caching
- Component memoization (agar kerak bo'lsa)
- Image optimization
- Code splitting

## Security

- Environment variables
- CORS handling
- Input validation
- XSS protection (React default)

## Future Improvements

- [ ] Authentication va authorization
- [ ] Advanced filtering
- [ ] Batch actions
- [ ] Real-time updates (WebSocket)
- [ ] Export to PDF
- [ ] Email notifications
- [ ] User activity logging

## Troubleshooting

### API bilan ulanish muammosi
1. Backend serverini ishga tushirgani tekshiring
2. `.env.local` faylida API URL to'g'ri ekanini tekshiring
3. CORS settings backend'da sozlangani tekshiring

### Excel import xatosi
1. Excel formatining to'g'ri ekanini tekshiring
2. Ustunlar nomi (name, quantity, bonusAmount)
3. File hajmi 5MB dan katta bo'lmasligi kerak

### Image upload muammosi
1. File hajmi (max 5MB)
2. Format (PNG, JPG, JPEG)
3. Backend rasmlar saqlash uchun sozlangan ekanini tekshiring

## Licenziya

MIT

## Savol va Bog'lanish

Savol bo'lsa admin@ustabodus.uz ga yozing
