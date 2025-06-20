import * as XLSX from 'xlsx';
import { ExcelRow, ProcessedData } from '@/types/excel';

export function parseExcelFile(file: File): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          reject(new Error('No sheets found in the Excel file'));
          return;
        }
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Validate required columns
        const requiredColumns = [
          'Person Names',
          'Roles', 
          'Companies',
          'Cabin',
          'Bunk',
          'MusterStation General Alarm primary',
          'Status'
        ];
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          reject(new Error(`Invalid file format or missing data. Missing columns: ${missingColumns.join(', ')}`));
          return;
        }
        
        // Filter occupied rows
        const occupiedRows = jsonData.filter(row => 
          row['Status'] && row['Status'].toString().toLowerCase() === 'occupied'
        ) as ExcelRow[];
        
        // Group by muster station
        const groups = ['LB1', 'LB2', 'LB3', 'LB4', 'LB5', 'LB6', 'LB7'];
        const groupedData: Record<string, ExcelRow[]> = {};
        
        groups.forEach(group => {
          groupedData[group] = occupiedRows.filter(row => {
            const musterStation = row['MusterStation General Alarm primary'];
            if (!musterStation) return false;
            // Extract LB number from strings like "LB5 - Deck 3 PS" or just "LB1"
            const match = musterStation.toString().match(/LB(\d+)/i);
            return match && `LB${match[1]}` === group;
          });
        });
        
        const processedData: ProcessedData = {
          groups: groups, // Include all groups, even if empty
          totalRows: jsonData.length,
          occupiedRows: occupiedRows.length,
          data: groupedData
        };
        
        resolve(processedData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function validateExcelFile(file: File): string | null {
  if (!file) {
    return 'No file selected';
  }
  
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return 'Unsupported or unknown file type. Please upload a valid Excel (.xlsx) file.';
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return 'File size too large. Please upload a file smaller than 10MB.';
  }
  
  return null;
}
