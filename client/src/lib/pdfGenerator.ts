import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProcessedData, Settings } from '@/types/excel';
import { sortRows } from './sortUtils';

export function generatePDF(data: ProcessedData, settings: Settings): void {
  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = settings.orientation === 'portrait' ? 210 : 297;
  const pageHeight = settings.orientation === 'portrait' ? 297 : 210;
  const margin = parseFloat(settings.pageMargin) * 25.4; // Convert inches to mm

  let isFirstPage = true;

  data.groups.forEach(group => {
    const groupData = data.data[group];
    if (groupData.length === 0) return;

    // Sort the data according to settings
    const sortedGroupData = sortRows(groupData, settings);

    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;

    // Header
    const now = new Date();
    const dateStr = formatDate(now, settings.dateFormat);
    const timeStr = formatTime(now, settings.timeFormat);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Muster Station ${group} Report`, margin, margin + 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${dateStr} ${timeStr}`, margin, margin + 20);

    // Table
    const tableData = sortedGroupData.map(row => [
      row['Person Names'],
      row['Roles'],
      row['Companies'],
      row['Cabin'],
      row['Bunk'],
      row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary']
    ]);

    const fontSize = getFontSize(settings.fontSize);
    
    // Calculate column widths based on settings
    const columns = ['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station'];
    const totalAvailableWidth = pageWidth - (2 * margin);
    const totalColumnWidth = columns.reduce((sum, col) => sum + (settings.columnWidths[col] || 100), 0);
    const scale = totalAvailableWidth / (totalColumnWidth * 0.264583); // Convert pixels to mm (rough conversion)
    
    const columnStyles: Record<number, any> = {};
    columns.forEach((col, index) => {
      const widthInPx = settings.columnWidths[col] || 100;
      const widthInMm = widthInPx * 0.264583 * scale; // Convert px to mm with scaling
      columnStyles[index] = { cellWidth: widthInMm };
    });
    
    autoTable(pdf, {
      head: [['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station']],
      body: tableData,
      startY: margin + parseInt(settings.tableSpacing) + 20,
      margin: { left: margin, right: margin },
      columnStyles: columnStyles,
      styles: {
        fontSize: fontSize,
        textColor: settings.colorPrint ? [0, 0, 0] : [0, 0, 0],
        cellPadding: parseInt(settings.cellPadding),
        font: settings.fontFamily.toLowerCase(),
        minCellHeight: settings.rowHeight * 0.264583 // Convert px to mm
      },
      headStyles: {
        fillColor: settings.colorPrint ? [25, 118, 210] : [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: settings.colorPrint ? getRowColor(settings.alternateRowColor) : [245, 245, 245]
      },
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const rowData = sortedGroupData[data.row.index];
          const hasMultipleNames = settings.highlightMultipleNames && rowData['Person Names'].includes(',');
          
          if (hasMultipleNames) {
            // Bright yellow for multiple names detection
            data.cell.styles.fillColor = settings.colorPrint ? [255, 255, 0] : [240, 240, 240];
          } else if (rowData['Companies'].toLowerCase() === 'nortrans') {
            data.cell.styles.fillColor = settings.colorPrint ? 
              getNortransColor(settings.nortransColor) : 
              [220, 220, 220];
            if (settings.nortransBold) {
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });
  });

  pdf.save(`muster-station-reports-${new Date().toISOString().split('T')[0]}.pdf`);
}

function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default: // YYYY-MM-DD
      return `${year}-${month}-${day}`;
  }
}

function formatTime(date: Date, format: string): string {
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

function getFontSize(size: string): number {
  const fontSize = parseInt(size);
  return isNaN(fontSize) ? 10 : fontSize;
}

function getRowColor(color: string): [number, number, number] {
  switch (color) {
    case 'light-gray': return [245, 245, 245];
    case 'light-blue': return [239, 246, 255];
    case 'light-green': return [240, 253, 244];
    case 'light-yellow': return [254, 252, 232];
    case 'light-purple': return [243, 232, 255];
    case 'light-pink': return [253, 242, 248];
    case 'light-orange': return [255, 247, 237];
    default: return [255, 255, 255];
  }
}

function getNortransColor(color: string): [number, number, number] {
  switch (color) {
    case 'yellow': return [254, 249, 195];
    case 'orange': return [254, 235, 200];
    case 'pink': return [252, 231, 243];
    default: return [245, 245, 245];
  }
}
