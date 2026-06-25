# Refactor Goals: IT-Maintenance

> Dokumen ini mendefinisikan **goals dan target refactoring** untuk IT-Maintenance.
> Update: 2026-06-24 — Instruksi baru dari Mike

---

## GOAL 1: Standard Maintenance Import via Excel

### 1.1 Context

**Kondisi Saat Ini:**
- Schedule dan Logsheet Abnormal sudah APPROVED dan berfungsi
- Yang perlu di-develop sekarang adalah **Standard Maintenance** sebagai sumber data untuk child menu Schedule
- Network dan Cybersecurity saat ini terpisah → **DIGABUNG** jadi satu kategori

**Metode:**
- Import Excel (bukan input manual)
- Setiap kategori punya template Excel sendiri

### 1.2 Excel Mapping

| Kategori | File Excel | Sheet |
|----------|-----------|-------|
| **Hardware** | `HW-STANDAR MAINTENANCE DAN JADWAL 2026.xlsx` | Jadwal Hardware |
| **Software HW** | `SW-INFRA-STANDAR MAINTENANCE DAN JADWAL 2026.xlsx` | Jadwal Hardware |
| **Application** | `APLIKASI-STANDAR MAINTENANCE DAN JADWAL 2026.xlsx` | Jadwal Maintenance Aplikasi |
| **Network & Cybersecurity** *(digabung)* | `Cyber Network-STANDAR MAINTENANCE DAN JADWAL 2026.xlsx` | Jadwal Cyber & Network |

### 1.3 Excel Column Structure (Header Row)

Berdasarkan analisis file sample:

```
Row 5 (Header Utama):
| No | Kategori | Nama Perangkat | Sub Perangkat | No | Fungsi | DESC | Pengecekan | Pengecekan Normal | ... | Periodik | JANUARI | ... | DESEMBER |

Row 7 (Sub-Header Pengecekan Normal):
| Standar | Bagian | Methode | Alat | Standar | Bagian | Methode | Alat | Standar | Bagian | Methode | Alat | Standar | Bagian | Methode | Alat |

Row 8 (Bulan - ada perulangan kolom untuk 4 sub-kategori):
| 1 | 2 | 3 | ... | 31 | 1 | 2 | 3 | ... | 31 | (dst untuk 12 bulan)
```

### 1.4 Kolom yang Di-import ke Database

Mapping Excel → Database:

| Kolom Excel | Kolom DB | Keterangan |
|-------------|----------|------------|
| Kategori | `standard_maintenances.kategori` | Nama kategori设备 |
| Nama Perangkat | `standard_maintenances.namaPerangkat` | Nama设备 |
| Sub Perangkat | `standard_maintenances.subPerangkat` | Sub jenis设备 |
| Fungsi | `standard_maintenance_details.fungsi` | Fungsi pengecekan |
| DESC | `standard_maintenance_details.deskripsi` | Deskripsi |
| Pengecekan | `standard_maintenance_checks.pengecekan` | Item yang dicek |
| Standar | `standard_maintenance_checks.standard` | Standar normal |
| Bagian | `standard_maintenance_checks.bagian` | Bagian yang dicek |
| Methode | `standard_maintenance_checks.metode` | Metode pengecekan |
| Alat | `standard_maintenance_checks.alat` | Alat yang digunakan |
| Periodik | `standard_maintenance_checks.periodik` | Frekuensi (1X/W, 1X/M, dll) |

### 1.5 Database Changes

**Table: `standard_maintenances`**

```sql
-- Tambah kolom untuk tracking import
ALTER TABLE ITAM.dbo.standard_maintenances
ADD 
    subKategori NVARCHAR(100) NULL,      -- Sub kategori (NVR, Camera, dll)
    tipePerangkat NVARCHAR(100) NULL,    -- Tipe设备
    source_file NVARCHAR(255) NULL,      -- Nama file Excel asal
    imported_by BIGINT NULL,             -- User yang import
    imported_at DATETIMEOFFSET NULL;     -- Kapan di-import
```

**Table: `standard_maintenance_details`**

```sql
-- Sudah ada, tidak perlu ubah
-- Kolom: fungsi, deskripsi
```

**Table: `standard_maintenance_checks`**

```sql
-- Tambah kolom bagian
ALTER TABLE ITAM.dbo.standard_maintenance_checks
ADD 
    bagian NVARCHAR(255) NULL;           -- Bagian设备 yang dicek
```

### 1.6 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/standard-maintenance/import` | Import dari Excel |
| GET | `/api/standard-maintenance/template/:kategori` | Download template Excel |
| GET | `/api/standard-maintenance` | List all (dengan filter kategori) |

**Request Import:**
```json
{
  "file": "(multipart/form-data)",
  "kategori": "HARDWARE" | "SOFTWARE_HW" | "APPLICATION" | "NETWORK_CYBER"
}
```

**Response Import:**
```json
{
  "success": true,
  "message": "Import berhasil",
  "data": {
    "total_rows": 443,
    "imported": 440,
    "skipped": 3,
    "errors": []
  }
}
```

### 1.7 Template Import Excel

Template harus dibuat dengan format:
1. **Header row** yang sama dengan format asli
2. **Contoh data** (1-2 baris sample)
3. **Guide penggunaan** di sheet terpisah atau sebagai comment

**File location:** `@docs/templates/`
- `template_hardware.xlsx`
- `template_software_hw.xlsx`
- `template_application.xlsx`
- `template_network_cyber.xlsx`

### 1.8 Import Logic

```
1. Baca Excel file
2. Skip header rows (row 1-8)
3. Untuk setiap data row:
   a. Extract: Kategori, NamaPerangkat, SubPerangkat
   b. Extract: Fungsi, DESC
   c. Extract: Pengecekan, Standar, Bagian, Methode, Alat, Periodik
   c. Cek duplikat (kategori + namaPerangkat + pengecekan)
   d. Insert ke standard_maintenances (jika baru)
   e. Insert ke standard_maintenance_details
   f. Insert ke standard_maintenance_checks
4. Return summary
```

---

## GOAL 2: User Management — Profile Page

### 2.1 Context

**Kondisi Saat Ini:**
- User Management sudah ada tapi belum fungsional
- Child menu: Profile, Security, Activity Log

**Yang Dikembangkan:**
- **HANYA PROFILE** (Security & Activity Log tidak usah dulu)
- Page sebelumnya belum fungsional → buat baru

### 2.2 Feature Requirements

| Fitur | Keterangan | Status |
|-------|-----------|--------|
| **Profile Picture** | Upload/ganti foto profil | Wajib |
| **Nama Lengkap** | Edit full name | Wajib |
| **Email** | Tampil, readonly | Wajib |
| **Ganti Password** | Form ganti password (old + new) | Wajib |
| **2FA** | ❌ **HILANGKAN** - Jangan ada | Dihapus |

### 2.3 Database Changes

**Table: `users`**

```sql
-- Tambah kolom untuk profile
ALTER TABLE ITAM.dbo.users
ADD 
    profile_picture NVARCHAR(500) NULL,  -- Path/filename foto profil
    phone NVARCHAR(30) NULL;              -- Nomor telepon (opsional)

-- Hapus kolom 2FA jika ada
-- (Tidak perlu karena kemungkinan belum ada di DB)
```

### 2.4 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile user login |
| PUT | `/api/users/profile` | Update profile (nama, telepon) |
| PUT | `/api/users/profile/picture` | Upload profile picture |
| PUT | `/api/users/profile/password` | Ganti password |

**Response Profile:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "email": "admin@company.com",
    "phone": "08123456789",
    "profile_picture": "/uploads/profile/abc123.jpg",
    "department": "IT",
    "roles": ["SUPERADMIN"]
  }
}
```

**Update Profile:**
```json
{
  "full_name": "Nama Baru",
  "phone": "08123456789"
}
```

**Ganti Password:**
```json
{
  "current_password": "password_lama",
  "new_password": "password_baru",
  "confirm_password": "password_baru"
}
```

### 2.5 Frontend Components

```
fe/src/modules/itam/userManagement/
├── pages/
│   └── ProfilePage.jsx           # Main profile page
├── components/
│   ├── ProfilePicture.jsx        # Upload/ganti foto
│   ├── ProfileForm.jsx           # Form edit nama & telepon
│   ├── EmailDisplay.jsx          # Email readonly
│   ├── PasswordChange.jsx        # Form ganti password
│   └── ProfileHeader.jsx         # Header dengan foto & nama
└── services/
    └── profileService.js         # API calls
```

### 2.6 Profile Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                    Profile                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌─────────────────────┐                              │
│         │                     │                              │
│         │    [Foto Profil]    │  ← Klik untuk ganti          │
│         │                     │                              │
│         └─────────────────────┘                              │
│              Admin User                                      │
│              admin@company.com                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Informasi Profil                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Nama Lengkap  │ [Admin User                    ]    │    │
│  │ Email         │ [admin@company.com        ] (RO)   │    │
│  │ No. Telepon   │ [08123456789               ]       │    │
│  │                                   [Simpan]          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Ganti Password                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Password Lama  │ [••••••••                    ]    │    │
│  │ Password Baru  │ [••••••••                    ]    │    │
│  │ Konfirmasi     │ [••••••••                    ]    │    │
│  │                                    [Ganti Password]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Standard Maintenance Import
1. [ ] Buat template Excel untuk 4 kategori
2. [ ] Modif database (tambah kolom)
3. [ ] Buat backend API import
4. [ ] Buat frontend import page
5. [ ] Testing import flow

### Phase 2: Profile Page
1. [ ] Modif database (tambah kolom profile_picture)
2. [ ] Buat backend API profile
3. [ ] Buat frontend profile page
4. [ ] Upload profile picture
5. [ ] Ganti password flow
6. [ ] Testing profile flow

---

## Catatan Penting

1. **Network & Cybersecurity DIGABUNG** — Tidak ada lagi pemisahan
2. **2FA TIDAK ADA** — Jangan implementasi fitur 2FA
3. **Excel Import = Input Data** — Standard Maintenance diisi via Excel, bukan manual input
4. **Schedule & Abnormal = DONE** — Tidak perlu diubah
5. **Template wajib ada** — Untuk setiap kategori, buatkan template + guide

---

## File Reference

- **Sample Excel:** `@docs/sample/` (4 file)
- **Template Output:** `@docs/templates/` (akan dibuat)
- **Database Schema:** Lihat `ERD.md`
- **API Existing:** Lihat `API_REFERENCE.md`

---

Last Updated: 2026-06-24
Author: Karsa (Agent) based on Mike's instructions
