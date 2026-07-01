import 'dotenv/config';
import sequelize from '../src/config/db/db.js';
import models from '../src/models/index.js';

const syncMaintenance = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Syncing Maintenance models...');
    
    // Core standard maintenance models
    await models.YearlyStandardMaintenance.sync();
    await models.StandardMaintenance.sync();
    await models.StandardMaintenanceDetail.sync();
    await models.StandardMaintenanceCheck.sync();
    
    // Schedules and transactions
    await models.MaintenanceSchedule.sync();
    await models.MaintenanceActual.sync();
    await models.MaintenanceAbnormalLog.sync();
    await models.MaintenanceLogSheet.sync();

    console.log('Maintenance models synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

syncMaintenance();
