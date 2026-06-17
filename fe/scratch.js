import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('d:/DEV/REACT/ITAM/New folder/standard import.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log("Headers:");
console.log(data[0]);
