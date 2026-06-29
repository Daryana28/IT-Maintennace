CURRENT STATE SUMMARY (29 June 2026)
Goal
Fix IT Maintenance (ITAM) project: user wants Standard Maintenance import → data shows in Schedule tab without auto-creating schedules/actuals from asset table. The imported data should display directly.

Current Status: WORKING

DB State
- 3 SMs, 4 details, 4 checks, 5 actuals, 1 abnormal log, 1 log sheet
- SMs: HARDWARE/CCTV/NVR, HARDWARE/Camera/CCTV, HARDWARE/GATHERING/PC Industrial
- DB: ITAM on 172.17.100.9:1433, user AppPIK

What Was Done (all working)

Backend Changes:
1. maintenance_actual.schedule_id → nullable (model + DB migration)
2. maintenance_log_sheets.schedule_id → nullable (model + DB migration)
3. getMonthlyScheduleMatrix generates virtual checkboxes from periodik dates + merges existing actuals by check_id
4. Fixed date range bug (hardcoded -31 → dayjs().endOfMonth())
5. Added POST /maintenance-actual (createActualEntry) — creates actual without schedule_id
6. Added POST /maintenance-actual/upsert (upsertAndSetStatus) — find-or-create + update status
7. Fixed getAllAbnormalLogs — removed empty where, added required:false on all nested includes
8. Added as aliases to model belongsTo associations (standard_maintenance_detail, standard_maintenance)

Frontend Changes:
1. ScheduleWithCheckboxView handles virtual checkboxes (creates actual on first click via upsert)
2. handleAbnormalClick creates actual before opening AbnormalModal
3. Cleaned up debug console.logs in useScheduleData.js
4. Added upsertActualEntry and createActualEntry API calls to maintenanceScheduleService

Deleted:
- be/check_dupes.js
- be/cleanup.js

What Needs To Be Done If Any:
- Verify that Standard Maintenance import → Schedule tab → checkboxes visible → clickable is fully tested
- Verify Log Sheet tab shows abnormal records
