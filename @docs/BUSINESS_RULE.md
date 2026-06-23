# Business Rules: IT-Maintenance

> Dokumentasi ini mencatat **aturan bisnis domain** — bukan validasi teknis.
> Contoh: password harus 8 karakter itu validasi, **tapi** "Staff tidak boleh menghapus attendance" itu business rule.

---

## 1. Hak Akses (Access Control)

### 1.1 Role-Based Access Control (RBAC)

**Aturan Umum:**
- Setiap user minimal memiliki 1 role
- **SUPERADMIN** selalu punya akses penuh ke semua modul
- Role lain hanya bisa mengakses modul yang diberikan ke role-nya

**Role yang Berlaku:**
| Role | Akses |
|------|-------|
| **SUPERADMIN** | Full akses semua modul, semua operasi |
| **IT_STAFF** | Kelola aset, jadwal, log sheet di departemen sendiri |
| **MANAGER** | Approve schedule, review log sheet, view aset |
| **TECHNICIAN** | Jalankan jadwal, isi log sheet, ubah status temuan |
| **END_USER** | Buat tiket IT, lihat status sendiri |

### 1.2 Spesifik Hak Akses

**Aset Management (ITAM):**
- Hanya role SUPERADMIN, IT_STAFF yang boleh create, update, delete aset
- END_USER hanya bisa **lihat** aset sendiri atau aset departemennya
- Manajer hanya bisa **lihat** aset di departemennya

**Scheduling & Maintenance (ITAM):**
- Hanya SUPERADMIN, IT_STAFF yang boleh membuat jadwal maintenance
- Technician hanya bisa menjalankan jadwal yang ditugaskan ke dia
- Manager bisa approve/reject jadwal tahunan

**Log Sheet:**
- Technician mengisi log sheet untuk jadwal yang ditugaskan
- Manager hanya bisa review dan approve log sheet
- Staff tidak boleh menghapus log sheet yang sudah di-review

---

## 2. Workflow & State Transitions

### 2.1 Yearly Standard Maintenance (Standar Tahunan)

**Status Transitions:**
```
DRAFT → (approved) → ACTIVE
DRAFT → (rejected) → REJECTED
DRAFT → (request delete) → WAITING_FOR_DELETION
WAITING_FOR_DELETION → (approve delete) → DELETED
```

**Aturan:**
- ✅ Hanya data dengan status **DRAFT** yang bisa dihapus langsung
- ❌ Data yang sudah **ACTIVE** tidak boleh dihapus — harus request delete dulu
- ❌ Tidak bisa delete data yang sudah **WAITING_FOR_DELETION** — harus tunggu approval

**Contoh Kasus:**
> "Kenapa data yearly maintenance tidak bisa dihapus?"
> → Karena statusnya sudah **ACTIVE**. Hanya status **DRAFT** yang bisa dihapus langsung.

### 2.2 Maintenance Schedule (Jadwal Maintenance)

**Status Transitions:**
```
ACTIVE → (cancel) → CANCELLED
CANCELLED → (reactivate) → ACTIVE
ACTIVE → (complete) → COMPLETED
```

**Aturan:**
- ✅ Jadwal status **ACTIVE** bisa dibatalkan dengan alasan
- ❌ Jadwal yang sudah **CANCELLED** tidak bisa dibatalkan lagi
- ✅ Jadwal **CANCELLED** bisa diaktifkan kembali (reactivated)
- ✅ Jadwal status **ACTIVE** bisa diubah datanya (tanggal, periodik)

**Contoh Kasus:**
> "Kenapa tidak bisa cancel jadwal maintenance?"
> → Cek statusnya dulu — kalau sudah **CANCELLED** berarti sudah dibatalkan sebelumnya.

### 2.3 Maintenance Log Sheet

**Status Transitions:**
```
OPEN → (update) → OPEN (masih bisa diubah)
OPEN → (submit) → SUBMITTED
SUBMITTED → (approve) → APPROVED
```

**Aturan:**
- ✅ Log sheet status **OPEN** bisa diedit oleh technician yang membuat
- ❌ Log sheet yang sudah **SUBMITTED** tidak boleh dihapus
- ✅ Log sheet hanya bisa dihapus oleh pembuatnya sendiri
- ✅ Setiap perubahan log sheet akan tercatat di audit log

### 2.4 Ticket (ITSM)

**Status Transitions:**
```
OPEN → (assign) → IN_PROGRESS
IN_PROGRESS → (resolve) → RESOLVED
RESOLVED → (close) → CLOSED
OPEN → (cancel) → CANCELLED
```

**Aturan:**
- ✅ Ticket **OPEN** bisa di-assign ke technician
- ❌ Ticket yang sudah **CLOSED** tidak boleh diubah
- ✅ Requester hanya bisa lihat status ticket sendiri
- ✅ Setiap perubahan ticket tercatat di audit log

### 2.5 Work Order (CMMS)

**Status Transitions:**
```
OPEN → (start) → IN_PROGRESS
IN_PROGRESS → (complete) → COMPLETED
COMPLETED → (close) → CLOSED
OPEN → (fail) → FAILED
```

**Aturan:**
- ✅ Work order **OPEN** bisa di-assign ke technician
- ❌ Work order **CLOSED** tidak boleh diubah
- ✅ Status **FAILED** hanya bisa diset oleh assigned technician
- ✅ Requester tidak bisa mengubah work order yang sudah di-assign

---

## 3. Kondisi Khusus (Special Conditions)

### 3.1 Asset Status Management

**Status Transitions:**
```
ACTIVE → (repair) → REPAIR
REPAIR → (repaired) → ACTIVE
ACTIVE → (retire) → RETIRED
ACTIVE → (dispose) → DELETED
```

**Aturan:**
- ✅ Asset status **ACTIVE** bisa dipindahkan ke **REPAIR** (dalam perbaikan)
- ✅ Setelah diperbaiki, status **REPAIR** kembali ke **ACTIVE**
- ✅ Asset bisa di-retire (tidak aktif) dari status **ACTIVE**
- ❌ Asset yang sudah **RETIRED** tidak bisa diaktifkan kembali
- ✅ Setiap perubahan status akan tercatat di **Asset Lifecycle**

**Contoh Kasus:**
> "Kenapa status aset tidak bisa diubah?"
> → Cek apakah aset sudah **RETIRED** atau belum — kalau sudah RETIRED, tidak bisa diubah.

### 3.2 User Management

**Aturan:**
- ✅ Setiap user harus terdaftar di 1 company
- ✅ Setiap user boleh punya multiple roles
- ✅ Username harus unik — tidak boleh ada duplikasi
- ✅ Password harus di-hash sebelum disimpan
- ❌ User yang sudah **deactivated** (is_active=false) tidak bisa login
- ✅ User bisa di-deactivate tapi tidak dihapus untuk menjaga integritas data

### 3.3 Asset Lifecycle Tracking

**Aturan:**
- ✅ Setiap perubahan aset akan tercatat di **Asset Lifecycle**
- ✅ Perubahan lokasi akan tercatat sebagai **TRANSFERRED**
- ✅ Perubahan status ke **REPAIR** akan tercatat sebagai **MAINTENANCE**
- ✅ Perubahan status ke **ACTIVE** dari **REPAIR** akan tercatat sebagai **REPAIRED**
- ✅ Asset yang dihapus akan tercatat sebagai **DISPOSED**

---

## 4. Constraint Bisnis (Business Constraints)

### 4.1 Data Integrity

**Constraint Hard (Harus Terpenuhi):**
- Setiap aset harus punya **category_id** dan **status** (tidak boleh NULL)
- Setiap ticket harus punya **requester_id** (user yang membuat)
- Setiap work order harus punya **request_by** atau **assigned_to**
- Setiap maintenance schedule harus punya **asset_id**, **yearly_standard_id**, **standard_maintenance_id**
- Setiap log sheet harus punya **schedule_id** dan **created_by**

**Constraint Soft (Boleh Kosong):**
- Aset boleh tanpa **location_id** (belum dipindahkan)
- Ticket boleh tanpa **assigned_to** (belum ditugaskan)
- Work order boleh tanpa **assigned_to** (belum ditugaskan)

### 4.2 Uniqueness

**Hard Uniqueness:**
- **Asset Code** harus unik per company
- **Username** harus unik global
- **Email** harus unik per company
- **Maintenance Schedule** tidak boleh duplikat untuk kombinasi (asset_id, yearly_standard_id, standard_maintenance_id)

### 4.3 Referential Integrity

**Cascading Rules:**
- ❌ Tidak boleh hapus **Company** jika masih ada user di dalamnya
- ❌ Tidak boleh hapus **Department** jika masih ada user di dalamnya
- ❌ Tidak boleh hapus **Asset Category** jika masih ada aset yang pakai
- ❌ Tidak boleh hapus **Asset Location** jika masih ada aset yang pakai
- ❌ Tidak boleh hapus **Standard Maintenance** jika masih ada schedule yang pakai

**Soft Delete Alternatives:**
- Gunakan status **DELETED** atau **RETIRED** untuk aset
- Gunakan status **INACTIVE** untuk user

### 4.4 Audit & Compliance

**Aturan Audit:**
- ✅ Semua operasi CREATE, UPDATE, DELETE harus tercatat di **Audit Log**
- ✅ Semua perubahan aset harus tercatat di **Asset Lifecycle**
- ✅ Audit log tidak boleh dihapus atau diubah
- ✅ Setiap audit log harus menyimpan: user_id, module, entity, action, old_data, new_data

### 4.5 Scheduling Rules

**Maintenance Schedule:**
- ✅ Satu schedule hanya boleh untuk **satu aset** dan **satu standard maintenance**
- ✅ Schedule yang sudah **CANCELLED** bisa diaktifkan kembali
- ❌ Schedule tidak boleh duplikat untuk kombinasi yang sama
- ✅ Periodik schedule harus sesuai dengan periodik pengecekan di standard maintenance

**Holiday Rules:**
- ✅ Hari libur hanya berpengaruh pada scheduling (jadwal tidak jatuh di hari libur)
- ✅ Holiday hanya bisa di-manage oleh SUPERADMIN

---

## 5. Pertanyaan yang Dijawab

### Q: "Kenapa user ini tidak bisa edit?"

**Jawaban:**
1. **Cek role user** — Apakah role-nya ada di daftar yang boleh edit?
2. **Cek permission** — Apakah role-nya punya permission untuk edit modul tersebut?
3. **Cek status data** — Apakah status data mengizinkan edit?
   - Contoh: Log sheet sudah **SUBMITTED** → tidak bisa dihapus
   - Contoh: Aset sudah **RETIRED** → tidak bisa diubah statusnya
4. **Cek ownership** — Apakah user ini pemilik data atau punya relasi dengan data?
   - Contoh: User hanya bisa lihat tiket sendiri

---

### Q: "Kapan data boleh dihapus?"

**Jawaban:**
Data boleh dihapus hanya jika:

| Tipe Data | Kondisi Hapus |
|-----------|---------------|
| **Yearly Standard Maintenance** | Status **DRAFT** saja (langsung) atau **REQUEST_DELETE** setelah approval |
| **Standard Maintenance** | Tidak ada schedule yang pakai |
| **Maintenance Schedule** | Status **ACTIVE** atau **CANCELLED** (dengan confirmation) |
| **Log Sheet** | Status **OPEN** dan hanya oleh pembuat sendiri |
| **Ticket** | Status **OPEN** atau **CANCELLED** dan oleh requester sendiri |
| **Asset** | Tidak ada work order atau schedule yang pakai |
| **User** | Tidak ada data yang terkait (soft delete lebih aman) |

**Contoh Kasus:**
> "Data jadwal maintenance tidak bisa dihapus"
> → Karena sudah ada log sheet yang terkait atau statusnya bukan **ACTIVE**

> "Log sheet tidak bisa dihapus"
> → Karena sudah **SUBMITTED** atau bukan pembuatnya sendiri

---

### Q: "Kenapa data tidak bisa diubah setelah approve?"

**Jawaban:**
- Data yang sudah di-approve memiliki status **ACTIVE**, **SUBMITTED**, atau **APPROVED**
- Status ini tidak boleh diubah untuk menjaga **audit trail** dan **data integrity**
- Jika perlu perubahan, buat data baru atau gunakan **void** mechanism

---

### Q: "Siapa yang bisa approve/reject?"

**Jawaban:**
- **Yearly Standard Maintenance** → Manager atau SUPERADMIN
- **Log Sheet** → Manager atau SUPERADMIN
- **Ticket** → IT Staff atau SUPERADMIN
- **Work Order** → Manager atau SUPERADMIN

---

### Q: "Kenapa schedule tidak muncul di kalender?"

**Jawaban:**
1. **Cek status schedule** — Apakah statusnya **ACTIVE**?
2. **Cek tanggal** — Apakah jadwal jatuh di **hari libur**?
3. **Cek year** — Apakah yearly standard maintenance-nya aktif?
4. **Cek view mode** — Apakah view mode sesuai (daily/weekly/monthly)?

---

### Q: "Kenapa aset tidak bisa di-repair?"

**Jawaban:**
- Cek status aset saat ini
- ❌ Tidak bisa dari **RETIRED** ke **REPAIR**
- ❌ Tidak bisa dari **DISPOSED** ke **REPAIR**
- ✅ Hanya dari **ACTIVE** yang boleh ke **REPAIR**

---

### Q: "Data siapa yang bisa dilihat?"

**Jawaban:**
| Role | Data yang Bisa Dilihat |
|------|----------------------|
| **SUPERADMIN** | Semua data di semua departemen |
| **IT_STAFF** | Aset di departemennya + tiket yang ditugaskan |
| **MANAGER** | Aset + tiket + log sheet di departemennya |
| **TECHNICIAN** | Tiket yang ditugaskan + schedule yang ditugaskan |
| **END_USER** | Tiket sendiri + aset sendiri saja |

---

### Q: "Kapan audit log tercatat?"

**Jawaban:**
Audit log tercatat secara otomatis untuk setiap operasi:
- **CREATE** — Saat membuat data baru
- **UPDATE** — Saat mengubah data
- **DELETE** — Saat menghapus data
- **VIEW** — Saat melihat detail data (opsional)
- **ASSIGN** — Saat menugaskan ke technician
- **APPROVE/REJECT** — Saat approve/reject data

---

## 6. Ringkasan Status

### Status yang Berlaku di Sistem

**Yearly Standard Maintenance:**
- `DRAFT` → Baru dibuat
- `ACTIVE` → Sudah aktif
- `REJECTED` → Ditolak
- `WAITING_FOR_DELETION` → Menunggu approval hapus

**Maintenance Schedule:**
- `ACTIVE` → Jadwal aktif
- `CANCELLED` → Jadwal dibatalkan
- `COMPLETED` → Jadwal selesai

**Log Sheet:**
- `OPEN` → Belum disubmit
- `SUBMITTED` → Sudah disubmit
- `APPROVED` → Sudah di-approve

**Ticket:**
- `OPEN` → Belum ditugaskan
- `IN_PROGRESS` → Sedang dikerjakan
- `RESOLVED` → Selesai
- `CLOSED` → Ditutup
- `CANCELLED` → Dibatalkan

**Work Order:**
- `OPEN` → Belum mulai
- `IN_PROGRESS` → Sedang dikerjakan
- `COMPLETED` → Selesai
- `CLOSED` → Ditutup
- `FAILED` → Gagal

**Asset:**
- `ACTIVE` → Aktif digunakan
- `REPAIR` → Sedang diperbaiki
- `RETIRED` → Tidak aktif (di-retire)
- `DISPOSED` → Dihapus/dibuang

---

## 7. Catatan Tambahan

1. **Semua perubahan data harus tercatat** di Audit Log untuk keperluan compliance
2. **Asset Lifecycle hanya untuk perubahan status** — tidak untuk update data biasa
3. **Schedule cancellation harus pakai alasan** — tidak bisa tanpa reason
4. **Log sheet harus dibuat oleh pembuatnya** — tidak boleh dihapus orang lain
5. **Yearly Standard Maintenance yang sudah ACTIVE harus pakai request delete** — tidak bisa hapus langsung
6. **User yang sudah deactivated tidak bisa login** — tapi datanya tetap ada untuk audit