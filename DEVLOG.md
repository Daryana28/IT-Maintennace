# Developer Log: ITAM Maintenance Refactoring

## 🗒️ Logs

### [2026-06-23 20:31] - T-001 - Devops Architect
- **Summary**: Initialized project tracking infrastructure.
- **Technical Decisions**: Created central files `ROADMAP.md`, `BACKLOG.md`, and `DEVLOG.md` at the root of the repository to maintain atomic compliance.
- **Blockers**: None.
- **Next Step**: Commit changes to Git and move to database schema migrations (T-002).

### [2026-06-23 20:34] - T-002 - Backend Dev
- **Summary**: Wrote and executed schema alterations and table creation scripts for refactored maintenance tables.
- **Technical Decisions**: Created `maintenance_actual` and `maintenance_abnormal_logs` tables in `ITAM` DB, added columns (`periodik_type`, `periodik_freq`, `periodik_unit`) to `maintenance_schedules`, and added `actual_id` to `maintenance_log_sheets`. Changed `DB_USER` in `.env` to `sa` to resolve login credentials issue.
- **Blockers**: None (resolved initial login issue by switching to 'sa' user).
- **Next Step**: Define Sequelize models and update DB associations in `be/src/models/index.js` (T-003).

### [2026-06-23 20:36] - T-003 - Backend Dev
- **Summary**: Created Sequelize model definitions for new tables and updated database associations.
- **Technical Decisions**: Created `maintenanceActualModel.js` and `maintenanceAbnormalLogModel.js`. Modified `maintenanceScheduleModel.js` and `maintenanceLogSheetModel.js` models. Updated imports, instantiations, associations, and exports in `be/src/models/index.js`.
- **Blockers**: None.
- **Next Step**: Implement target generation logic in `be/src/modules/cmms/maintenanceSchedule/checkboxGenerator.js` (T-004).

### [2026-06-23 20:38] - T-004 - Backend Dev
- **Summary**: Implemented core calculation engine for schedule checkbox dates generation.
- **Technical Decisions**: Created `checkboxGenerator.js` with functions `parsePeriodik`, `getHolidaysSet`, `isWorkingDay`, and `generateCheckboxDates` supporting weekly (1x and 2x), monthly, quarterly, half-yearly, and yearly periodicity logic while excluding weekends and holidays.
- **Blockers**: None (fixed Sequelize Op import issue).
- **Next Step**: Implement Schedule Checkbox & Actual API endpoints (T-005).

### [2026-06-23 20:40] - T-005 - Backend Dev
- **Summary**: Implemented endpoints and logic for schedule checkbox cell generation and toggling status.
- **Technical Decisions**: Created new `/maintenance-actual` module and registered it in Express. Added `generateCheckboxes` (bulk creation of `PLAN` cells) and `getScheduleCheckboxes` (fetch checkboxes joined with abnormal logs) to `maintenanceScheduleController.js`. Implemented `updateActualStatus` in `maintenanceActualController.js` supporting PLAN <-> ACTUAL status/legend toggling and cleaning up associated logs. Updated `generateSchedule` to auto-run cell generation on schedule creation.
- **Blockers**: None.
- **Next Step**: Implement Abnormal Logs API endpoints (T-006).

### [2026-06-23 20:42] - T-006 - Backend Dev
- **Summary**: Created endpoints for submitting and retrieving abnormal logs.
- **Technical Decisions**: Implemented `submitAbnormalLog` (which creates/updates the abnormal log, sets actual status to `ABNORMAL` and legend to `✗`, and creates/syncs a corresponding record in `maintenance_log_sheets` for backwards compatibility), `getAllAbnormalLogs`, and `getAbnormalLogsBySchedule` inside `maintenanceAbnormalLogController.js`. Registered routes under `/maintenance-abnormal-logs` and `/maintenance-actual/:id/abnormal`.
- **Blockers**: None.
- **Next Step**: Implement the monthly view matrix endpoint (T-007).

### [2026-06-23 20:44] - T-007 - Backend Dev
- **Summary**: Implemented the monthly view matrix endpoint (`GET /monthly-view`) to query grouped schedule and checking statuses.
- **Technical Decisions**: Implemented `getMonthlyScheduleMatrix` inside `maintenanceScheduleController.js` which queries schedules, maps categories to backend categories, loads checks and standard details, and filters `MaintenanceActual` checkboxes by year and month. Registered `/monthly-view` in `maintenanceScheduleRoute.js`.
- **Blockers**: None.
- **Next Step**: Restructure frontend routes and add category tabs component (T-008).






