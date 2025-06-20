import { ExcelRow, Settings } from '@/types/excel';

export function sortRows(rows: ExcelRow[], settings: Settings): ExcelRow[] {
  if (settings.sortBy === 'original') {
    return rows;
  }

  const sortedRows = [...rows].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (settings.sortBy) {
      case 'name':
        aValue = a['Person Names'].toLowerCase();
        bValue = b['Person Names'].toLowerCase();
        break;
      case 'cabin':
        // Sort by cabin number (extract number from cabin string)
        aValue = extractNumber(a['Cabin']);
        bValue = extractNumber(b['Cabin']);
        break;
      case 'company':
        aValue = a['Companies'].toLowerCase();
        bValue = b['Companies'].toLowerCase();
        break;
      case 'role':
        aValue = a['Roles'].toLowerCase();
        bValue = b['Roles'].toLowerCase();
        break;
      default:
        return 0;
    }

    // For cabin numbers, compare numerically
    if (settings.sortBy === 'cabin') {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return settings.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // For text values, compare alphabetically
    if (aValue < bValue) {
      return settings.sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return settings.sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return sortedRows;
}

function extractNumber(text: string): string {
  // Extract numbers from text like "A101", "B23" etc.
  const match = text.match(/\d+/);
  return match ? match[0] : text;
}