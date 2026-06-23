# Refactor Goals: ITAM Maintenance Module

> Dokumen ini mendefinisikan **goals dan target refactoring** untuk modul maintenance di ITAM.
> Referensi: `@docs/sample/HW-STANDAR MAINTENANCE DAN JADWAL 2026.xlsx`
> Source: `schema.txt` (DB terkini)

---

## 1. Arsitektur Navigasi Baru

### 1.1 Tab Layout (Top Level)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Hardware]  [Software HW]  [Application]  [Network]  [Cybersecurity]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Child Links per Tab:                                           │
│   ┌──────────────┬──────────┬─────────────────┐                 │
│   │  Standard     │ Schedule │  Sheet Abnormal │                 │
│   │  Maintenance  │          │                 │                 │
│   └──────────────┴──────────┴─────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Child Pages per Kategori

| Child Page | Fungsi |
|------------|--------|
| **Standard Maintenance** | Define standar pengecekan & periodik |
| **Schedule** | Tabel jadwal dengan checkbox per tanggal |
| **Sheet Abnormal** | Daftar log abnormal yang pernah terjadi |

---

## 2. UI Structure & Columns

### 2.1 Standard Maintenance View

Tabel utama seperti Excel dengan kolom:

| # | Kolom | DB Source (dari schema.txt) | Tipe |
|---|-------|-----------------------------|------|
| 1 | **No** | Auto-increment | Number |
| 2 | **Kategori** | `standard_maintenances.kategori` | Text |
| 3 | **Nama Perangkat** | `standard_maintenances.namaPerangkat` | Text |
| 4 | **Sub Perangkat** | `standard_maintenances.subPerangkat` | Text |
| 5 | **No Detail** | Sequence per kategori | Number |
| 6 | **Fungsi** | `standard_maintenance_details.fungsi` | Text |
| 7 | **Desc** | `standard_maintenance_details.deskripsi` | Textarea |
| 8 | **Pengecekan** | `standard_maintenance_checks.pengecekan` | Text |
| 9 | **Pengecekan Normal** | - | Group |
| 9a | — Standar | `standard_maintenance_checks.standard` | Text |
| 9b | — Metode | `standard_maintenance_checks.metode` | Text |
| 9c | — Alat | `standard_maintenance_checks.alat` | Text |
| 10 | **Periodic** | `maintenance_schedules.periodik` | Select |
| 11 | **Bulan (JANUARI-DESEMBER)** | Generate dari periodik | Checkbox |

### 2.2 Schedule View (Table + Checkbox per Tanggal)

```
┌────┬──────┬──────────┬────────┬────┬──────┬──────┬──────┬──────────────────────────────┐
│ No │ Ktg  │ Perangkat│ Sub Pk │ No │ Fung │ Desc │ Std  │        JANUARI 2026          │
│    │      │          │        │    │ si   │       │ + P  │ ┌────┬────┬────┬────┬────┐  │
│    │      │          │        │    │      │       │ er   │ │w1  │w2  │w3  │w4  │w5  │  │
├────┼──────┼──────────┼────────┼────┼──────┼──────┼──────┼────┼────┼────┼────┼────┤  │
│ 1  │ CCTV │ Camera   │ NVR    │ 1  │ Reco │ Check│ ✓    │ [✓]│ [ ]│ [✓]│ [ ]│ [✓]│  │
│    │      │          │        │    │ rding│ fungs│      │    │    │    │    │    │  │
│    │      │          │        │ 2  │ HDD  │ Check│ ✓    │ [✗]│ [✗]│ [✓]│ [✓]│ [✓]│  │
├────┼──────┼──────────┼────────┼────┼──────┼──────┼──────┼────┼────┼────┼────┼────┤  │
│ 2  │ CCTV │ Camera   │ DOME  │ 1  │ Lens │ Bersih│ ✓   │ [ ]│ [ ]│ [ ]│ [ ]│ [✗]│  │
│    │      │          │        │    │      │ kan  │      │    │    │    │    │    │  │
└────┴──────┴──────────┴────────┴────┴──────┴──────┴──────┴────┴────┴────┴────┴────┘

Legend Checkbox:
  ✓  = Actual (hijau) — sudah dilakukan normal
  ✗  = Abnormal (merah) — ada masalah, klik buka modal
  □  = Plan (abu-abu) — belum dilakukan
```

### 2.3 Legend Behavior

| Legend | Visual | Action |
|--------|--------|--------|
| **Actual** ✓ | Checkbox hijau | Toggle ke Plan □ |
| **Plan** □ | Checkbox abu | Toggle ke Actual ✓ |
| **Abnormal** ✗ | Checkbox merah | **Buka modal input deskripsi & tindakan** |

### 2.4 Abnormal Modal

```
┌─────────────────────────────────────────────────────┐
│  ⚠ Log Abnormal                                      │
├─────────────────────────────────────────────────────┤
│  Perangkat: CCTV Camera NVR                          │
│  Tanggal: 15 Januari 2026                            │
│  Pengecekan: Recording                               │
├─────────────────────────────────────────────────────┤
│  Deskripsi Kerusakan *                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ Hard disk tidak merekam, suara klik-klik... │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Tindakan *                                          │
│  ┌─────────────────────────────────────────────┐    │
│  │ Ganti HDD baru, backup konfigurasi NVR...  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Status Temuan: [ OPEN ▼ ]                          │
│                                                      │
│           [Batal]         [Submit Abnormal]          │
└─────────────────────────────────────────────────────┘
```

---

## 3. Database Changes (Based on schema.txt)

### 3.1 Tabel Existing yang Terkait

Dari `schema.txt`:
- `standard_maintenances` — store kategori, namaPerangkat, tipePerangkat, subPerangkat
- `standard_maintenance_details` — store fungsi, deskripsi
- `standard_maintenance_checks` — store pengecekan, standard, metode, alat
- `maintenance_schedules` — store asset, periodik, status, next_maintenance_date
- `maintenance_log_sheets` — store temuan, tindakan, status_temuan

### 3.2 New Table: `maintenance_actual`

```sql
CREATE TABLE ITAM.dbo.maintenance_actual (
    id BIGINT IDENTITY(1,1) NOT NULL,
    schedule_id BIGINT NOT NULL,
    check_id BIGINT NOT NULL,
    tanggal DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'PLAN',
    legend NVARCHAR(10) DEFAULT '□',
    created_by BIGINT NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),
    CONSTRAINT PK_maintenance_actual PRIMARY KEY (id),
    CONSTRAINT UQ_maintenance_actual UNIQUE (schedule_id, check_id, tanggal),
    CONSTRAINT FK_mnt_actual_schedule FOREIGN KEY (schedule_id) 
        REFERENCES ITAM.dbo.maintenance_schedules(id) ON DELETE CASCADE,
    CONSTRAINT FK_mnt_actual_check FOREIGN KEY (check_id) 
        REFERENCES ITAM.dbo.standard_maintenance_checks(id),
    CONSTRAINT FK_mnt_actual_user FOREIGN KEY (created_by)
        REFERENCES ITAM.dbo.users(user_id)
);
```

### 3.3 New Table: `maintenance_abnormal_logs`

```sql
CREATE TABLE ITAM.dbo.maintenance_abnormal_logs (
    id BIGINT IDENTITY(1,1) NOT NULL,
    actual_id BIGINT NOT NULL,
    deskripsi_kerusakan NVARCHAR(MAX) NOT NULL,
    tindakan NVARCHAR(MAX) NOT NULL,
    status_temuan NVARCHAR(50) DEFAULT 'OPEN',
    resolved_at DATETIMEOFFSET NULL,
    resolved_by BIGINT NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),
    CONSTRAINT PK_maintenance_abnormal_logs PRIMARY KEY (id),
    CONSTRAINT FK_mnt_abnormal_actual FOREIGN KEY (actual_id) 
        REFERENCES ITAM.dbo.maintenance_actual(id) ON DELETE CASCADE
);
```

### 3.4 Modify: `maintenance_schedules`

```sql
ALTER TABLE ITAM.dbo.maintenance_schedules
ADD periodik_type NVARCHAR(50) NULL,
    periodik_freq INT DEFAULT 1 NULL,
    periodik_unit NVARCHAR(10) DEFAULT 'w';
```

### 3.5 Modify: `maintenance_log_sheets`

```sql
ALTER TABLE ITAM.dbo.maintenance_log_sheets
ADD actual_id BIGINT NULL,
    CONSTRAINT FK_mnt_log_actual FOREIGN KEY (actual_id)
        REFERENCES ITAM.dbo.maintenance_actual(id);
```

---

## 4. API Changes

### 4.1 New Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/maintenance-schedule/generate-checkboxes` | Generate checkbox matrix setahun |
| GET | `/maintenance-schedule/:id/checkboxes` | Get status checkbox per tanggal |
| PUT | `/maintenance-actual/:id/status` | Update status checkbox |
| POST | `/maintenance-actual/:id/abnormal` | Submit abnormal ke modal |
| GET | `/maintenance-abnormal-logs` | Get semua abnormal log |
| GET | `/maintenance-abnormal-logs/:scheduleId` | Get abnormal log by schedule |
| GET | `/maintenance-schedule/monthly-view` | Get data untuk view schedule + checkbox bulanan |

### 4.2 Modified Endpoints

| Existing | Tambahan |
|----------|----------|
| `POST /maintenance-schedule/generate` | ✅ Auto-generate checkbox matrix |
| `GET /maintenance-schedule` | ✅ Include periodik detail & checkbox count |
| `POST /standard-maintenance` | ✅ Validasi kategori harus match parent tab |

### 4.3 Response Format (Checkbox View)

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 1,
    "periodik": "1x/w",
    "checkboxes": [
      {
        "date": "2026-01-05",
        "week": 1,
        "status": "ACTUAL",
        "legend": "✓",
        "actual_id": 1,
        "abnormal": null
      },
      {
        "date": "2026-01-12",
        "week": 2,
        "status": "ABNORMAL",
        "legend": "✗",
        "actual_id": 2,
        "abnormal": {
          "deskripsi_kerusakan": "Hard disk error",
          "tindakan": "Ganti HDD baru",
          "status": "OPEN"
        }
      },
      {
        "date": "2026-01-19",
        "week": 3,
        "status": "PLAN",
        "legend": "□",
        "actual_id": null,
        "abnormal": null
      }
    ]
  }
}
```

---

## 5. Logic Flow

### 5.1 Generate Checkbox Logic

```
Input: tahun (2026), periodik (1x/w)

Logic:
  1. Cek periodik_type & periodik_freq
  2. Jika "1x/w" → 1 checkbox per minggu (52 checkbox/tahun)
  3. Jika "2x/w" → 2 checkbox per minggu (104 checkbox/tahun)
  4. Jika "1x/month" → 1 checkbox per bulan (12 checkbox/tahun)
  5. Jika "1x/3month" → 1 checkbox per 3 bulan (4 checkbox/tahun)
  6. Exclude hari libur (weekend & holiday dari table holidays)
```

### 5.2 Checkbox Transition Logic

```
□ (Plan) → Click → ✓ (Actual)
✓ (Actual) → Click → □ (Plan)
✗ (Abnormal) → Click → Buka Modal Abnormal
  → Submit → ✗ (Abnormal) tetap, data tersimpan
  → Cancel → Kembali ke □ (Plan)
```

### 5.3 Data Flow

```
┌──────────────────┐    ┌─────────────────────┐
│ Standard          │───▶│ Schedule            │
│ Maintenance       │    │ (maintenance_sched) │
│ (standard_        │    │                     │
│  maintenances)    │    │ periodik: "1x/w"    │
│                   │    │                     │
│ kategori: CCTV    │    └─────────────────────┘
│ nama: Camera NVR  │                │
│ fungsi: Recording │                ▼
│ standar: OK       │    ┌─────────────────────┐
│ metode: Visual    │    │ Actual Checkbox      │
│ alat: Monitor     │    │ (maintenance_actual) │
└──────────────────┘    │                     │
                        │ date: 2026-01-05    │
                        │ status: ACTUAL      │
                        └──────────┬──────────┘
                                   │
                          ┌────────▼────────┐
                          │ Abnormal Log     │
                          │ (abnormal_logs)  │
                          │                  │
                          │ deskripsi: "..." │
                          │ tindakan: "..."  │
                          └──────────────────┘
```

---

## 6. Frontend Component Tree (Target)

```
MaintenancePage
├── CategoryTabs
│   ├── [Hardware] → MaintenanceHardware
│   ├── [Software HW] → MaintenanceSoftwareHW
│   ├── [Application] → MaintenanceApplication
│   ├── [Network] → MaintenanceNetwork
│   └── [Cybersecurity] → MaintenanceCybersec
│
├── ChildNav (per tab)
│   ├── [Standard Maintenance] → StandardMaintenanceView
│   ├── [Schedule] → ScheduleWithCheckboxView
│   └── [Sheet Abnormal] → AbnormalLogListView
│
├── StandardMaintenanceView
│   ├── EditableTable (Excel-like)
│   ├── RowAddModal
│   └── BulkImportButton
│
├── ScheduleWithCheckboxView
│   ├── MonthSelector (Jan-Dec)
│   ├── CheckboxTable
│   │   ├── CheckboxCell (□ / ✓ / ✗)
│   │   └── WeekColumnHeaders
│   ├── LegendBar
│   └── AbnormalModal
│       ├── DamageDescriptionInput
│       ├── ActionInput
│       └── SubmitButton
│
└── AbnormalLogListView
    ├── FilterBar (date range, category)
    ├── AbnormalTable
    └── ExportButton
```

---

## 7. Target Deliverables

### Phase 1: Database & Backend

| # | Task |
|---|------|
| 1 | Buat tabel `maintenance_actual` |
| 2 | Buat tabel `maintenance_abnormal_logs` |
| 3 | Modif `maintenance_schedules` add periodik detail |
| 4 | Buat endpoint generate checkboxes |
| 5 | Buat endpoint CRUD checkbox status |
| 6 | Buat endpoint abnormal log |
| 7 | Buat endpoint monthly view |

### Phase 2: Frontend

| # | Task |
|---|------|
| 1 | Buat CategoryTabs component |
| 2 | Buat ChildNav navigation |
| 3 | Refactor Standard Maintenance table (Excel-like) |
| 4 | Buat CheckboxTable component |
| 5 | Buat AbnormalModal component |
| 6 | Buat WeekColumnHeaders component |
| 7 | Buat AbnormalLogListView component |
| 8 | Implement legend toggle (□ → ✓ → ✗) |
| 9 | Integrasi API |
| 10 | Export PDF/Excel |

### Phase 3: Integration & Testing

| # | Task |
|---|------|
| 1 | Testing checkbox flow (Plan → Actual → Abnormal) |
| 2 | Testing abnormal modal CRUD |
| 3 | Testing periodik checkbox generation |
| 4 | UI polish & mobile responsif |

---

## 8. Pertanyaan yang Dijawab

| Pertanyaan | Jawaban |
|------------|---------|
| **Kenapa kategori dipisah jadi tab?** | Biar user fokus manage per kategori tanpa campur aduk data |
| **Gimana cara checkbox muncul?** | Berdasarkan setting **periodik** di schedule. `1x/w` = 1 checkbox per minggu |
| **Apa bedanya Actual dan Abnormal?** | Actual = normal sesuai standar. Abnormal = ada masalah perlu ditindaklanjuti |
| **Data abnormal disimpan di mana?** | Tabel baru `maintenance_abnormal_logs` → terhubung ke `maintenance_actual` → `maintenance_schedules` |
| **Apa yang terjadi setelah submit abnormal?** | Data tersimpan di DB, status checkbox tetap ✗. Bisa dilihat di tab Sheet Abnormal |
| **Boleh modif tabel existing?** | ✅ Boleh, tapi **hanya tabel terkait fitur ini**: `maintenance_schedules`, `maintenance_log_sheets` |