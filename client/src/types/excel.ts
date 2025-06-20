export interface ExcelRow {
  "Person Names": string;
  "Roles": string;
  "Companies": string;
  "Cabin": string;
  "Bunk": string;
  "MusterStation General Alarm primary": string;
  "Status": string;
}

export interface ProcessedData {
  groups: string[];
  totalRows: number;
  occupiedRows: number;
  data: Record<string, ExcelRow[]>;
}

export interface Settings {
  orientation: 'portrait' | 'landscape';
  printMode: 'double' | 'single';
  colorPrint: boolean;
  theme: 'light' | 'dark' | 'sepia';
  fontSize: '6' | '7' | '8' | '9' | '10' | '11' | '12' | '14' | '16';
  fontFamily: 'Arial' | 'Helvetica' | 'Times' | 'Courier' | 'Verdana';
  textAlign: 'left' | 'center' | 'right';
  primaryRowColor: 'white' | 'light-gray' | 'light-blue' | 'light-green' | 'light-yellow' | 'light-purple' | 'light-pink' | 'light-orange';
  alternateRowColor: 'white' | 'light-gray' | 'light-blue' | 'light-green' | 'light-yellow' | 'light-purple' | 'light-pink' | 'light-orange';
  nortransColor: 'light-gray' | 'yellow' | 'orange' | 'pink';
  nortransBold: boolean;
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'DD-MM-YYYY';
  timeFormat: '24h' | '12h';
  sortBy: 'original' | 'name' | 'cabin' | 'company' | 'role';
  sortDirection: 'asc' | 'desc';
  pageMargin: '0.5' | '0.75' | '1' | '1.25' | '1.5';
  cellPadding: '1' | '2' | '3' | '4' | '5';
  tableSpacing: '5' | '10' | '15' | '20' | '25';
  columnWidths: Record<string, number>;
  rowHeight: number;
  highlightMultipleNames: boolean;
}

export const defaultSettings: Settings = {
  orientation: 'portrait',
  printMode: 'double',
  colorPrint: true,
  theme: 'light',
  fontSize: '10',
  fontFamily: 'Arial',
  textAlign: 'left',
  primaryRowColor: 'white',
  alternateRowColor: 'light-blue',
  nortransColor: 'light-gray',
  nortransBold: true,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  sortBy: 'original',
  sortDirection: 'asc',
  pageMargin: '1',
  cellPadding: '3',
  tableSpacing: '10',
  columnWidths: {
    'Person Names': 200,
    'Roles': 150,
    'Companies': 120,
    'Cabin': 80,
    'Bunk': 60,
    'LB Station': 100
  },
  rowHeight: 35,
  highlightMultipleNames: true
};
