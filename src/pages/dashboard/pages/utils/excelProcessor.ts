import { jsonToExcelMapping } from './excelMapping';
import * as XLSX from 'xlsx';

interface Answers {
  [key: string]: string | number | boolean | null; // Adjust as needed based on your data structure
}

export const processExcelFile = async (template: ArrayBuffer, data: { answers: Record<string, Answers> }): Promise<ArrayBuffer> => {
  const workbook = await loadWorkbook(template);

  Object.entries(jsonToExcelMapping.Inputs).forEach(([field, cellLocation]) => {
    const worksheet = workbook.Sheets["Inputs"];

    const value = data.answers[field];

    if (value !== undefined) {
      if (cellLocation.includes('-')) {
        // Handle range of cells
        const [startCell, endCell] = cellLocation.split('-');
        const startRow = parseInt(startCell.substring(1));
        const endRow = parseInt(endCell.substring(1));

        for (let row = startRow; row <= endRow; row++) {
          const cell = `D${row}`;
          worksheet[cell] = { v: value, t: 's' };
        }
      } else if (cellLocation.includes('>>')) {
        // Handle mapping to multiple cells
        const cells = cellLocation.split('>>').map((cell) => cell.trim());
        cells.forEach((cell) => {
          worksheet[cell] = { v: value, t: 's' };
        });
      } else {
        // Single cell update
        worksheet[cellLocation] = { v: value, t: 's' };
      }
    }
  });

  return generateExcelFile(workbook);
};

const loadWorkbook = async (template: ArrayBuffer): Promise<XLSX.WorkBook> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(template, { type: 'array' });
      resolve(workbook);
    } catch (error) {
      reject(error);
    }
  });
};

const generateExcelFile = (workbook: XLSX.WorkBook): ArrayBuffer => {
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};
