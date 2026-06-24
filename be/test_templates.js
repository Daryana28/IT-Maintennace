import http from 'http';
import xlsx from 'xlsx';

const categories = ['hardware', 'software_hw', 'application', 'network_cyber'];

const testCategory = (cat) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/api/standard-maintenance/template/${cat}`, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download template for ${cat}: Status ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            reject(new Error(`Sheet not found in ${cat} workbook`));
            return;
          }
          const range = xlsx.utils.decode_range(worksheet['!ref']);
          console.log(`✓ Template parsed for ${cat}: range col count is ${range.e.c + 1}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

const run = async () => {
  try {
    for (const cat of categories) {
      await testCategory(cat);
    }
    console.log('✓ All categories verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
