import 'dotenv/config';
import { StandardMaintenance } from '../src/models/index.js';

async function run() {
  try {
    const list = await StandardMaintenance.findAll({ raw: true });
    console.log("Total standard maintenance records:", list.length);
    const categories = [...new Set(list.map(item => item.kategori))];
    console.log("Categories present in DB:", categories);
    
    // Print first 5 items
    console.log("Sample records:");
    console.log(JSON.stringify(list.slice(0, 5), null, 2));
    
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
run();
