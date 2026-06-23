# API Reference: IT-Maintenance

> **Base URL:** `http://localhost:3000/api`
> **Authentication:** Bearer Token (JWT) di header `Authorization`
> **Content-Type:** `application/json`

---

## 1. Authentication

### Header yang Wajib

Semua request (kecuali login) membutuhkan header:

```http
Authorization: Bearer <token>
```

### Mendapatkan Token

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "user_id": 1,
      "username": "admin",
      "full_name": "Admin User",
      "email": "admin@company.com",
      "roles": ["SUPERADMIN"]
    }
  }
}
```

### Refresh Token

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "string (required)"
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "email": "admin@company.com",
    "is_active": true,
    "roles": ["SUPERADMIN"],
    "department": "IT"
  }
}
```

### Logout

```
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 2. Response Error Format

### Error Response (Standard)

```json
{
  "success": false,
  "message": "Error message in English or Indonesian",
  "error": "Optional: detailed error for development"
}
```

### Common Error Codes

| Status | Message | Penjelasan |
|--------|---------|------------|
| 400 | Bad Request | Request body tidak valid / field wajib kosong |
| 401 | Unauthorized | Token tidak ada, expired, atau invalid |
| 403 | Forbidden | User tidak punya akses ke resource ini |
| 404 | Not Found | Data tidak ditemukan |
| 409 | Conflict | Duplikasi data (username sudah ada, dll) |
| 422 | Validation Error | Field validation gagal |
| 500 | Internal Server Error | Server error |

---

## 3. Query Parameter & Pagination

### Pagination

Semua endpoint `GET` yang mengembalikan list mendukung pagination:

```
GET /api/assets?page=1&pageSize=20
```

**Query Parameter:**
| Parameter | Default | Deskripsi |
|-----------|---------|-----------|
| `page` | 1 | Nomor halaman |
| `pageSize` | 20 | Jumlah item per halaman (max: 100) |
| `search` | - | Search by name/code/title |
| `sort` | - | Field untuk sorting |
| `order` | DESC | ASC atau DESC |

**Response dengan Pagination:**
```json
{
  "success": true,
  "data": {
    "rows": [...],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

### Filtering

Beberapa endpoint mendukung filter:

```
GET /api/maintenance-schedule?yearly_standard_id=1
GET /api/assets?status=ACTIVE&category_id=5
GET /api/tickets?status=OPEN&priority=HIGH
```

---

## 4. API Endpoints

### A. Auth Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/refresh` | Refresh token | ❌ |
| POST | `/auth/logout` | Logout | ✅ |
| GET | `/auth/me` | Get current user | Optional |

---

### B. User Management

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/users` | List all users | SUPERADMIN, ADMIN |
| GET | `/users/:id` | Get user by ID | SUPERADMIN, ADMIN |
| POST | `/users` | Create user | SUPERADMIN, ADMIN |
| PUT | `/users/:id` | Update user | SUPERADMIN, ADMIN |
| DELETE | `/users/:id` | Delete user | SUPERADMIN, ADMIN |
| GET | `/users/roles` | List all roles | ✅ All authenticated |

---

### C. Asset Management (ITAM)

#### Asset CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets` | List all assets (with pagination) |
| GET | `/assets/next-code` | Get next asset code |
| GET | `/assets/:id` | Get asset by ID |
| GET | `/assets/:id/history` | Get asset history |
| GET | `/assets/:id/lifecycle` | Get asset lifecycle |
| POST | `/assets` | Create new asset |
| PUT | `/assets/:id` | Update asset |
| PATCH | `/assets/:id` | Update asset (partial) |
| DELETE | `/assets/:id` | Delete asset |
| POST | `/assets/bulk-import` | Import assets from Excel |

#### Asset Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/:id/change-user` | Change assigned user |
| POST | `/assets/:id/transfer-owner` | Transfer ownership |
| POST | `/assets/:id/transfer-department` | Transfer department |
| POST | `/assets/:id/move-location` | Move to new location |
| POST | `/assets/:id/generate-qr` | Generate QR code |
| GET | `/assets/:id/qr` | Get QR code image |

**Example Request Body (Create Asset):**
```json
{
  "category_id": 5,
  "location_id": 10,
  "asset_code": "IT-2024-001",
  "asset_name": "Laptop Dell Inspiron",
  "serial_number": "DL-12345",
  "status": "ACTIVE",
  "purchase_date": "2024-01-15",
  "division": "IT Department",
  "department": "Infrastructure",
  "owner_name": "John Doe",
  "nik": "NIK-001",
  "hostname": "IT-NB-001",
  "ip_main": "192.168.1.100",
  "cls_managerial": true,
  "cls_meeting": false,
  "cls_aktivitas_khusus": false,
  "cls_officer_admin": true,
  "cls_teknikal": false,
  "cls_operator": false,
  "cls_aplikasi_wms": false,
  "cls_vms": false,
  "cls_cctv_view": false,
  "cls_station_delivery": false,
  "cls_aplikasi_gathering": false,
  "cls_oqc": false,
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "operating_system": "Windows 11",
  "os_version": "23H2",
  "is_domain_join": true,
  "antivirus_status": "Active"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Created",
  "data": {
    "asset_id": "550e8400-e29b-41d4-a716-446655440000",
    "asset_code": "IT-2024-001",
    "asset_name": "Laptop Dell Inspiron",
    "status": "ACTIVE",
    ...
  }
}
```

#### Asset Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/asset-categories` | List all categories |
| POST | `/asset-categories` | Create category |
| PUT | `/asset-categories/:id` | Update category |
| DELETE | `/asset-categories/:id` | Delete category |

#### Asset Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/asset-budgets` | List all budgets |
| POST | `/asset-budgets/import` | Import budgets from Excel |

#### Asset Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/:id/files` | Upload file |
| GET | `/assets/:id/files` | List files |
| DELETE | `/assets/files/:fileId` | Delete file |

#### Asset Lifecycles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lifecycles` | List all lifecycles |
| GET | `/lifecycles/:id` | Get lifecycle by ID |

---

### D. Maintenance Management (CMMS)

#### Yearly Standard Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/standard-maintenance/years` | List all yearly standards |
| GET | `/standard-maintenance/years/:id` | Get yearly standard by ID |
| POST | `/standard-maintenance/years` | Create yearly standard |
| PUT | `/standard-maintenance/years/:id` | Update yearly standard |
| DELETE | `/standard-maintenance/years/:id` | Delete yearly standard |
| POST | `/standard-maintenance/years/:id/request-delete` | Request delete |

**Create Yearly Standard:**
```json
{
  "tahun": 2024,
  "judul": "Standar Maintenance 2024"
}
```

**Request Delete:**
```json
{
  "alasan_hapus": "Tidak diperlukan lagi"
}
```

#### Standard Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/standard-maintenance` | List all standards |
| GET | `/standard-maintenance/:id` | Get standard by ID |
| POST | `/standard-maintenance` | Create standard |
| PUT | `/standard-maintenance/:id` | Update standard |
| DELETE | `/standard-maintenance/:id` | Delete standard |
| DELETE | `/standard-maintenance/detail/:id` | Delete detail |
| POST | `/standard-maintenance/flat` | Upsert flat standard |
| DELETE | `/standard-maintenance/flat/:check_id` | Delete flat check |

**Create Standard:**
```json
{
  "yearly_standard_id": 1,
  "kategori": "IT Equipment",
  "subKategori": "Computer",
  "namaPerangkat": "Desktop",
  "tipePerangkat": "Tower",
  "subPerangkat": "Workstation",
  "maintenanceDetails": [
    {
      "fungsi": "Pembersihan Hardware",
      "deskripsi": "Pembersihan debu dan kotoran",
      "pengecekanList": [
        {
          "pengecekan": "Bersihkan CPU",
          "standard": "Tanpa debu berlebih",
          "periodik": "1 Bulan",
          "bagian": "CPU",
          "metode": "Visual + Manual",
          "alat": "Vacuum Cleaner"
        }
      ]
    }
  ]
}
```

#### Maintenance Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance-schedule` | List all schedules |
| POST | `/maintenance-schedule` | Create schedule |
| POST | `/maintenance-schedule/generate` | Generate schedules |
| PUT | `/maintenance-schedule/:id` | Update schedule |
| PATCH | `/maintenance-schedule/:id/cancel` | Cancel schedule |

**Generate Schedules:**
```json
{
  "yearly_standard_id": 1
}
```

**Create Schedule:**
```json
{
  "asset_ids": ["uuid-1", "uuid-2"],
  "yearly_standard_id": 1,
  "standard_maintenance_id": 5,
  "periodik": "1 Bulan",
  "next_maintenance_date": "2024-02-01T08:00:00Z",
  "next_maintenance_end_date": "2024-02-01T17:00:00Z"
}
```

**Cancel Schedule:**
```json
{
  "reason": "Asset sedang dalam perbaikan"
}
```

#### Maintenance Log Sheet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance-log-sheets` | List all log sheets |
| POST | `/maintenance-log-sheets` | Create log sheet |
| PUT | `/maintenance-log-sheets/:id` | Update log sheet |
| DELETE | `/maintenance-log-sheets/:id` | Delete log sheet |

**Create Log Sheet:**
```json
{
  "schedule_id": 1,
  "temuan": "CPU berdebu, fan tidak berputar optimal",
  "tindakan": "Pembersihan debu, penggantian fan",
  "status_temuan": "OPEN",
  "tanggal_temuan": "2024-02-01T10:30:00Z"
}
```

---

### E. IT Service Management (ITSM)

#### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets` | List all tickets |
| GET | `/tickets/:id` | Get ticket by ID |
| POST | `/tickets` | Create ticket |
| PUT | `/tickets/:id` | Update ticket |
| DELETE | `/tickets/:id` | Delete ticket |

**Create Ticket:**
```json
{
  "title": "Laptop tidak menyala",
  "description": "Laptop user Finance tidak bisa dinyalakan setelah update Windows",
  "priority": "HIGH",
  "assigned_to": 5
}
```

**Update Ticket:**
```json
{
  "status": "IN_PROGRESS",
  "assigned_to": 3,
  "description": "Updated: sedang dalam perbaikan"
}
```

#### Work Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/work-orders` | List all work orders |
| GET | `/work-orders/:id` | Get work order by ID |
| POST | `/work-orders` | Create work order |
| PUT | `/work-orders/:id` | Update work order |
| DELETE | `/work-orders/:id` | Delete work order |
| GET | `/work-orders/dashboard/summary` | Get dashboard summary |
| GET | `/work-orders/asset/:assetId/predictive` | Get predictive health |
| GET | `/work-orders/asset/:assetId/health` | Get asset health status |
| GET | `/work-orders/asset/:assetId/auto-maintenance` | Auto maintenance check |
| GET | `/work-orders/asset/:assetId/ai-predictive` | AI predictive analytics |

**Create Work Order:**
```json
{
  "ticket_id": 1,
  "asset_id": "550e8400-e29b-41d4-a716-446655440000",
  "assigned_to": 3,
  "wo_number": "WO-2024-001",
  "title": "Perbaikan Laptop",
  "priority": "HIGH",
  "status": "OPEN"
}
```

---

### F. Inventory Management (ITAM)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List all transactions |
| POST | `/inventory/stock-in` | Stock in |
| POST | `/inventory/stock-out` | Stock out |
| POST | `/inventory/adjustment` | Adjustment |

**Stock In:**
```json
{
  "part_id": 1,
  "qty": 10,
  "wo_id": null,
  "notes": "Pembelian spare part baru"
}
```

---

### G. Holidays Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/holidays` | List all holidays |
| POST | `/holidays` | Create holiday |
| PUT | `/holidays/:id` | Update holiday |
| DELETE | `/holidays/:id` | Delete holiday |

**Create Holiday:**
```json
{
  "holiday_date": "2024-01-01",
  "description": "Tahun Baru Masehi",
  "holiday_type": "NATIONAL_HOLIDAY"
}
```

---

## 5. Status Values Reference

### Asset Status
- `ACTIVE` — Aktif digunakan
- `REPAIR` — Dalam perbaikan
- `RETIRED` — Tidak aktif (di-retire)
- `DISPOSED` — Dihapus/dibuang

### Maintenance Schedule Status
- `ACTIVE` — Jadwal aktif
- `CANCELLED` — Jadwal dibatalkan
- `COMPLETED` — Jadwal selesai

### Maintenance Log Sheet Status
- `OPEN` — Belum disubmit
- `SUBMITTED` — Sudah disubmit
- `APPROVED` — Sudah di-approve

### Ticket Status
- `OPEN` — Belum ditugaskan
- `IN_PROGRESS` — Sedang dikerjakan
- `RESOLVED` — Selesai
- `CLOSED` — Ditutup
- `CANCELLED` — Dibatalkan

### Work Order Status
- `OPEN` — Belum mulai
- `IN_PROGRESS` — Sedang dikerjakan
- `COMPLETED` — Selesai
- `CLOSED` — Ditutup
- `FAILED` — Gagal

### Yearly Standard Maintenance Status
- `DRAFT` — Baru dibuat
- `ACTIVE` — Sudah aktif
- `REJECTED` — Ditolak
- `WAITING_FOR_DELETION` — Menunggu approval hapus

---

## 6. Contoh Request Lengkap

### Login & Get Asset

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Step 2: Get Assets (with token)**
```bash
curl -X GET http://localhost:3000/api/assets?page=1&pageSize=10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "asset_id": "550e8400-e29b-41d4-a716-446655440000",
        "asset_code": "IT-2024-001",
        "asset_name": "Laptop Dell Inspiron",
        "status": "ACTIVE",
        "category": {
          "category_id": 5,
          "category_name": "Laptop"
        },
        "location": {
          "location_id": 10,
          "location_name": "Gedung A - Lantai 2"
        }
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

### Create Maintenance Schedule

```bash
curl -X POST http://localhost:3000/api/maintenance-schedule/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"yearly_standard_id": 1}'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 25 new maintenance schedules.",
  "data": {
    "created": 25
  }
}
```

---

## 7. Notes

1. **Semua timestamp menggunakan UTC** — format ISO 8601 (contoh: `2024-02-01T10:30:00Z`)
2. **UUID untuk asset_id** — format: `550e8400-e29b-41d4-a716-446655440000`
3. **BigInt untuk ID lainnya** — auto-increment integer
4. **Boolean fields** — gunakan `true` atau `false`
5. **File upload** — gunakan `multipart/form-data` untuk upload file
6. **Error handling** — selalu cek `success` field dalam response