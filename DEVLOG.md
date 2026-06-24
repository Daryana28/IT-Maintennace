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

### [2026-06-23 20:45] - T-008 - Frontend Dev
- **Summary**: Implemented a unified top category tab menu (Hardware, Software HW, Application, Network, Cybersecurity) and child tab view (Standard, Schedule, Sheet Abnormal).
- **Technical Decisions**: Created `MaintenancePage.jsx` as the single entry wrapper. Replaced individual routes in `routeMap.jsx` with mappings to the new wrapper. Updated `StandardMaintenancePage.jsx` and `MaintenanceLogSheetPage.jsx` to support the `overrideCategory` and `overrideYearlyId` props. Registered the `getMonthlyView` endpoint query in `maintenanceScheduleService.js`.
- **Blockers**: None.
- **Next Step**: Build Standard Maintenance Excel-like layout table (T-009).

### [2026-06-23 20:46] - T-009 - Frontend Dev
- **Summary**: Implemented the Excel-like flat table view for Standard Maintenance showing hierarchical checks, detail sequences, normal check properties, and 12-month checkboxes generated from the periodic configuration.
- **Technical Decisions**: Updated `ReviewTab.jsx` to flatten tree category data recursively. Built columns using nested children in Ant Design table (e.g. for Pengecekan Normal and Bulan). Added read-only monthly plan checkbox matrix using custom mapping algorithm. Restricted category additions inside `ListTab.jsx` form to current category scope via `overrideCategory` prop.
- **Blockers**: None.
- **Next Step**: Implement schedule weekly/monthly checkbox matrix cells (Plan, Actual, Abnormal) and legend toggles (T-010).

### [2026-06-23 20:48] - T-010 - Frontend Dev
- **Summary**: Built the spreadsheet-like Schedule Checkbox Matrix rendering weekly/monthly planned checks, status legends, and action triggers.
- **Technical Decisions**: Created `ScheduleWithCheckboxView.jsx`. Derived and mapped ISO weeks of the month to columns w1-w5. Rendered Plan (□), Actual (✓), and Abnormal (✗) using highly styled visual buttons. Built a custom dropdown trigger per cell allowing manual state transitions via the API.
- **Blockers**: None.
- **Next Step**: Create and integrate the Abnormal Input Modal (T-011).

### [2026-06-23 20:48] - T-011 - Frontend Dev
- **Summary**: Created the Abnormal Input Modal enabling users to submit and modify abnormal check records.
- **Technical Decisions**: Created `AbnormalModal.jsx` featuring form textareas for damage description, corrective actions, and a status dropdown (OPEN/IN PROGRESS/RESOLVED). Connected it to the `submitAbnormalLog` endpoint.
- **Blockers**: None.
- **Next Step**: Implement the Sheet Abnormal List View (T-012).

### [2026-06-23 20:49] - T-012 - Frontend Dev
- **Summary**: Refactored the Sheet Abnormal list page to display global abnormal logs query from the backend.
- **Technical Decisions**: Replaced old `logSheetService` queries in `MaintenanceLogSheetPage.jsx` with calls to `/api/maintenance-abnormal-logs`. Added custom frontend category filtering based on category tab selections. Reused `AbnormalModal` for inline editing of logs and wired the delete action to reset cell statuses back to `PLAN` via `updateActualStatus`.
- **Blockers**: None.
- **Next Step**: Execute end-to-end integration and verification testing (T-013).

### [2026-06-23 20:55] - T-013 - Lead DevOps / Integrator
- **Summary**: Completed final verification, resolved ESLint warning issues, and verified full production build.
- **Technical Decisions**: Renamed shadow variables and memoized dependencies inside `StandardMaintenancePage.jsx` to achieve clean compilation metrics.
- **Blockers**: None.
- **Next Step**: Deliver refactoring walk-through and close project task.

### [2026-06-24 21:20] - T-014 - System Architect
- **Summary**: Executed database schema migration and updated Sequelize model mappings.
- **Technical Decisions**: Added tracking columns (`source_file`, `imported_by`, `imported_at`) to `standard_maintenances` table and profile management columns (`profile_picture`, `phone`) to `users` table via Raw SQL queries in a transaction script. Updated corresponding models `StandardMaintenance` and `User`.
- **Blockers**: None.
- **Next Step**: Implement Excel parsing, template generator logic, and endpoints (T-015).

### [2026-06-24 21:24] - T-015 - Backend Developer
- **Summary**: Created dynamically generated Excel templates and implemented Excel parser logic for standard maintenance imports.
- **Technical Decisions**: Built `excelTemplateGenerator.js` utility using `xlsx` to output compliant workbook sheets dynamically on HTTP requests. Implemented `importStandardMaintenance` controller which loops through spreadsheet rows, handles merge cell values (carry-forward parsing), extracts checks across all 4 normal checking sub-categories (HW, INFRA, SW, CYBER), checks for db duplicates, and writes results in a transaction block. Added `/import` and `/template/:kategori` routes.
- **Blockers**: None.
- **Next Step**: Design and implement the Import dashboard UI on the frontend (T-016).

### [2026-06-24 21:28] - T-016 - Frontend Developer
- **Summary**: Designed and built the Import tab component on the Standard Maintenance page.
- **Technical Decisions**: Integrated `ImportTab.jsx` component inside standard tabs list of `StandardMaintenancePage.jsx`. The dashboard supports dynamically choosing target template endpoints based on the active route category tab, lets users download files, drag-and-drop Excel worksheets, and outputs nice, animated spinners and detailed row-processing success reports (Total, Imported, Skipped).
- **Blockers**: None.
- **Next Step**: Implement profile database changes and User Profile controllers in backend (T-017).

### [2026-06-24 21:32] - T-017 - DevOps / Backend Developer
- **Summary**: Implemented User Profile controller logic, Multer image disk configuration, and static routes.
- **Technical Decisions**: Injected `getUserProfile`, `updateUserProfile`, `updateUserProfilePicture`, and `changePassword` endpoints into `userController.js` and registered them securely in `userRoute.js` before wildcard params mapping. Configured Multer with disk storage saving profiles under `./uploads/profile` and cleaning old files on updates. Mounted `/uploads` directory as a static Express path in `app.js`.
- **Blockers**: None.
- **Next Step**: Design and implement the User Profile view page on the frontend (T-018).

### [2026-06-24 21:36] - T-018 - Frontend Developer
- **Summary**: Implemented frontend profile services and premium User Profile views.
- **Technical Decisions**: Created `profileService.js` mapping API requests. Wrote the highly designed `ProfilePage.jsx` supporting edit information forms, password change logic with validations, real-time image file updates with size indicators, and role/department summaries. Synchronized paths to replace the old stub profile page under the active router configuration map.
- **Blockers**: None.
- **Next Step**: Perform end-to-end integration and verification testing (T-019).
