# Project Overview: IT-Maintenance

## Fungsi
IT-Maintenance adalah sistem manajemen aset dan pemeliharaan TI terintegrasi yang mencakup seluruh siklus lifecycle perangkat keras dan perangkat lunak perusahaan, dari akuisisi hingga pembuangan. Sistem ini menggabungkan modul IT Asset Management (ITAM), IT Service Management (ITSM), dan Computerized Maintenance Management System (CMMS) untuk menyediakan solusi end-to-end bagi tim TI.

## Nama Project
**IT-Maintenance**

## Deskripsi Singkat
IT-Maintenance adalah sistem manajemen aset dan pemeliharaan berbasis web untuk perusahaan yang mengelola perangkat keras, lisensi perangkat lunak, komponen suku cadang, dan jadwal pemeliharaan preventif. Sistem ini dirancang untuk membantu tim TI melacak, mengelola, dan memelihara aset perusahaan secara efisien, sekaligus memfasilitasi permintaan layanan dan pengelolaan pekerjaan pemeliharaan.

## Tech Stack

### Backend (Node.js)
- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **ORM**: Sequelize (untuk SQL Server)
- **Auth**: JWT dengan bcrypt, Express.js session cookies
- **Database**: Microsoft SQL Server (melalui tedious/sequelize)
- **Queue System**: Bull (Redis)
- **Caching**: Redis (via ioredis)
- **Logging**: Pino
- **Security**: Helmet, compression, XSS-clean, rate limiting
- **Real-time**: Socket.io

### Frontend (React)
- **Framework**: React 19 dengan Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand (zustand persistence)
- **Data Fetching**: TanStack Query v5
- **UI Library**: Ant Design 6
- **Form Handling**: React Hook Form v7 + Zod
- **Charts**: Recharts
- **File Upload**: Multer (backend) + FileSaver (frontend)
- **Real-time**: Socket.io-client

### Supporting Tools
- **Build Tools**: Vite, ESLint, Prettier
- **Testing**: Jest, Supertest (backend), Vitest (frontend)
- **Database Migration**: Sequelize CLI
- **Excel Import/Export**: xlsx
- **Image Processing**: QrCode generation
- **Form Validation**: Joi, Zod, Ant Design form validators

## Struktur Folder

### Backend (`be/`)
```
be/
├── src/
│   ├── config/           # Konfigurasi DB, environment
│   │   └── db/          # Konfigurasi koneksi SQL Server
│   ├── modules/         # API endpoints dibagi berdasarkan domain
│   │   ├── auth/        # Autentikasi & otorisasi
│   │   ├── cmms/        # Computerized Maintenance Management System
│   │   ├── itam/        # IT Asset Management
│   │   ├── itsm/        # IT Service Management
│   │   └── shared/      # Model & utilities umum
│   ├── controllers/     # Handler request
│   ├── middlewares/     # Middleware khusus app
│   ├── models/          # Definisi model Sequelize (di-index.js)
│   ├── jobs/           # Job background (Bull)
│   └── seeders/        # Data seed awal
├── package.json        # Dependencies backend
├── server.js          # Entry point Express
└── scripts/            # Utilities scripting
```

### Frontend (`fe/`)
```
fe/
├── src/
│   ├── app/            # Root router & routing setup
│   │   └── router/      # React Router configuration
│   ├── modules/        # Komponen & halaman dipisahkan berdasarkan domain
│   │   ├── auth/        # Fitur otentikasi (login, register, forgot password)
│   │   ├── cmms/        # Halaman & komponen CMMS
│   │   ├── itam/        # Halaman & komponen ITAM
│   │   ├── itsm/        # Halaman & komponen ITSM
│   │   └── shared/      # Components & hooks umum
│   ├── layouts/        # Template halaman (header, sidebar, dll)
│   ├── shared/          # Components umum, hooks, services, utils
│   ├── assets/          # Static assets (images, icons)
│   ├── styles/          # Global styles & tema
│   └── App.jsx         # Komponen root
├── package.json       # Dependencies frontend
└── public/            # Static assets publik
```

### Utilities (`./`)
- `check.js` - Script pengecekan kesehatan API
- `import-excel.js` / `read-excel.js` - Skrip impor/ekspor Excel (backend)
- `sync.js` / `sync_log_sheets.js` - Utilitas sinkronisasi
- Scripts lain untuk tugas administratif

## Cara Menjalankan Project

### Prasyarat
```bash
# Backend
node --version >= 14
npm atau yarn
SQL Server instance dengan izin DB
server Redis (opsional, diperlukan untuk Bull queue)

# Frontend
node --version >= 14
npm atau yarn
```

### Setup Lingkungan

1. **Backend**
```bash
cd be
# Install dependencies (isi .env dengan variabel yang benar)
npm install

# Buat .env dari contoh
# Sesuaikan DATABASE_URL, JWT_SECRET, REDIS_URL, FRONTEND_URL
scp be/.env.example be/.env

# Jalankan migrasi DB (buat tabel)
npm run migrate

# Jalankan seed (data awal)
npm run seed

# Jalankan dev (nodemon)
npm run dev
```

2. **Frontend**
```bash
cd fe
npm install
# Edit .env untuk API_BASE_URL
scp fe/.env.example fe/.env

# Jalankan dev (Vite)
npm run dev
```

### Jalankan Production
```bash
# Backend
cd be
npm run start

# Frontend
cd fe
npm run build && npm run preview
```

## Environment

### Variabel Lingkungan Backend (`be/.env`)
- `DATABASE_URL` - Koneksi string SQL Server
- `JWT_SECRET` - Secret untuk JWT signing
- `REDIS_URL` - URL Redis untuk Bull
- `FRONTEND_URL` - Origin frontend (untuk CORS)
- `PORT` - Port server (default: 3000)
- `NODE_ENV` - 'development' atau 'production'

### Variabel Lingkungan Frontend (`fe/.env`)
- `VITE_API_BASE_URL` - URL dasar API
- `VITE_WS_ENDPOINT` - WebSocket endpoint
- `VITE_APP_NAME` - Nama aplikasi

### Konfigurasi Database
Database menggunakan Microsoft SQL Server dengan skema:
- `yearly_standard_maintenances` - Standar tahunan
- `standard_maintenances` - Perangkat per tahun
- `standard_maintenance_details` - Kelompok/fungsi
- `standard_maintenance_checks` - Item pengecekan
- `maintenance_schedules` - Jadwal
- `maintenance_log_sheets` - Log harian
- `assets`, `asset_categories`, `asset_locations` - Aset IT
- `work_orders`, `tickets` - Permintaan & pekerjaan
- `users`, `roles`, `permissions` - Otentikasi

## User Role

Sistem menggunakan **Role-Based Access Control (RBAC)** dengan hierarki:

### Super Admin
- Akses penuh ke semua modul
- Kelola pengguna, role, & permissions
- Atur perusahaan, departemen, level jabatan
- Akses semua laporan & analytics

### IT Staff (Tier 1)
- Kelola aset (create, read, update)
- Buat & tangani tiket IT
- Jalankan pekerjaan pemeliharaan
- Lihat & log sheet harian
- Akses assets di departemennya

### IT Staff (Tier 2)
- Kelola aset di bagiannya saja
- Tangan tangani tiket yang ditugaskan
- Jalankan pekerjaan pemeliharaan di area
- Lihat log sheet yang dibuat sendiri

### Manager
- Lihat aset di departemen
- Review tiket & pekerjaan yang ditugaskan
- Lihat laporan performa
- Approvement permintaan tertentu

### End User
- Buat tiket IT
- Lihat status permintaan sendiri
- Akses minimal ke aset

## Modul Utama

### 1. IT Asset Management (ITAM)
**Fokus**: Pengadaan, pelacakan, dan lifecycle manajemen aset TI
**Fitur Utama**:
- Manajemen kategori aset (perangkat keras, perangkat lunak, lisensi)
- Pelacakan lokasi & penyimpanan aset
- Manajemen suku cadang & stok
- Transaksi inventory (masuk/keluar)
- Budget aset & pelacakan biaya
- Lifecycle log untuk setiap aset
- Decommissioning & penghapusan

### 2. IT Service Management (ITSM)
**Fokus**: Manajemen tiket & permintaan layanan TI
**Fitur Utama**:
- Buat tiket & permintaan layanan
- Klasifikasi & tagging tiket
- Pengalihan otomatis & routing
- SLA tracking & SLA breach detection
- Notifikasi & SLA warning (email, in-app)
- Managemen pengetahuan (artikel basis)

### 3. Computerized Maintenance Management System (CMMS)
**Fokus**: Manajemen preventif & reaktif pemeliharaan
**Fitur Utama**:
- Standar pemeliharaan tahunan
- Struktur standar pemeliharaan bertingkat (standar → detail → pengecekan)
- Jadwal pemeliharaan otomatis berdasarkan kalender
- Log sheet harian (inspeksi, perbaikan, penggantian)
- Manajemen pekerjaan pemeliharaan
- Pemantauan KPI & performa

### 4. Authentication & Authorization
**Fokus**: Keamanan & akses kontrol pengguna
**Fitur Utama**:
- Login SSO (untuk enterprise)
- Role-based access control (RBAC)
- Session management dengan refresh token
- Audit logging (semua tindakan)
- Multi-layer permissions

### 5. Shared Infrastructure
**Fokus**: Data & utilities umum
**Fitur Utama**:
- Master data: companies, departments, job levels
- Holiday & calendar management
- System-wide audit logs
- Utilities & helpers umum

## Contoh Pertanyaan yang Dijawab

1. **"Ini project apa?"**
   - IT-Maintenance adalah sistem manajemen aset & pemeliharaan TI terintegrasi yang mencakup IT Asset Management (ITAM), IT Service Management (ITSM), dan Computerized Maintenance Management System (CMMS) untuk perusahaan.

2. **"Framework yang dipakai apa?"**
   - Backend: Node.js + Express + Sequelize ORM
   - Frontend: React 19 + Vite + Ant Design 6
   - Database: Microsoft SQL Server

3. **"Cara run project gimana?"**
   - Backend: `cd be && npm run migrate && npm run seed && npm run dev`
   - Frontend: `cd fe && npm run dev`
   - Production: `cd be && npm start` dan `cd fe && npm run build && npm run preview`

4. **"Aset apa saja yang bisa dikelola?"**
   - Server, workstation, laptop, monitor, printer, scanner, UPS, router, switch, firewall, CCTV, proyektor, perangkat jaringan, lisensi perangkat lunak, dan komponen suku cadang lainnya.

5. **"Siapa saja yang bisa mengakses apa?"**
   - Tergantung role: Super Admin (akses penuh), IT Staff (manajemen aset & tiket), Manager (view hanya), End User (buat tiket).

6. **"Bagaimana dengan maintenance?"**
   - Sistem mendukung pemeliharaan preventif (standar tahunan, jadwal), pemeliharaan korektif (work order), dan tracking log sheet harian.

7. **"Bagaimana dengan budgeting?"**
   - Setiap aset dapat dialokasikan budget tahunan, dengan tracking penggunaan dan peringatan saat melebihi anggaran.

## Catatan Tambahan

- Sistem menggunakan Docker Compose untuk lokal development (opsional)
- Caching Redis diterapkan untuk query yang sering dan sesi pengguna
- Scheduled jobs (Bul) untuk task background
- WebSocket real-time updates untuk status tiket, notifikasi, dan sinyal
- Export Excel & PDF tersedia untuk semua laporan
- Alerting terintegrasi dengan Isyarat bot (Telegram) untuk notifikasi real-time