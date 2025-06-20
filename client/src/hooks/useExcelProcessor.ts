import { useState } from 'react';
import { ProcessedData } from '@/types/excel';
import { parseExcelFile, validateExcelFile } from '@/lib/excelUtils';

// Generate Excel file and save to Supabase Storage
const saveDataToSupabase = async (data: ProcessedData) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const ExcelJS = await import('exceljs');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmjqxougjdwaulfmsrhs.supabase.co';
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk';
    
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Service key available:', !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    
    // Create ALL sheet first
    const allWorksheet = workbook.addWorksheet('ALL');
    const allData: any[] = [];
    
    // Collect all data from all groups
    data.groups.forEach(group => {
      const groupData = data.data[group] || [];
      allData.push(...groupData);
    });
    
    // Add headers
    allWorksheet.addRow(['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station']);
    
    // Add data rows
    allData.forEach(row => {
      const lbStation = row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary'];
      allWorksheet.addRow([
        row['Person Names'],
        row['Roles'], 
        row['Companies'],
        row['Cabin'],
        row['Bunk'],
        lbStation
      ]);
    });
    
    // Create individual group sheets
    data.groups.forEach(group => {
      const groupData = data.data[group];
      if (groupData.length === 0) return;
      
      const worksheet = workbook.addWorksheet(`${group} Report`);
      worksheet.addRow(['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station']);
      
      groupData.forEach(row => {
        const lbStation = row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary'];
        worksheet.addRow([
          row['Person Names'],
          row['Roles'],
          row['Companies'], 
          row['Cabin'],
          row['Bunk'],
          lbStation
        ]);
      });
    });
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    console.log('Attempting to upload Excel file to Supabase Storage...');
    console.log('Buffer size:', buffer.byteLength, 'bytes');
    console.log('Supabase URL:', supabaseUrl);
    
    // Upload to deck-files bucket (primary)
    console.log('Uploading to deck-files bucket...');
    const { data: data1, error: error1 } = await supabase.storage
      .from('deck-files')
      .upload('muster-station-reports.xlsx', buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    console.log('deck-files upload result:', { 
      success: !error1, 
      data: data1, 
      error: error1?.message || null 
    });

    // Upload to occupancy-files bucket (backup)
    console.log('Uploading to occupancy-files bucket...');
    const { data: data2, error: error2 } = await supabase.storage
      .from('occupancy-files')
      .upload('muster-station-reports.xlsx', buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    console.log('occupancy-files upload result:', { 
      success: !error2, 
      data: data2, 
      error: error2?.message || null 
    });

    if (error1 || error2) {
      console.error('Supabase upload error detected:', { 
        deckFilesError: error1, 
        occupancyFilesError: error2 
      });
      
      if (error1 && error2) {
        throw new Error(`Both uploads failed: deck-files: ${error1.message}, occupancy-files: ${error2.message}`);
      } else if (error1) {
        console.warn('deck-files upload failed, but continuing with occupancy-files success');
      } else if (error2) {
        console.warn('occupancy-files upload failed, but continuing with deck-files success');
      }
    }
    
    // Verify both uploads were successful for complete backup
    if (!error1 && !error2) {
      console.log('✓ Excel file successfully saved to BOTH Supabase Storage buckets');
    } else {
      console.log('⚠ Excel file saved to only one bucket - check logs above');
    }
    
    console.log('Excel file successfully saved to Supabase Storage');
  } catch (error) {
    console.error('Save to Supabase failed:', error);
    throw error;
  }
};

const loadDataFromSupabase = async (): Promise<ProcessedData | null> => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const ExcelJS = await import('exceljs');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmjqxougjdwaulfmsrhs.supabase.co';
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to download Excel file from deck-files bucket with cache buster
    const { data, error } = await supabase.storage
      .from('deck-files')
      .download(`muster-station-reports.xlsx?timestamp=${Date.now()}`);

    if (error) {
      return null;
    }

    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await data.arrayBuffer());
    
    // Get ALL sheet to reconstruct the data - try multiple possible names
    let allSheet = workbook.getWorksheet('ALL') || 
                   workbook.getWorksheet('All') || 
                   workbook.getWorksheet('all') ||
                   workbook.worksheets[0]; // fallback to first sheet
    
    if (!allSheet) {
      return null;
    }
    
    const rows: any[] = [];
    allSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const rowData = {
        'Person Names': row.getCell(1).value?.toString() || '',
        'Roles': row.getCell(2).value?.toString() || '',
        'Companies': row.getCell(3).value?.toString() || '',
        'Cabin': row.getCell(4).value?.toString() || '',
        'Bunk': row.getCell(5).value?.toString() || '',
        'MusterStation General Alarm primary': row.getCell(6).value?.toString() || '',
        'Status': 'Occupied' // All data in storage is occupied
      };
      rows.push(rowData);
    });
    
    // Group data by LB stations
    const groupedData: Record<string, any[]> = {};
    const groups: string[] = [];
    
    rows.forEach(row => {
      const lbStation = row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0];
      if (lbStation) {
        if (!groupedData[lbStation]) {
          groupedData[lbStation] = [];
          groups.push(lbStation);
        }
        groupedData[lbStation].push(row);
      }
    });
    
    const processedData: ProcessedData = {
      groups: groups.sort(),
      totalRows: rows.length,
      occupiedRows: rows.length,
      data: groupedData
    };
    
    console.log('Excel file successfully loaded from Supabase Storage');
    return processedData;
  } catch (error) {
    console.error('Load from Supabase failed:', error);
    return null;
  }
};

export function useExcelProcessor() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Load data from Supabase on hook initialization
  const loadExistingData = async () => {
    try {
      const existingData = await loadDataFromSupabase();
      if (existingData) {
        setData(existingData);
        setFileName('muster-station-reports.xlsx');
      }
    } catch (err) {
      console.log('No existing data to load');
    }
  };

  // Save updated data to Supabase
  const saveDataUpdates = async (updatedData: ProcessedData) => {
    try {
      await saveDataToSupabase(updatedData);
      setData(updatedData);
    } catch (err) {
      console.error('Failed to save data updates:', err);
      throw err;
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    const validationError = validateExcelFile(file);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }
    
    try {
      const processedData = await parseExcelFile(file);
      
      // Upload processed data to Supabase Storage immediately
      await saveDataToSupabase(processedData);
      
      setData(processedData);
      setFileName(file.name);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData(null);
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setFileName(null);
    setError(null);
  };

  return {
    data,
    isLoading,
    error,
    fileName,
    processFile,
    clearData,
    loadExistingData,
    saveDataUpdates
  };
}
