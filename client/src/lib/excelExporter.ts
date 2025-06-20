import ExcelJS from 'exceljs';
import { ProcessedData, Settings } from '@/types/excel';
import { sortRows } from '@/lib/sortUtils';

function createWorksheetWithData(worksheet: any, data: ProcessedData, settings: Settings, isAllSheet: boolean): void {
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (settings.dateFormat) {
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
      default: return `${year}-${month}-${day}`;
    }
  };

  const formatTime = (date: Date): string => {
    if (settings.timeFormat === '12h') {
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
  };

  const now = new Date();
  const dateStr = formatDate(now);
  const timeStr = formatTime(now);

  // Set exact column widths from settings
  const pixelToCharWidth = 7.5;
  const columnWidths = [
    settings.columnWidths['Person Names'] / pixelToCharWidth,
    settings.columnWidths['Roles'] / pixelToCharWidth,
    settings.columnWidths['Companies'] / pixelToCharWidth,
    settings.columnWidths['Cabin'] / pixelToCharWidth,
    settings.columnWidths['Bunk'] / pixelToCharWidth,
    settings.columnWidths['LB Station'] / pixelToCharWidth
  ];

  worksheet.columns = columnWidths.map(width => ({ width }));

  if (isAllSheet) {
    // For ALL sheet - start directly with groups (no main header)
    const headers = ['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station'];

    // Add all groups with titles and page breaks
    data.groups.forEach((group, groupIndex) => {
      const groupData = data.data[group];
      if (groupData.length === 0) return;

      const titleRow = worksheet.addRow([`Muster Station ${group} Report`]);
      
      // Add page break before this title row (except for the first group)
      if (groupIndex > 0) {
        worksheet.pageBreaks = worksheet.pageBreaks || [];
        worksheet.pageBreaks.push(titleRow.number - 1);
      }
      const dateRow = worksheet.addRow([`Generated: ${dateStr} ${timeStr}`]);
      
      // Style group title
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { horizontal: 'left' };
      dateRow.font = { size: 11 };
      dateRow.alignment = { horizontal: 'left' };

      // Add group header
      const groupHeaderRow = worksheet.addRow(headers);
      groupHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      groupHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };
      groupHeaderRow.alignment = { 
        horizontal: settings.textAlign, 
        vertical: 'middle' 
      };

      // Add borders to group header
      groupHeaderRow.eachCell({ includeEmpty: true }, (cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Sort and add data
      const sortedData = sortRows(groupData, settings);
      addDataRows(worksheet, sortedData, settings);
    });

    // Set print area for ALL sheet
    const lastColumn = 'F'; // LB Station column
    const lastRow = worksheet.rowCount;
    worksheet.pageSetup.printArea = `A1:${lastColumn}${lastRow}`;

  } else {
    // For individual LB sheets
    const groupName = data.groups[0];
    const titleRow = worksheet.addRow([`Muster Station ${groupName} Report`]);
    const dateRow = worksheet.addRow([`Generated: ${dateStr} ${timeStr}`]);
    
    // Style title and date
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'left' };
    dateRow.font = { size: 12 };
    dateRow.alignment = { horizontal: 'left' };
    
    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const headers = ['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station'];
    worksheet.addRow(headers);

    // Style header row (row 4)
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    headerRow.alignment = { 
      horizontal: settings.textAlign, 
      vertical: 'middle' 
    };

    // Add borders to header
    headerRow.eachCell({ includeEmpty: true }, (cell: any) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data
    const group = data.groups[0];
    const groupData = data.data[group];
    const sortedData = sortRows(groupData, settings);
    addDataRows(worksheet, sortedData, settings);

    // Set print area for individual sheet
    const lastColumn = 'F'; // LB Station column
    const lastRow = 4 + sortedData.length; // Header row + data rows
    worksheet.pageSetup.printArea = `A1:${lastColumn}${lastRow}`;
  }

  // Set print settings
  worksheet.pageSetup.orientation = 'portrait';
  worksheet.pageSetup.paperSize = 9; // A4
  worksheet.pageSetup.fitToPage = true;
  worksheet.pageSetup.fitToWidth = 1;
  worksheet.pageSetup.fitToHeight = 0;
  worksheet.pageSetup.blackAndWhite = false; // Color printing
  worksheet.pageSetup.draft = false; // High quality
  worksheet.pageSetup.cellComments = 'None';
  worksheet.pageSetup.errors = 'displayed';
  
  // Set duplex printing (double-sided)
  worksheet.pageSetup.horizontalDpi = 600;
  worksheet.pageSetup.verticalDpi = 600;

  // Force column widths again to prevent auto-resize
  worksheet.columns = columnWidths.map(width => ({ width }));
}

function addDataRows(worksheet: any, sortedData: any[], settings: Settings): void {
  sortedData.forEach((row, index) => {
    const lbStation = row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary'];
    
    const dataRow = worksheet.addRow([
      row['Person Names'],
      row['Roles'],
      row['Companies'],
      row['Cabin'],
      row['Bunk'],
      lbStation
    ]);

    // Set row height
    dataRow.height = settings.rowHeight * 0.75;

    // Apply styling based on settings
    const isNortrans = row.Companies.toLowerCase() === 'nortrans';
    const hasMultipleNames = settings.highlightMultipleNames && row['Person Names'].includes(',');
    let fillColor = 'FFFFFFFF'; // white
    let fontBold = false;

    if (hasMultipleNames) {
      // Bright yellow for multiple names detection
      fillColor = 'FFFFFF00';
    } else if (isNortrans) {
      switch (settings.nortransColor) {
        case 'yellow': fillColor = 'FFFFFF3B'; break;
        case 'orange': fillColor = 'FFFF9800'; break;
        case 'pink': fillColor = 'FFE91E63'; break;
        default: fillColor = 'FFBDBDBD'; break;
      }
      if (settings.nortransBold) {
        fontBold = true;
      }
    } else {
      const colorKey = index % 2 === 0 ? settings.primaryRowColor : settings.alternateRowColor;
      switch (colorKey) {
        case 'light-gray': fillColor = 'FFF5F5F5'; break;
        case 'light-blue': fillColor = 'FFE3F2FD'; break;
        case 'light-green': fillColor = 'FFE8F5E8'; break;
        case 'light-yellow': fillColor = 'FFFFF9C4'; break;
        case 'light-purple': fillColor = 'FFF3E5F5'; break;
        case 'light-pink': fillColor = 'FFFCE4EC'; break;
        case 'light-orange': fillColor = 'FFFFF3E0'; break;
        default: fillColor = 'FFFFFFFF'; break;
      }
    }

    // Apply styling to all cells in the row
    dataRow.eachCell({ includeEmpty: true }, (cell: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillColor }
      };
      cell.font = fontBold ? { bold: true } : {};
      cell.alignment = { 
        horizontal: settings.textAlign, 
        vertical: 'top' 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
}

export function exportToExcel(data: ProcessedData, settings: Settings): void {
  // Create a new workbook with ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Muster Station App';
  workbook.lastModifiedBy = 'Muster Station App';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create ALL sheet first with all data combined
  const allWorksheet = workbook.addWorksheet('ALL');
  createWorksheetWithData(allWorksheet, data, settings, true);

  // Process each group
  data.groups.forEach(group => {
    const groupData = data.data[group];
    if (groupData.length === 0) return;

    // Create worksheet for individual group
    const worksheet = workbook.addWorksheet(`${group} Report`);
    createWorksheetWithData(worksheet, { ...data, groups: [group], data: { [group]: groupData } }, settings, false);
  });

  // Generate current date for filename
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  // Write and download the file
  workbook.xlsx.writeBuffer().then(async (buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download file locally
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `muster-station-reports-${dateStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    // Upload to Supabase Storage directly from frontend
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmjqxougjdwaulfmsrhs.supabase.co';
      const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY5NDI3NCwiZXhwIjoyMDQ5MjcwMjc0fQ.sppvPdboaH9vTAhPdFU7vJpJJcv3RmDSYVRa7pJnXMo';
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Upload to occupancy-files bucket
      const { error: error1 } = await supabase.storage
        .from('occupancy-files')
        .upload('muster-station-reports.xlsx', buffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: true
        });

      // Upload to deck-files bucket  
      const { error: error2 } = await supabase.storage
        .from('deck-files')
        .upload('muster-station-reports.xlsx', buffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: true
        });

      if (error1 || error2) {
        console.error('Supabase upload errors:', { error1, error2 });
      } else {
        console.log('File successfully uploaded to both Supabase Storage buckets');
      }
    } catch (uploadError) {
      console.error('Supabase upload failed:', uploadError);
    }
  });
}