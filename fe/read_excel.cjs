const xlsx = require('xlsx'); 
const path = require('path');
const fs = require('fs');
const wb = xlsx.readFile(path.join(__dirname, '../be/BUDGETASET.xlsx')); 

let out = '';
for (const sheetName of wb.SheetNames) {
  if (['Sheet1', 'Category', '目的区分 Purpose'].includes(sheetName)) continue;
  const sheet = wb.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, {header: 1, range: 0});
  
  let rateIdx = -1;
  let budgetIdx = -1;
  for (let i = 0; i <= 6; i++) {
    if (!jsonData[i]) continue;
    for (let j = 0; j < jsonData[i].length; j++) {
      const v = String(jsonData[i][j] || '');
      if (v.includes('Rate') && rateIdx === -1) rateIdx = j;
      if (v.includes('Budget') && !v.includes('No') && budgetIdx === -1) budgetIdx = j;
    }
  }

  out += `Sheet ${sheetName}: Rate at ${rateIdx}, Budget at ${budgetIdx}\n`;
}
fs.writeFileSync(path.join(__dirname, 'excel_output3.txt'), out);
