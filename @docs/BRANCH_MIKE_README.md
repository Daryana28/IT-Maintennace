# Branch MIKE: Running Guide & Merge Documentation

> Dokumentasi lengkap untuk menjalankan branch `mike` (schedule & abnormal log DONE)
> Branch: `mike` (based on message.txt schema)

---

## Status Checklist

### ✅ Feature Status (Branch MIKE)

| Feature | Status | Detail |
|---------|--------|--------|
| **Database Migration** | ✅ DONE | Migration script ready (`run_refactor_migration.js`) |
| **maintenance_schedules columns** | ✅ DONE | periodik_type, periodik_freq, periodik_unit |
| **maintenance_actual table** | ✅ DONE | Checkbox status per tanggal |
| **maintenance_abnormal_logs table** | ✅ DONE | Abnormal log dengan resolver info |
| **Sequelize Models** | ✅ DONE | All models updated (index.js) |
| **Checkbox Generator Engine** | ✅ DONE | parsePeriodik + generateCheckboxDates |
| **Backend APIs** | ✅ DONE | Schedule + Actual + Abnormal + LogSheet |
| **Frontend: ScheduleWithCheckboxView** | ✅ DONE | Excel-like table + checkbox |
| **Frontend: AbnormalModal** | ✅ DONE | Modal input deskripsi & tindakan |
| **Frontend: AbnormalLogListView** | ✅ DONE | List view with filters |
| **Integration Testing** | ✅ DONE | Contract testing complete |

**Status: Ready to merge ke main!**

---

## 🚀 Cara Running di Branch MIKE

### Prerequisites

1. **SQL Server** - Database `ITAM` accessible
2. **Node.js** - v20+ installed
3. **.env configuration** - Database credentials ready

### Step 1: Clone & Checkout Branch MIKE

```bash
cd /opt/projects
git clone https://github.com/Daryana28/IT-Maintennace.git
cd IT-Maintennace
git checkout mike
```

### Step 2: Install Dependencies

```bash
# Backend
cd be
npm install

# Frontend
cd ../fe
npm install
```

### Step 3: Configure Environment Variables

Create `be/.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ITAM
DB_USER=sa
DB_PASSWORD=your_password_here

# Server
PORT=3000
NODE_ENV=development

# JWT (for auth)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Step 4: Execute Database Migration

**Option A: Using Node.js script (Recommended)**
```bash
cd be
node src/migrations/run_refactor_migration.js
```

**Option B: Using SQL script (Manual)**
```bash
# Run migration SQL directly in SQL Server Management Studio
# File: @docs/INSERT_ADMIN.sql (creates admin user)
# File: be/src/migrations/run_refactor_migration.js (creates tables)
```

**What the migration creates/alter:**
- ✅ `maintenance_schedules` → Add columns: periodik_type, periodik_freq, periodik_unit
- ✅ Create `maintenance_actual` table
- ✅ Create `maintenance_abnormal_logs` table  
- ✅ `maintenance_log_sheets` → Add column: actual_id

### Step 5: Seed Database (Optional - for Demo Data)

```bash
cd be
node seed_dummy.js
```

**Seed data creates:**
- Company, Department, JobLevel
- Roles (Admin, SuperAdmin)
- Users: `admin@example.com` / `password123` & `tester@example.com` / `password123`
- Standard Maintenance entries
- Maintenance Schedules (dummy data)
- Maintenance Actuals (checkbox statuses)
- Abnormal Logs (sample data)

### Step 6: Start Backend Server

```bash
cd be
npm run dev
# OR
npm start
```

Backend runs on: `http://localhost:3000`

### Step 7: Start Frontend Development Server

```bash
cd fe
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Step 8: Access Application

Open browser: `http://localhost:5173`

**Login Credentials:**
- Email: `admin@example.com` OR `tester@example.com`
- Password: `password123`

---

## 📝 Database Schema Changes (New Tables)

### Table: `maintenance_schedules` (Modified)

**New Columns:**
```sql
periodik_type NVARCHAR(50) NULL,        -- 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
periodik_freq INT DEFAULT 1 NULL,        -- Frequency multiplier (e.g., 2 for 2x/week)
periodik_unit NVARCHAR(10) DEFAULT 'w',  -- 'w'=week, 'm'=month, 'q'=quarter, 'h'=half-year, 'y'=year
```

**Migration SQL:**
```sql
ALTER TABLE dbo.maintenance_schedules ADD periodik_type NVARCHAR(50) NULL;
ALTER TABLE dbo.maintenance_schedules ADD periodik_freq INT DEFAULT 1 NULL;
ALTER TABLE dbo.maintenance_schedules ADD periodik_unit NVARCHAR(10) DEFAULT 'w' NULL;
```

### Table: `maintenance_actual` (New)

```sql
CREATE TABLE dbo.maintenance_actual (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    schedule_id BIGINT NOT NULL FOREIGN KEY REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    check_id BIGINT NOT NULL FOREIGN KEY REFERENCES standard_maintenance_checks(id),
    tanggal DATE NOT NULL,                    -- Tanggal pengecekan
    status NVARCHAR(20) DEFAULT 'PLAN',       -- 'PLAN' | 'ACTUAL' | 'ABNORMAL'
    legend NVARCHAR(10) DEFAULT '□',          -- '✓' | '✗' | '□'
    created_by BIGINT NULL FOREIGN KEY REFERENCES users(user_id),
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),
    CONSTRAINT UQ_maintenance_actual UNIQUE (schedule_id, check_id, tanggal)
);
```

### Table: `maintenance_abnormal_logs` (New)

```sql
CREATE TABLE dbo.maintenance_abnormal_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    actual_id BIGINT NOT NULL FOREIGN KEY REFERENCES maintenance_actual(id) ON DELETE CASCADE,
    deskripsi_kerusakan NVARCHAR(MAX) NOT NULL,   -- Deskripsi kerusakan
    tindakan NVARCHAR(MAX) NOT NULL,              -- Tindakan yang dilakukan
    status_temuan NVARCHAR(50) DEFAULT 'OPEN',    -- 'OPEN' | 'RESOLVED' | 'CLOSED'
    resolved_at DATETIMEOFFSET NULL,              -- Kapan di-resolve
    resolved_by BIGINT NULL FOREIGN KEY REFERENCES users(user_id),  -- Siapa yang resolve
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE()
);
```

### Table: `maintenance_log_sheets` (Modified)

**New Column:**
```sql
ALTER TABLE dbo.maintenance_log_sheets ADD actual_id BIGINT NULL;
ALTER TABLE dbo.maintenance_log_sheets ADD CONSTRAINT FK_mnt_log_actual 
    FOREIGN KEY (actual_id) REFERENCES dbo.maintenance_actual(id);
```

---

## 🔄 Backend API Changes

### New Endpoints (Schedule & Checkbox)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/maintenance-schedule/generate-checkboxes` | Generate checkbox matrix untuk setahun |
| GET | `/api/maintenance-schedule/:id/checkboxes` | Get all checkboxes per schedule |
| POST | `/api/maintenance-schedule/generate` | Generate schedules dari standard maintenance |
| GET | `/api/maintenance-schedule/monthly-view` | Get monthly view matrix |

### New Endpoints (Actual & Abnormal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/maintenance-actual/:id/status` | Update checkbox status (PLAN ↔ ACTUAL) |
| POST | `/api/maintenance-actual/:id/abnormal` | Submit abnormal log |
| GET | `/api/maintenance-abnormal-logs` | Get all abnormal logs |
| GET | `/api/maintenance-abnormal-logs?scheduleId=:id` | Get abnormal logs by schedule |

### Modified Endpoints

| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | `/api/maintenance-log-sheets` | Accept `actual_id` parameter |
| GET | `/api/maintenance-schedule` | Include periodik detail |

---

## 📊 Frontend Changes

### New Components

```
fe/src/modules/itam/maintenance/
├── components/
│   ├── ScheduleWithCheckboxView.jsx    # Excel-like table with checkboxes
│   ├── AbnormalModal.jsx              # Modal for abnormal input
│   ├── AbnormalLogListView.jsx        # List view for abnormal logs
│   └── CategoryTabs.jsx              # Tab navigation (Hardware, etc)
└── hooks/
    └── useCheckboxData.js            # Hook for checkbox data management
```

### Updated Routing

```
/maintenance
├── /hardware
│   ├── /standard-maintenance
│   ├── /schedule
│   └── /sheet-abnormal
├── /network
│   ├── /standard-maintenance
│   ├── /schedule
│   └── /sheet-abnormal
... (other categories)
```

---

## 📋 Documentation Changes (When Merging to Main)

### Files yang Berubah

| File | Status | Changes |
|------|--------|---------|
| `@docs/ERD.md` | **UPDATE** | Add new tables (maintenance_actual, abnormal_logs) + updated maintenance_schedules |
| `@docs/API_REFERENCE.md` | **UPDATE** | Add new endpoints (actual, abnormal, generate-checkboxes) |
| `@docs/BUSINESS_RULE.md` | **UPDATE** | Add checkbox legend logic + abnormal modal workflow |
| `@docs/REFACTOR_GOALS.md` | **UPDATE** | Mark all tasks as DONE, update status |
| `@docs/INSERT_ADMIN.sql` | **UPDATE** | Add admin user setup (already exists) |
| `@docs/PROJECT_OVERVIEW.md` | **UPDATE** | Add maintenance module info |
| `@docs/CURRENT_STATE.md` | **UPDATE** | Mark maintenance as 100% done |

### New Files yang Perlu Ditambah

| File | Purpose |
|------|---------|
| `@docs/BRANCH_MIKE_README.md` | (This file) Running guide for branch mike |
| `@docs/SCHEMA_CHANGES.md` | Database diff & migration guide |

---

## ⚠️ Potential Issues & Solutions

### 1. Database Not Migrated

**Symptom:** Error "Column not found" or "Table not found"

**Solution:**
```bash
cd be
node src/migrations/run_refactor_migration.js
```

### 2. Missing Seed Data

**Symptom:** Empty pages, no schedules

**Solution:**
```bash
cd be
node seed_dummy.js
```

### 3. Auth Issues (Cannot login)

**Symptom:** 401 Unauthorized

**Solution:**
```bash
# Check if admin user exists
# Run INSERT_ADMIN.sql if needed
# Verify JWT_SECRET in .env is set
```

### 4. Schedule Still Dummy

**Symptom:** Schedules are hardcoded, not generated

**Explanation:** Current `seed_dummy.js` creates dummy schedules for demo. To use real schedule generation:

```bash
# Step 1: Create yearly_standard_maintenances record
POST /api/standard-maintenance/years
{
  "tahun": 2026,
  "judul": "Standar Maintenance 2026"
}

# Step 2: Create standard_maintenances records  
POST /api/standard-maintenance
{
  "yearly_standard_id": 1,
  "kategori": "CCTV",
  "subKategori": "NVR",
  "namaPerangkat": "Dahua NVR",
  "tipePerangkat": "DH-XVR5108HS-I3",
  "subPerangkat": "NVR"
}

# Step 3: Generate schedules from standard
POST /api/maintenance-schedule/generate
{
  "yearly_standard_id": 1
}

# Step 4: Generate checkboxes
POST /api/maintenance-schedule/generate-checkboxes
{
  "yearly_standard_id": 1
}
```

---

## 🎯 Testing the New Features

### Test Schedule + Checkbox Flow

1. Login ke application
2. Buka halaman Maintenance
3. Klik tab "Hardware" (or other category)
4. Klik child link "Schedule"
5. Pastikan checkbox matrix muncul (52 minggu per tahun)
6. Klik checkbox untuk toggle: □ → ✓ (actual)
7. Klik checkbox untuk toggle: ✓ → □ (plan)
8. **Test Abnormal:**
   - Long press atau right-click pada checkbox
   - Pilih "Abnormal"
   - Isi modal: deskripsi kerusakan & tindakan
   - Submit
   - Pastikan checkbox berubah jadi ✗ (red)
9. **Verify abnormal log muncul:**
   - Klik "Sheet Abnormal" child link
   - Pastikan log baru muncul dengan deskripsi & tindakan

---

## 🔄 Merge to Main

### Pre-merge Checklist

- [ ] Semua tests passing (integration testing T-013)
- [ ] Database migration bisa dijalankan tanpa error
- [ ] Seed data bisa di-generate
- [ ] Login berhasil
- [ ] Schedule view bisa diakses
- [ ] Checkbox bisa di-toggle
- [ ] Abnormal modal bisa submit
- [ ] Abnormal log bisa di-view
- [ ] Documentation updated (@docs folder)

### Merge Command

```bash
cd /opt/projects/IT-Maintennace
git checkout main
git pull origin main
git merge mike --no-ff
git push origin main
```

### Post-merge Verification

1. Pull latest main di VPS/local
2. Jalankan migration ulang (pastikan idempotent)
3. Test flow lengkap
4. Update deployment documentation

---

## 📞 Support

**Branch:** mike
**Status:** ✅ Ready to merge
**Last Updated:** 2026-06-23
**Related Issues:** None

Untuk pertanyaan atau masalah:
1. Cek `BACKLOG.md` di branch mike
2. Cek `DEVLOG.md` untuk commit history
3. Cek `ROADMAP.md` untuk status task