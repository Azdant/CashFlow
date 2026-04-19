# CashFlow — PWA Keuangan Pribadi

Aplikasi keuangan pribadi berbasis PWA (Progressive Web App) yang bisa diinstall di HP seperti aplikasi native.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL) |
| Charts | Chart.js + react-chartjs-2 |
| PWA | next-pwa |
| Deploy | Vercel |

---

## Cara Setup

### 1. Clone & Install

```bash
git clone https://github.com/username/cashflow.git
cd cashflow
npm install
```

### 2. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Setelah project siap, buka **SQL Editor**
3. Copy-paste isi file `supabase/migrations/001_initial_schema.sql` dan jalankan
4. Buka **Settings → API**, copy `Project URL` dan `anon public key`

### 3. Setup Environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Jalankan Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "feat: initial CashFlow PWA"
git remote add origin https://github.com/username/cashflow.git
git push -u origin main
```

### 2. Connect ke Vercel

1. Buka [vercel.com](https://vercel.com) → Import Git Repository
2. Pilih repo `cashflow`
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**

### 3. Install ke HP sebagai PWA

Setelah deploy selesai:
- **Android (Chrome):** Buka URL → titik tiga → "Tambahkan ke layar utama"
- **iOS (Safari):** Buka URL → ikon Share → "Tambahkan ke Layar Utama"

---

## Struktur Project

```
cashflow/
├── src/
│   ├── app/
│   │   ├── auth/login/       # Halaman login & register
│   │   ├── dashboard/        # Halaman utama aplikasi
│   │   ├── api/
│   │   │   └── transactions/
│   │   │       └── export/   # API route export CSV
│   │   ├── layout.tsx        # Root layout + PWA metadata
│   │   └── globals.css       # Tailwind + custom styles
│   ├── components/
│   │   ├── modals/
│   │   │   ├── TransactionModal.tsx  # Popup input transaksi
│   │   │   └── GoalModal.tsx         # Popup tambah goal
│   │   └── ui/
│   │       └── CashFlowChart.tsx     # Grafik arus kas
│   ├── hooks/
│   │   ├── useTransactions.ts  # CRUD + computed transaksi
│   │   ├── useGoals.ts         # Goals + auto progress
│   │   └── useSettings.ts      # Spend limit settings
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Format, konstanta, helpers
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── middleware.ts           # Auth guard (Next.js)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema database lengkap
├── public/
│   └── manifest.json           # PWA manifest
├── .env.example                # Template env vars
├── next.config.js              # Next.js + PWA config
├── tailwind.config.js
└── tsconfig.json
```

---

## Fitur

- ✅ Login / Register dengan email & password (Supabase Auth)
- ✅ Tambah pemasukan & pengeluaran dengan popup + numpad
- ✅ Template nominal cepat (10rb, 50rb, 100rb, dll)
- ✅ Kategori wajib dipilih
- ✅ Filter periode: Semua / Hari / Minggu / Bulan / Tahun
- ✅ Dashboard: saldo, grafik arus kas, pengeluaran per kategori
- ✅ Goals dengan progress tracking otomatis dari kategori pemasukan
- ✅ Batas pengeluaran dengan notifikasi
- ✅ Export CSV
- ✅ PWA: bisa diinstall di HP, bisa offline (partial)
- ✅ Data tersimpan di cloud (Supabase), sync antar device

---

## Pengembangan Lebih Lanjut

Beberapa ide yang bisa ditambahkan:
- [ ] Notifikasi push (Web Push API)
- [ ] Foto struk / receipt
- [ ] Recurring transaction (transaksi berulang otomatis)
- [ ] Multi-currency
- [ ] Widget ringkasan (iOS/Android)
- [ ] Import dari bank statement CSV
