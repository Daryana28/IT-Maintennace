# Entity Relationship Diagram (ERD): IT-Maintenance

> Database: `ITAM` (SQL Server — `dbo` schema)
> Catatan: Project ini adalah **handover**, jadi tidak semua foreign key terdefinisi secara eksplisit di level database. Relasi di bawah juga mencakup **logical relationships** yang ada di kode Sequelize.

---

## 1. Domain Master Data

### `companies`
**Primary Key:** `company_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| company_id | BIGINT PK | auto-increment |
| company_code | VARCHAR(20) | UNIQUE, NOT NULL |
| company_name | VARCHAR(200) | NOT NULL |
| is_active | BIT | DEFAULT 1 |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

### `departments`
**Primary Key:** `department_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| department_id | BIGINT PK | auto-increment |
| company_id | BIGINT FK → `companies.company_id` | NOT NULL |
| department_code | VARCHAR(20) | NOT NULL |
| department_name | VARCHAR(200) | NOT NULL |
| is_active | BIT | DEFAULT 1 |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

### `job_levels`
**Primary Key:** `level_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| level_id | BIGINT PK | auto-increment |
| level_name | VARCHAR(100) | UNIQUE, NOT NULL |
| description | VARCHAR(255) | NULL |
| rank_order | INT | DEFAULT 0 |

### `asset_locations`
**Primary Key:** `location_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| location_id | BIGINT PK | auto-increment |
| location_name | VARCHAR(200) | UNIQUE, NOT NULL |

---

## 2. User & Authentication Domain

### `users`
**Primary Key:** `user_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| user_id | BIGINT PK | auto-increment |
| company_id | BIGINT FK → `companies.company_id` | NOT NULL |
| department_id | BIGINT FK → `departments.department_id` | NULL |
| job_level_id | BIGINT FK → `job_levels.level_id` | NULL, ON DELETE SET NULL, ON UPDATE CASCADE |
| supervisor_id | BIGINT FK → `users.user_id` | NULL (self-reference) |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| full_name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(200) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| is_active | BIT | DEFAULT 1 |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

### `roles`
**Primary Key:** `role_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| role_id | BIGINT PK | auto-increment |
| role_name | VARCHAR(100) | UNIQUE, NOT NULL |

### `permissions`
**Primary Key:** `permission_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| permission_id | BIGINT PK | auto-increment |
| permission_name | VARCHAR(150) | UNIQUE, NOT NULL |

### `user_roles` (Many-to-Many: Users ↔ Roles)
**Primary Key:** `(user_id, role_id)`

| Kolom | Tipe | Constraint |
|-------|------|------------|
| user_id | BIGINT FK → `users.user_id` | NOT NULL |
| role_id | BIGINT FK → `roles.role_id` | NOT NULL |

### `role_permissions` (Many-to-Many: Roles ↔ Permissions)
**Primary Key:** `(role_id, permission_id)`

| Kolom | Tipe | Constraint |
|-------|------|------------|
| role_id | BIGINT FK → `roles.role_id` | NOT NULL |
| permission_id | BIGINT FK → `permissions.permission_id` | NOT NULL |

---

## 3. IT Asset Management (ITAM) Domain

### `asset_categories`
**Primary Key:** `category_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| category_id | BIGINT PK | auto-increment |
| category_name | VARCHAR(150) | NOT NULL |
| parent_id | BIGINT FK → `asset_categories.category_id` | NULL (self-reference, hirarki) |
| category_code | VARCHAR(50) | NOT NULL |
| level_no | TINYINT | DEFAULT 1 |
| sort_no | INT | DEFAULT 0 |
| is_active | BIT | DEFAULT 1 |
| show_in_tabs | BIT | DEFAULT 1 |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

> **Index:** `idx_asset_categories_level_sort` (level_no ASC, sort_no ASC)
> **Index:** `idx_asset_categories_parent_id` (parent_id ASC)

### `assets`
**Primary Key:** `asset_id` (CHAR(36) / UUID)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| asset_id | CHAR(36) PK | UUID |
| category_id | BIGINT FK → `asset_categories.category_id` | NOT NULL, ON DELETE CASCADE |
| location_id | BIGINT FK → `asset_locations.location_id` | NULL, ON DELETE SET NULL |
| asset_code | NVARCHAR(50) | NOT NULL |
| asset_name | NVARCHAR(200) | NOT NULL |
| serial_number | NVARCHAR(100) | NULL |
| status | NVARCHAR(30) | NOT NULL |
| purchase_date | DATE | NULL |
| depreciation_date | DATE | NULL |
| division | NVARCHAR(200) | NULL |
| department | NVARCHAR(200) | NULL |
| owner_name | NVARCHAR(200) | NULL |
| nik | NVARCHAR(30) | NULL |
| hostname | NVARCHAR(100) | NULL |
| ip_main | NVARCHAR(50) | NULL |
| ip_backup | NVARCHAR(50) | NULL |
| cls_managerial | BIT | DEFAULT 0 |
| cls_meeting | BIT | DEFAULT 0 |
| cls_aktivitas_khusus | BIT | DEFAULT 0 |
| cls_officer_admin | BIT | DEFAULT 0 |
| cls_teknikal | BIT | DEFAULT 0 |
| cls_operator | BIT | DEFAULT 0 |
| cls_aplikasi_wms | BIT | DEFAULT 0 |
| cls_vms | BIT | DEFAULT 0 |
| cls_cctv_view | BIT | DEFAULT 0 |
| cls_station_delivery | BIT | DEFAULT 0 |
| cls_aplikasi_gathering | BIT | DEFAULT 0 |
| cls_oqc | BIT | DEFAULT 0 |
| mac_address | NVARCHAR(255) | NULL |
| operating_system | NVARCHAR(255) | NULL |
| os_version | NVARCHAR(255) | NULL |
| is_domain_join | BIT | NULL |
| antivirus_status | NVARCHAR(255) | NULL |
| created_at | DATETIMEOFFSET | NOT NULL |

### `asset_files`
**Primary Key:** `file_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| file_id | BIGINT PK | auto-increment |
| asset_id | CHAR(36) FK → `assets.asset_id` | NOT NULL, ON DELETE CASCADE |
| file_type | NVARCHAR(30) | NOT NULL |
| file_name | NVARCHAR(255) | NOT NULL |
| file_path | NVARCHAR(500) | NOT NULL |
| file_ext | NVARCHAR(20) | NULL |
| file_size | BIGINT | NULL |
| uploaded_by | BIGINT | NULL (→ `users.user_id` logical) |
| created_at | DATETIMEOFFSET | NULL |

### `asset_lifecycles`
**Primary Key:** `lifecycle_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| lifecycle_id | BIGINT PK | auto-increment |
| asset_id | CHAR(36) FK → `assets.asset_id` | NOT NULL, ON DELETE CASCADE |
| action_name | NVARCHAR(50) | NOT NULL |
| from_location | NVARCHAR(200) | NULL |
| to_location | NVARCHAR(200) | NULL |
| notes | NVARCHAR(MAX) | NULL |
| created_by | BIGINT FK → `users.user_id` | NULL, ON DELETE SET NULL |
| created_at | DATETIMEOFFSET | NOT NULL |

### `asset_budgets`
**Primary Key:** `id` (INT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | INT PK | auto-increment |
| budget_code | VARCHAR(100) | NOT NULL |
| subject | VARCHAR(255) | NULL |
| initial_plan | DECIMAL(18,2) | NULL |
| review | DECIMAL(18,2) | NULL |
| item_no | VARCHAR(100) | NULL |
| item_name | VARCHAR(255) | NULL |
| factory | VARCHAR(100) | NULL |
| vehicle_type | VARCHAR(100) | NULL |
| qty | INT | NULL |
| purpose | VARCHAR(100) | NULL |
| sale | VARCHAR(100) | NULL |
| currency | VARCHAR(50) | NULL |
| price_pengajuan | DECIMAL(18,2) | NULL |
| purchase_price | DECIMAL(18,2) | NULL |
| rate | VARCHAR(50) | NULL |
| budget | DECIMAL(18,2) | NULL |
| po_date | VARCHAR(10) | NULL |
| ship_date | VARCHAR(10) | NULL |
| acceptance_month | VARCHAR(10) | NULL |
| payment_condition | VARCHAR(255) | NULL |
| payment_date_1 | VARCHAR(10) | NULL |
| payment_rate_1 | VARCHAR(50) | NULL |
| payment_amount_1 | DECIMAL(18,2) | NULL |
| payment_date_2 | VARCHAR(10) | NULL |
| payment_rate_2 | VARCHAR(50) | NULL |
| payment_amount_2 | DECIMAL(18,2) | NULL |
| payment_date_3 | VARCHAR(10) | NULL |
| payment_rate_3 | VARCHAR(50) | NULL |
| payment_amount_3 | DECIMAL(18,2) | NULL |
| mass_pro_timing | VARCHAR(10) | NULL |
| capitalized_month | VARCHAR(10) | NULL |
| created_at | DATETIMEOFFSET | DEFAULT getdate() |
| updated_at | DATETIMEOFFSET | DEFAULT getdate() |

### `parts`
**Primary Key:** `part_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| part_id | BIGINT PK | auto-increment |
| part_code | VARCHAR(50) | UNIQUE, NOT NULL |
| part_name | VARCHAR(200) | NOT NULL |

### `warehouse_stock`
**Primary Key:** `stock_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| stock_id | BIGINT PK | auto-increment |
| part_id | BIGINT FK → `parts.part_id` (logical) | NOT NULL |
| qty | DECIMAL(18,2) | DEFAULT 0 |

### `inventory_transactions`
**Primary Key:** `trx_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| trx_id | BIGINT PK | auto-increment |
| part_id | BIGINT FK → `parts.part_id` (logical) | NOT NULL |
| wo_id | BIGINT FK → `work_orders.wo_id` (logical) | NULL |
| trx_type | VARCHAR(20) | NOT NULL |
| qty | DECIMAL(18,2) | NOT NULL |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

---

## 4. Computerized Maintenance Management (CMMS) Domain

### `yearly_standard_maintenances`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| tahun | INT | NOT NULL |
| judul | NVARCHAR(255) | NOT NULL |
| status_approval | NVARCHAR(50) | DEFAULT 'DRAFT' |
| alasan_hapus | NVARCHAR(MAX) | NULL |
| created_at | DATETIME2 | DEFAULT getdate() |
| updated_at | DATETIME2 | DEFAULT getdate() |

### `standard_maintenances`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| yearly_standard_id | BIGINT FK → `yearly_standard_maintenances.id` | NOT NULL |
| kategori | NVARCHAR(100) | NOT NULL |
| subKategori | NVARCHAR(100) | NOT NULL |
| namaPerangkat | NVARCHAR(100) | NOT NULL |
| tipePerangkat | NVARCHAR(100) | NOT NULL |
| subPerangkat | NVARCHAR(100) | NULL |
| created_at | DATETIME2 | DEFAULT getdate() |
| updated_at | DATETIME2 | DEFAULT getdate() |

### `standard_maintenance_details`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| standard_maintenance_id | BIGINT FK → `standard_maintenances.id` (logical) | NOT NULL |
| fungsi | NVARCHAR(255) | NULL |
| deskripsi | NVARCHAR(MAX) | NULL |
| created_at | DATETIME2 | DEFAULT getdate() |
| updated_at | DATETIME2 | DEFAULT getdate() |

### `standard_maintenance_checks`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| standard_maintenance_detail_id | BIGINT FK → `standard_maintenance_details.id` (logical) | NOT NULL |
| pengecekan | NVARCHAR(255) | NULL |
| standard | NVARCHAR(255) | NULL |
| periodik | NVARCHAR(100) | NULL |
| bagian | NVARCHAR(255) | NULL |
| metode | NVARCHAR(255) | NULL |
| alat | NVARCHAR(255) | NULL |
| created_at | DATETIME2 | DEFAULT getdate() |
| updated_at | DATETIME2 | DEFAULT getdate() |

### `maintenance_schedules`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| asset_id | CHAR(36) FK → `assets.asset_id` | NOT NULL, ON DELETE CASCADE |
| yearly_standard_id | BIGINT FK → `yearly_standard_maintenances.id` | NOT NULL, ON DELETE CASCADE |
| standard_maintenance_id | BIGINT FK → `standard_maintenances.id` | NOT NULL, ON DELETE CASCADE |
| periodik | NVARCHAR(50) | NULL |
| next_maintenance_date | DATETIMEOFFSET | NULL |
| next_maintenance_end_date | DATETIMEOFFSET | NULL |
| status | NVARCHAR(20) | DEFAULT N'ACTIVE' |
| cancel_reason | NVARCHAR(500) | NULL |
| created_at | DATETIMEOFFSET | NULL |
| updated_at | DATETIMEOFFSET | NULL |

### `maintenance_log_sheets`
**Primary Key:** `id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | BIGINT PK | auto-increment |
| schedule_id | BIGINT FK → `maintenance_schedules.id` | NOT NULL, ON DELETE CASCADE |
| temuan | NVARCHAR(MAX) | NOT NULL |
| tindakan | NVARCHAR(MAX) | NULL |
| status_temuan | NVARCHAR(50) | DEFAULT N'OPEN' |
| tanggal_temuan | DATETIMEOFFSET | NOT NULL |
| created_by | BIGINT FK → `users.user_id` | NULL, ON DELETE SET NULL |
| created_at | DATETIMEOFFSET | NULL |
| updated_at | DATETIMEOFFSET | NULL |

### `holidays`
**Primary Key:** `id` (CHAR(36) / UUID)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | CHAR(36) PK | UUID |
| holiday_date | DATE | UNIQUE, NOT NULL |
| description | NVARCHAR(255) | NOT NULL |
| holiday_type | VARCHAR(255) | CHECK: 'NATIONAL_HOLIDAY' / 'COLLECTIVE_LEAVE' / 'OTHER' |
| createdAt | DATETIMEOFFSET | NOT NULL |
| updatedAt | DATETIMEOFFSET | NOT NULL |

---

## 5. IT Service Management (ITSM) Domain

### `tickets`
**Primary Key:** `ticket_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| ticket_id | BIGINT PK | auto-increment |
| requester_id | BIGINT FK → `users.user_id` (logical) | NOT NULL |
| assigned_to | BIGINT FK → `users.user_id` (logical) | NULL |
| title | VARCHAR(250) | NOT NULL |
| description | VARCHAR(MAX) | NULL |
| priority | VARCHAR(20) | NOT NULL |
| status | VARCHAR(30) | NOT NULL |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

### `work_orders`
**Primary Key:** `wo_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| wo_id | BIGINT PK | auto-increment |
| ticket_id | BIGINT FK → `tickets.ticket_id` | NULL, ON DELETE SET NULL |
| asset_id | CHAR(36) FK → `assets.asset_id` | NULL, ON DELETE SET NULL |
| request_by | BIGINT FK → `users.user_id` | NOT NULL, ON DELETE CASCADE |
| assigned_to | BIGINT FK → `users.user_id` | NULL |
| wo_number | NVARCHAR(50) | NOT NULL |
| title | NVARCHAR(250) | NOT NULL |
| priority | NVARCHAR(20) | NOT NULL |
| status | NVARCHAR(30) | NOT NULL |
| start_date | DATETIMEOFFSET | NULL |
| end_date | DATETIMEOFFSET | NULL |
| created_at | DATETIMEOFFSET | NOT NULL |

---

## 6. Audit Domain

### `audit_logs`
**Primary Key:** `log_id` (BIGINT, auto-increment)

| Kolom | Tipe | Constraint |
|-------|------|------------|
| log_id | BIGINT PK | auto-increment |
| user_id | BIGINT FK → `users.user_id` (logical) | NULL |
| module_name | VARCHAR(100) | NOT NULL |
| action_name | VARCHAR(100) | NOT NULL |
| ref_id | BIGINT | NULL |
| created_at | DATETIME2 | DEFAULT sysdatetime() |

---

## 7. Relasi Antar Tabel (Foreign Keys)

### Explicit FK (terdefinisi di database)

| FK | Source | Target | On Delete |
|----|--------|--------|-----------|
| FK__assets__category__671F4F74 | `assets.category_id` | `asset_categories.category_id` | CASCADE |
| FK__assets__location__681373AD | `assets.location_id` | `asset_locations.location_id` | SET NULL |
| FK__maintenan__asset__719CDDE7 | `maintenance_schedules.asset_id` | `assets.asset_id` | CASCADE |
| FK__maintenan__yearl__72910220 | `maintenance_schedules.yearly_standard_id` | `yearly_standard_maintenances.id` | CASCADE |
| FK__maintenan__stand__73852659 | `maintenance_schedules.standard_maintenance_id` | `standard_maintenances.id` | CASCADE |
| FK__asset_fil__asset__76619304 | `asset_files.asset_id` | `assets.asset_id` | CASCADE |
| FK__asset_lif__asset__793DFFAF | `asset_lifecycles.asset_id` | `assets.asset_id` | CASCADE |
| FK__asset_lif__creat__7A3223E8 | `asset_lifecycles.created_by` | `users.user_id` | SET NULL |
| FK__work_orde__ticke__6AEFE058 | `work_orders.ticket_id` | `tickets.ticket_id` | SET NULL |
| FK__work_orde__asset__6BE40491 | `work_orders.asset_id` | `assets.asset_id` | SET NULL |
| FK__work_orde__reque__6CD828CA | `work_orders.request_by` | `users.user_id` | CASCADE |
| FK__work_orde__assig__6DCC4D03 | `work_orders.assigned_to` | `users.user_id` | (none) |
| fk_users_job_level | `users.job_level_id` | `job_levels.level_id` | SET NULL, ON UPDATE CASCADE |
| fk_users_supervisor | `users.supervisor_id` | `users.user_id` (self) | (none) |
| FK__maintenan__sched__0A688BB1 | `maintenance_log_sheets.schedule_id` | `maintenance_schedules.id` | CASCADE |
| FK__maintenan__creat__0B5CAFEA | `maintenance_log_sheets.created_by` | `users.user_id` | SET NULL |

### Implicit FK (logical — di kode/Sequelize, tidak di DB)

| Source | Target | Notes |
|--------|--------|-------|
| `departments.company_id` | `companies.company_id` | FK seharusnya ada |
| `users.company_id` | `companies.company_id` | |
| `users.department_id` | `departments.department_id` | |
| `asset_files.uploaded_by` | `users.user_id` | |
| `audit_logs.user_id` | `users.user_id` | |
| `inventory_transactions.part_id` | `parts.part_id` | |
| `inventory_transactions.wo_id` | `work_orders.wo_id` | |
| `warehouse_stock.part_id` | `parts.part_id` | |
| `tickets.requester_id` | `users.user_id` | |
| `tickets.assigned_to` | `users.user_id` | |
| `standard_maintenance_checks.standard_maintenance_detail_id` | `standard_maintenance_details.id` | |
| `standard_maintenance_details.standard_maintenance_id` | `standard_maintenances.id` | |
| `standard_maintenances.yearly_standard_id` | `yearly_standard_maintenances.id` | |
| `maintenance_log_sheets.created_by` | `users.user_id` | Ada FK-nya juga |
| `asset_categories.parent_id` | `asset_categories.category_id` | Self-referencing |

---

## 8. Catering Arrow (Visual Referensi)

```
companies ─┬─< departments
           └─< users ─┬─< user_roles >── roles ──< role_permissions >── permissions
                       │
                       ├─< asset_lifecycles (created_by)
                       ├─< maintenance_log_sheets (created_by)
                       ├─< asset_files (uploaded_by)
                       ├─< work_orders (request_by, assigned_to)
                       ├─< audit_logs
                       └─< tickets (requester_id, assigned_to)

asset_categories ─┬─< asset_categories (parent_id — self)
                  └─< assets ─┬─< asset_files
                              ├─< asset_lifecycles
                              ├─< maintenance_schedules
                              └─< work_orders

asset_locations ──< assets

parts ──< warehouse_stock
parts ──< inventory_transactions ──< work_orders

yearly_standard_maintenances ──< standard_maintenances ──< standard_maintenance_details ──< standard_maintenance_checks
yearly_standard_maintenances ──< maintenance_schedules
standard_maintenances ──< maintenance_schedules

maintenance_schedules ──< maintenance_log_sheets

tickets ──< work_orders
```

---

## 9. Enum / CHECK Constraint

### `holidays.holiday_type`
| Value | Meaning |
|-------|---------|
| `NATIONAL_HOLIDAY` | Libur nasional |
| `COLLECTIVE_LEAVE` | Cuti bersama |
| `OTHER` | Libur lainnya |

### Status Field (Domain Values)
> Nilai-nilai ini **tidak** didefinisikan sebagai CHECK constraint di DB, tapi diterapkan di kode backend/frontend.

#### `yearly_standard_maintenances.status_approval`
`DRAFT` (default) → `ACTIVE` → `WAITING_FOR_DELETION`

#### `maintenance_schedules.status`
`ACTIVE` (default) → `CANCELLED` → `COMPLETED`

#### `maintenance_log_sheets.status_temuan`
`OPEN` (default) → `SUBMITTED` → `APPROVED`

#### `assets.status`
`ACTIVE` → `REPAIR` → `RETIRED` → `DISPOSED`

#### `tickets.status`
`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` → `CANCELLED`

#### `tickets.priority`
`LOW` → `MEDIUM` → `HIGH` → `CRITICAL`

#### `work_orders.status`
`OPEN` → `IN_PROGRESS` → `COMPLETED` → `CLOSED` → `FAILED`

#### `work_orders.priority`
`LOW` → `MEDIUM` → `HIGH` → `CRITICAL`

#### `inventory_transactions.trx_type`
`STOCK_IN` → `STOCK_OUT` → `ADJUSTMENT`

#### `asset_lifecycles.action_name`
`TRANSFERRED` → `MAINTENANCE` → `REPAIRED` → `RETIRED` → `DISPOSED`

---

## 10. Domain Grouping

```
┌─────────────────────────────────────────────────────────────┐
│                  IT-Maintenance Database                      │
├───────────────┬───────────────┬───────────────┬─────────────┤
│  Master Data  │  User & Auth  │  ITAM Domain  │  CMMS Domain │
├───────────────┼───────────────┼───────────────┼─────────────┤
│  companies    │  users        │  assets       │  yearly_std  │
│  departments  │  roles        │  asset_cat    │  std_mnt     │
│  job_levels   │  permissions  │  asset_loc    │  std_mnt_det │
│  asset_loc    │  user_roles   │  asset_files  │  std_mnt_chk │
│               │  role_perm    │  asset_life   │  mnt_sched   │
│               │               │  asset_budget │  mnt_log     │
│               │               │  parts        │  holidays    │
│               │               │  wh_stock     │              │
│               │               │  inv_trx      │              │
│               │               ├───────────────┤              │
│               │               │  ITSM Domain  │              │
│               │               ├───────────────┤              │
│               │               │  tickets      │              │
│               │               │  work_orders  │              │
│               │               ├───────────────┤              │
│               │               │  Audit        │              │
│               │               │  audit_logs   │              │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

---

## 11. Catatan Handover

Karena project ini **handover** dan tidak semua foreign key eksplisit di database, perhatikan:

1. **Tabel tanpa FK eksplisit tapi jelas berelasi:**
   - `tickets.requester_id` → otomatis `users.user_id`
   - `tickets.assigned_to` → otomatis `users.user_id`
   - `standard_maintenance_*` → hierarki bertingkat berdasarkan parent ID
   - `inventory_transactions.part_id` → `parts.part_id`
   - `asset_files.uploaded_by` → `users.user_id`
   - `departments.company_id` → `companies.company_id`

2. **Self-referencing:**
   - `asset_categories.parent_id` → `asset_categories.category_id` (hirarki kategori)
   - `users.supervisor_id` → `users.user_id` (struktur supervisi)

3. **Cascade behavior:**
   - Hapus `assets` akan menghapus `maintenance_schedules`, `asset_files`, `asset_lifecycles` (ON DELETE CASCADE)
   - Hapus `standard_maintenances` akan menghapus `maintenance_schedules` (ON DELETE CASCADE)
   - Hapus `users` akan menghapus `work_orders` (ON DELETE CASCADE)
   - Hapus `users` akan SET NULL di `asset_lifecycles, maintenance_log_sheets` (ON DELETE SET NULL)