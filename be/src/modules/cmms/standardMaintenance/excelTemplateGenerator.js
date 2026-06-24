import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const MONTH_DAYS = [
  { name: 'JANUARI', days: 31 },
  { name: 'FEBRUARI', days: 29 }, // Leap year friendly/standard max
  { name: 'MARET', days: 31 },
  { name: 'APRIL', days: 30 },
  { name: 'MEI', days: 31 },
  { name: 'JUNI', days: 30 },
  { name: 'JULI', days: 31 },
  { name: 'AGUSTUS', days: 31 },
  { name: 'SEPTEMBER', days: 30 },
  { name: 'OKTOBER', days: 31 },
  { name: 'NOVEMBER', days: 30 },
  { name: 'DESEMBER', days: 31 }
];

export const generateTemplate = (kategoriKey) => {
  const wb = xlsx.utils.book_new();
  const ws = {};
  
  // Set default title based on category
  let title = 'JADWAL MAINTENANCE HARDWARE';
  let sheetName = 'Jadwal Hardware';
  
  if (kategoriKey === 'SOFTWARE_HW') {
    title = 'JADWAL MAINTENANCE SOFTWARE HARDWARE';
    sheetName = 'Jadwal Hardware';
  } else if (kategoriKey === 'APPLICATION') {
    title = 'JADWAL MAINTENANCE APLIKASI';
    sheetName = 'Jadwal Maintenance Aplikasi';
  } else if (kategoriKey === 'NETWORK_CYBER') {
    title = 'JADWAL MAINTENANCE CYBER & NETWORK';
    sheetName = 'Jadwal Cyber & Network';
  }
  
  // Row 0
  ws[xlsx.utils.encode_cell({ c: 3, r: 0 })] = { v: title };
  
  // Row 4
  const r4Headers = [
    { c: 0, v: 'No' },
    { c: 1, v: 'Kategori' },
    { c: 2, v: 'Nama Perangkat' },
    { c: 3, v: 'Sub Perangkat' },
    { c: 4, v: 'No' },
    { c: 5, v: 'Fungsi' },
    { c: 6, v: 'DESC' },
    { c: 7, v: 'Pengecekan' },
    { c: 8, v: 'Pengecekan Normal' },
    { c: 24, v: '2026' }
  ];
  r4Headers.forEach(h => {
    ws[xlsx.utils.encode_cell({ c: h.c, r: 4 })] = { v: h.v };
  });
  
  // Row 5
  ws[xlsx.utils.encode_cell({ c: 8, r: 5 })] = { v: 'STANDART' };
  
  // Row 6
  ws[xlsx.utils.encode_cell({ c: 8, r: 6 })] = { v: 'HARDWARE' };
  ws[xlsx.utils.encode_cell({ c: 12, r: 6 })] = { v: 'INFRASTRUCTURE' };
  ws[xlsx.utils.encode_cell({ c: 16, r: 6 })] = { v: 'SOFTWARE' };
  ws[xlsx.utils.encode_cell({ c: 20, r: 6 })] = { v: 'CYBER SECURITY' };
  ws[xlsx.utils.encode_cell({ c: 24, r: 6 })] = { v: 'Periodik' };
  
  let currentCol = 25;
  MONTH_DAYS.forEach(m => {
    ws[xlsx.utils.encode_cell({ c: currentCol, r: 6 })] = { v: m.name };
    currentCol += m.days;
  });
  
  // Row 7 (Sub headers)
  const subTypesArr = ['HARDWARE', 'INFRASTRUCTURE', 'SOFTWARE', 'CYBER SECURITY'];
  subTypesArr.forEach((t, idx) => {
    const baseC = 8 + (idx * 4);
    ws[xlsx.utils.encode_cell({ c: baseC, r: 7 })] = { v: idx === 0 ? 'Standar' : 'STANDART' };
    ws[xlsx.utils.encode_cell({ c: baseC + 1, r: 7 })] = { v: 'Bagian' };
    ws[xlsx.utils.encode_cell({ c: baseC + 2, r: 7 })] = { v: idx === 1 ? 'Methode' : 'Methode' }; // standard spelling
    ws[xlsx.utils.encode_cell({ c: baseC + 3, r: 7 })] = { v: idx === 1 || idx === 2 ? 'ALAT' : 'Alat' };
  });
  
  currentCol = 25;
  MONTH_DAYS.forEach(m => {
    for (let day = 1; day <= m.days; day++) {
      ws[xlsx.utils.encode_cell({ c: currentCol, r: 7 })] = { v: String(day) };
      currentCol++;
    }
  });
  
  // Row 8 (Sample Row)
  const sampleData = {
    c0: '1',
    c1: 'CCTV',
    c2: 'NVR',
    c3: 'NVR',
    c4: '1',
    c5: 'Recording',
    c6: 'NVR bisa menyimpan Data Recording Kamera ke Storage HDD',
    c7: 'Cek symbol REC',
    c8: 'Symbol REC menyala merah',
    c9: 'Main Menu',
    c10: 'Visual Check',
    c11: 'Software',
    c12: 'Di Aplikasi REC tidak menyala',
    c13: 'Display Main View',
    c14: 'Visual Check',
    c15: 'Aplikasi',
    c24: '1X/W'
  };
  
  ws[xlsx.utils.encode_cell({ c: 0, r: 8 })] = { v: sampleData.c0 };
  ws[xlsx.utils.encode_cell({ c: 1, r: 8 })] = { v: sampleData.c1 };
  ws[xlsx.utils.encode_cell({ c: 2, r: 8 })] = { v: sampleData.c2 };
  ws[xlsx.utils.encode_cell({ c: 3, r: 8 })] = { v: sampleData.c3 };
  ws[xlsx.utils.encode_cell({ c: 4, r: 8 })] = { v: sampleData.c4 };
  ws[xlsx.utils.encode_cell({ c: 5, r: 8 })] = { v: sampleData.c5 };
  ws[xlsx.utils.encode_cell({ c: 6, r: 8 })] = { v: sampleData.c6 };
  ws[xlsx.utils.encode_cell({ c: 7, r: 8 })] = { v: sampleData.c7 };
  ws[xlsx.utils.encode_cell({ c: 8, r: 8 })] = { v: sampleData.c8 };
  ws[xlsx.utils.encode_cell({ c: 9, r: 8 })] = { v: sampleData.c9 };
  ws[xlsx.utils.encode_cell({ c: 10, r: 8 })] = { v: sampleData.c10 };
  ws[xlsx.utils.encode_cell({ c: 11, r: 8 })] = { v: sampleData.c11 };
  ws[xlsx.utils.encode_cell({ c: 12, r: 8 })] = { v: sampleData.c12 };
  ws[xlsx.utils.encode_cell({ c: 13, r: 8 })] = { v: sampleData.c13 };
  ws[xlsx.utils.encode_cell({ c: 14, r: 8 })] = { v: sampleData.c14 };
  ws[xlsx.utils.encode_cell({ c: 15, r: 8 })] = { v: sampleData.c15 };
  ws[xlsx.utils.encode_cell({ c: 24, r: 8 })] = { v: sampleData.c24 };
  
  // Set sheet range ref
  ws['!ref'] = xlsx.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: currentCol - 1, r: 8 }
  });
  
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const ensureTemplatesDirectory = () => {
  const dirPath = path.resolve('../@docs/templates');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('Created templates directory at @docs/templates');
  }
};
