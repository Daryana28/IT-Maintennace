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
- **Next Step**: Implement standard maintenance templates with spreadsheet tables (T-009).

### [2026-06-23 20:46] - T-009 - Frontend Dev
- **Summary**: Designed and built the standard maintenance page.
- **Technical Decisions**: Implemented `StandardMaintenancePage.jsx` with nested components (`ListTab`, `ReviewTab`, `ApprovalTab`, `ImportTab`) and integrated standard actions. Added `excelTemplateGenerator.js` to create category-specific layouts.
- **Blockers**: None.
- **Next Step**: Implement the checkbox matrix view for schedules (T-010).

### [2026-06-23 20:48] - T-010 - Frontend Dev
- **Summary**: Implemented the schedule matrix view with checkbox cell matrixes.
- **Technical Decisions**: Created `ScheduleWithCheckboxView.jsx` incorporating a visual table of monthly days, mapping color-coded checkboxes (Plan: `□`, Actual: `✓`, Abnormal: `✗`) and handling status toggle menus.
- **Blockers**: None.
- **Next Step**: Create the abnormal report input modal (T-011).

### [2026-06-23 20:48] - T-011 - Frontend Dev
- **Summary**: Built the report modal for abnormal logs.
- **Technical Decisions**: Implemented `AbnormalModal.jsx` to allow technicians to report damages (fields: deskripsi_kerusakan, tindakan) and trigger `submitAbnormalLog` api handler.
- **Blockers**: None.
- **Next Step**: Build the abnormal logs list page (T-012).

### [2026-06-23 20:49] - T-012 - Frontend Developer
- **Summary**: Implemented the sheet abnormal list view page.
- **Technical Decisions**: Created `MaintenanceLogSheetPage.jsx` rendering detailed summaries of abnormal checks with status tag indicators, damages descriptions, actions taken, and log creation timestamps.
- **Blockers**: None.
- **Next Step**: Perform integration and contract testing between modules (T-013).

### [2026-06-23 20:55] - T-013 - Integrator / QA Dev
- **Summary**: Executed full integration and testing suite on database, express controllers, and frontends.
- **Technical Decisions**: Validated that clicking checkboxes updates database rows and writes corresponding logs correctly. Fixed date-handling mismatches in database queries.
- **Blockers**: None.
- **Next Step**: Proceed with next feature sprint (Standard Maintenance Excel Import).

### [2026-06-24 21:20] - T-014 - Database / Backend Developer
- **Summary**: Executed migrations to support Excel file importing context.
- **Technical Decisions**: Ran alter queries to add audit columns `source_file`, `imported_by`, and `imported_at` to table `standard_maintenances` inside SQL Server database, and added properties to Sequelize model mapping.
- **Blockers**: None.
- **Next Step**: Implement backend excel parser logic, generators, and routes (T-015).

### [2026-06-24 21:24] - T-015 - Backend Developer
- **Summary**: Implemented excel template generation and upload parsing logic.
- **Technical Decisions**: Added `xlsx` file parser logic in `standardMaintenanceController.js` mapping rows and cells into database items, skipping duplicates. Wrote dynamic template buffer generation inside `excelTemplateGenerator.js`.
- **Blockers**: None.
- **Next Step**: Design and implement the ImportTab UI on the frontend (T-016).

### [2026-06-24 21:28] - T-016 - Frontend Developer
- **Summary**: Designed and built the ImportTab excel uploader tab on the frontend.
- **Technical Decisions**: Created `ImportTab.jsx` with progressive steps flow (Download template, Select & Review, Done) and alert cards. Added axios file upload form handlers.
- **Blockers**: None.
- **Next Step**: Implement user profile controller and routes on backend (T-017).

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

### [2026-06-24 21:40] - T-019 - Lead DevOps / Integrator
- **Summary**: Completed end-to-end integration testing and verified standard maintenance and user profile flows.
- **Technical Decisions**: Ran code verification checks and confirmed successful production builds. Verified merge-cell parse rules for Hardware/Infrastructure Excel uploads, file downloads, avatar image storage uploads, and database validations. Recorded completion state in `walkthrough.md`.
- **Blockers**: None.
- **Next Step**: Deliver final walkthrough to the user and close sprint.

### [2026-06-24 21:44] - T-020 - System Architect
- **Summary**: Implemented database changes and model attributes for password redirect requirements.
- **Technical Decisions**: Added column `must_change_password` (BIT NOT NULL DEFAULT 1) to the `users` table via Raw SQL queries in a transaction script, and updated Sequelize model `User` configuration to match.
- **Blockers**: None.
- **Next Step**: Consolidate Network & Cybersecurity child menu items (T-021).

### [2026-06-24 21:46] - T-021 - Frontend Developer
- **Summary**: Consolidated Network and Cybersecurity child menus into a single menu.
- **Technical Decisions**: Replaced the separate Network and Cybersecurity sidebar menus in `menuConfig.jsx` with a single unified `Network & Cybersecurity` menu item. Updated category parsing and tab items in `MaintenancePage.jsx` to map key `network-cyber`.
- **Blockers**: None.
- **Next Step**: Simplify Standard Maintenance tabs view (T-022).

### [2026-06-24 21:48] - T-022 - Frontend Developer
- **Summary**: Simplified standard maintenance layout and added warning alerts.
- **Technical Decisions**: Modified `StandardMaintenancePage.jsx` to directly render the `ImportTab` component and completely hide the Tabs switcher. Appended a warning box alert detailing schedule plan-shifting rules in `ImportTab.jsx`.
- **Blockers**: None.
- **Next Step**: Implement middle-period schedule actuals resync logic on the backend (T-023).

### [2026-06-24 21:50] - T-023 - Backend Developer
- **Summary**: Implemented actuals resync engine on Excel import/generation.
- **Technical Decisions**: Modified `generateSchedule` and `generateCheckboxes` inside `maintenanceScheduleController.js` to preserve inspected ACTUAL and ABNORMAL cells, shift/delete obsolete PLAN cells, and create new PLAN cells without touching audited history records.
- **Blockers**: None.
- **Next Step**: Update user creation to auto-generate password on backend (T-024).

### [2026-06-24 21:52] - T-024 - Backend Developer
- **Summary**: Updated User creation service to support auto-generated passwords.
- **Technical Decisions**: Modified `userService.create` to generate a random 8-character password, set `must_change_password` flag to true, and return the plaintext password and hash details.
- **Blockers**: None.
- **Next Step**: Implement reset password flow on backend and frontend (T-025).

### [2026-06-24 21:54] - T-025 - Backend / Frontend Developer
- **Summary**: Implemented admin reset password flow with popconfirm validations.
- **Technical Decisions**: Added POST `/api/users/:id/reset-password` endpoint. Integrated KeyOutlined action button with Popconfirm in `UserTable.jsx` and display credential details inside dynamic `Modal.info` popups.
- **Blockers**: None.
- **Next Step**: Implement redirect guard on first-time login (T-026).

### [2026-06-24 21:56] - T-026 - Frontend Developer
- **Summary**: Implemented first-time login redirect guard and warning alerts.
- **Technical Decisions**: Updated `MainLayout.jsx` to intercept routes when `must_change_password` is set, forcing redirect to Profile page and displaying a warning alert. Custom-filtered sidebar menus in `Sidebar.jsx` to only display Profile menu during password-change state.
- **Blockers**: None.
- **Next Step**: E2E testing, polish, and devlog synchronization (T-027).

### [2026-06-24 21:58] - T-027 - Lead DevOps / Integrator
- **Summary**: Performed final E2E testing, fixed redirect loop on password changes, case-insensitive role match errors, and Excel template download 404 routes.
- **Technical Decisions**:
  1. Updated `changePassword` in backend `userController.js` to sign and set new access and refresh token cookies with `must_change_password: 0` and return them on success. Integrated client-side `ProfilePage.jsx` to update the global auth store state using the new tokens to prevent redirect loop.
  2. Modified backend `roleMiddleware.js` to convert roles to uppercase before comparison, enabling case-insensitive matching for `SUPERADMIN`/`ADMIN` role checks (fixing 403 Forbidden errors when adding users).
  3. Prepended `VITE_API_URL` to the download url in `ImportTab.jsx` to target the backend API server directly instead of the Vite dev server.
- **Blockers**: None.

### [2026-06-24 22:50] - T-028 s.d. T-035 - Lead DevOps / Backend & Frontend Developer
- **Summary**: Implemented standard maintenance date-mapping refactoring and user management password hash displays.
- **Technical Decisions**:
  1. **Database Schema**: Executed `alter_planned_dates.js` adding the `planned_dates` (NVARCHAR(MAX)) column to standard maintenance checks and configured Sequelize JSON serialization.
  2. **Excel Template**: Removed month/day columns from the template generator worksheet, restricting headers up to column index 24.
  3. **Backend Sync Engine**: Refactored `importStandardMaintenance` to parse and return JSON configuration without saving. Added `/save-and-generate` to upsert configurations, sync asset schedules, delete orphaned checks (preserving those with logged history), and preserve completed checkboxes (Normal/Abnormal) while shifting planned checks. Added `/reset` to clean all category and year configurations.
  4. **Calendar Preview Grid**: Developed `PreviewGrid.jsx` and `PreviewGrid.css` with sticky columns, scrollable days of the year, weekend visual highlighting, check item additions/deletions, and strict periodic validations (Weekly, Monthly, Quarterly checks).
  5. **Import flow**: Integrated `ImportTab.jsx` with Edit Current and Reset choices, file upload parsing, and E2E confirmations.
  6. **User Management**: Fixed axios unwrapping bug in `UserManagementPage.jsx` when reading the auto-generated user details from `res.data`.
- **Blockers**: None.
