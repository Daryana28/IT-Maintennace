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

