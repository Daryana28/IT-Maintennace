import 'dotenv/config';
import sequelize from './src/config/db/db.js';

const run = async () => {
  try {
    console.log('Altering standard_maintenance_checks text columns...');
    await sequelize.query('ALTER TABLE standard_maintenance_checks ALTER COLUMN pengecekan NVARCHAR(MAX) NULL;');
    await sequelize.query('ALTER TABLE standard_maintenance_checks ALTER COLUMN [standard] NVARCHAR(MAX) NULL;');
    console.log('Success');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
