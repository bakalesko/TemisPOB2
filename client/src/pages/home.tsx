import React, { useState, useEffect } from 'react';
import { FileText, Printer, FileDown, Moon, Sun, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { SettingsPanel } from '@/components/SettingsPanel';
import { PrintPreview } from '@/components/PrintPreview';
import { useExcelProcessor } from '@/hooks/useExcelProcessor';
import { useSettings } from '@/hooks/useSettings';
import { generatePDF } from '@/lib/pdfGenerator';
import { exportToExcel } from '@/lib/excelExporter';
import { sortRows } from '@/lib/sortUtils';
import { ProcessedData } from '@/types/excel';

export default function Home() {
  const { data, isLoading, error, fileName, processFile, loadExistingData, saveDataUpdates } = useExcelProcessor();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [theme, setTheme] = useState('light');
  const [showSetTimeDialog, setShowSetTimeDialog] = useState(false);
  const [intervalValue, setIntervalValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load existing data from Supabase Storage on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  // Function to handle data changes from DataPreview - save to Supabase
  const handleDataChange = async (newData: ProcessedData) => {
    try {
      await saveDataUpdates(newData);
    } catch (err) {
      console.error('Failed to save data changes:', err);
    }
  };

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.timeFormat === '12h'
    };
    return date.toLocaleString('en-US', options);
  };

  const handlePrint = () => {
    if (!data) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get color styles based on settings
    const getRowColorStyle = (index: number, company: string) => {
      if (company.toLowerCase() === 'nortrans') {
        const nortransColors = {
          'light-gray': '#f5f5f5',
          'yellow': '#fef3c7',
          'orange': '#fed7aa',
          'pink': '#fce7f3'
        };
        return nortransColors[settings.nortransColor] || '#f5f5f5';
      } else if (index % 2 === 0) {
        const primaryColors = {
          'white': 'white',
          'light-gray': '#f5f5f5',
          'light-blue': '#eff6ff',
          'light-green': '#f0fdf4',
          'light-yellow': '#fefce8',
          'light-purple': '#f3e8ff',
          'light-pink': '#fdf2f8',
          'light-orange': '#fff7ed'
        };
        return primaryColors[settings.primaryRowColor] || 'white';
      } else {
        const alternateColors = {
          'white': 'white',
          'light-gray': '#f5f5f5',
          'light-blue': '#eff6ff',
          'light-green': '#f0fdf4',
          'light-yellow': '#fefce8',
          'light-purple': '#f3e8ff',
          'light-pink': '#fdf2f8',
          'light-orange': '#fff7ed'
        };
        return alternateColors[settings.alternateRowColor] || 'white';
      }
    };

    // Generate column width styles based on settings
    const getColumnWidthStyles = () => {
      const widths = settings.columnWidths;
      return `
        th:nth-child(1), td:nth-child(1) { width: ${widths['Person Names'] || 120}px; }
        th:nth-child(2), td:nth-child(2) { width: ${widths['Roles'] || 120}px; }
        th:nth-child(3), td:nth-child(3) { width: ${widths['Companies'] || 120}px; }
        th:nth-child(4), td:nth-child(4) { width: ${widths['Cabin'] || 80}px; }
        th:nth-child(5), td:nth-child(5) { width: ${widths['Bunk'] || 80}px; }
        th:nth-child(6), td:nth-child(6) { width: ${widths['MusterStation General Alarm primary'] || 120}px; }
      `;
    };

    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Muster Station Reports</title>
          <style>
            @page { margin: ${settings.pageMargin}in; size: A4 ${settings.orientation}; }
            body { font-family: ${settings.fontFamily}, sans-serif; margin: 0; font-size: ${settings.fontSize}px; }
            .print-page { page-break-after: always; min-height: 100vh; }
            .print-page:last-child { page-break-after: auto; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: ${settings.tableSpacing}px; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: ${settings.cellPadding}px; 
              text-align: ${settings.textAlign}; 
              vertical-align: top;
              word-wrap: break-word;
              height: ${settings.rowHeight}px;
            }
            th { background-color: #f0f0f0; font-weight: bold; }
            ${getColumnWidthStyles()}
          </style>
        </head>
        <body>
          ${data.groups.map((group: string) => {
            const groupData = data.data[group];
            if (groupData.length === 0) return '';
            
            const sortedData = sortRows(groupData, settings);
            
            return `
              <div class="print-page">
                <h1 style="font-size: 24px; margin-bottom: 10px;">Muster Station ${group} Report</h1>
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Generated: ${formatDateTime(currentDateTime)}</p>
                <table>
                  <thead>
                    <tr>
                      <th style="width: ${settings.columnWidths['Person Names'] || 200}px;">Person Names</th>
                      <th style="width: ${settings.columnWidths['Roles'] || 150}px;">Roles</th>
                      <th style="width: ${settings.columnWidths['Companies'] || 120}px;">Companies</th>
                      <th style="width: ${settings.columnWidths['Cabin'] || 80}px;">Cabin</th>
                      <th style="width: ${settings.columnWidths['Bunk'] || 60}px;">Bunk</th>
                      <th style="width: ${settings.columnWidths['LB Station'] || 100}px;">LB Station</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedData.map((row, index) => {
                      const isNortrans = row.Companies.toLowerCase() === 'nortrans';
                      const backgroundColor = getRowColorStyle(index, row.Companies);
                      const fontWeight = isNortrans && settings.nortransBold ? 'bold' : 'normal';
                      
                      return `
                        <tr style="background-color: ${backgroundColor}; height: ${settings.rowHeight}px;">
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['Person Names'] || 200}px;">${row['Person Names']}</td>
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['Roles'] || 150}px;">${row['Roles']}</td>
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['Companies'] || 120}px;">${row['Companies']}</td>
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['Cabin'] || 80}px;">${row['Cabin']}</td>
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['Bunk'] || 60}px;">${row['Bunk']}</td>
                          <td style="font-weight: ${fontWeight}; width: ${settings.columnWidths['LB Station'] || 100}px;">${row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary']}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleSavePDF = () => {
    if (!data) return;
    generatePDF(data, settings);
  };

  const handleSaveExcel = () => {
    if (!data) return;
    exportToExcel(data, settings);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAutoRun = async () => {
    try {
      const response = await fetch('https://bmjqxougjdwaulfmsrhs.supabase.co/storage/v1/object/deck-files/update_trigger.txt', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk',
          'Content-Type': 'text/plain',
          'x-upsert': 'true'
        },
        body: 'RUN'
      });

      console.log('AutoRun response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const result = await response.json();
        console.log('AutoRun successful - File updated:', result);
        toast({
          title: "AutoRun Success",
          description: "Trigger file updated successfully",
          duration: 5000,
        });
      } else {
        console.error('AutoRun failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('AutoRun error:', error);
    }
  };

  const handleSetTime = async () => {
    const value = parseInt(intervalValue);
    if (isNaN(value) || value < 1 || value > 60) {
      alert('Please enter a valid number between 1 and 60');
      return;
    }

    try {
      const response = await fetch(`https://bmjqxougjdwaulfmsrhs.supabase.co/storage/v1/object/deck-files/update_interval.txt?timestamp=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanF4b3VnamR3YXVsZm1zcmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI5MzgxMSwiZXhwIjoyMDY0ODY5ODExfQ.dSk9M0zQy9LCXLjagrpPyzf09l2-VdX-A22m_fS3lpk',
          'Content-Type': 'text/plain',
          'x-upsert': 'true'
        },
        body: `interval=${value}`
      });

      if (response.ok) {
        console.log('SetTime successful - Interval updated:', value);
        toast({
          title: "SetTime Success",
          description: `Interval updated to ${value} successfully`,
          duration: 5000,
        });
        setShowSetTimeDialog(false);
        setIntervalValue('');
      } else {
        console.error('SetTime failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('SetTime error:', error);
    }
  };

  const handleIntervalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 60)) {
      setIntervalValue(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="text-primary-500 mr-3" size={24} />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Muster Station Report Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(currentDateTime)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* AutoRun and SetTime Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleAutoRun}
            style={{ backgroundColor: '#28a745' }}
            className="text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            AutoRun
          </Button>
          <Button
            onClick={() => setShowSetTimeDialog(true)}
            style={{ backgroundColor: '#007bff' }}
            className="text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            SetTime
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload Section */}
            <FileUpload
              onFileSelect={processFile}
              isLoading={isLoading}
              error={error}
              fileName={fileName}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Printer className="text-primary-500 mr-2" size={20} />
                  Export & Print
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <Button
                    onClick={handlePrint}
                    disabled={!data}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Printer className="mr-2" size={16} />
                    Print Reports
                  </Button>
                  <Button
                    onClick={handleSavePDF}
                    disabled={!data}
                    className="bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <FileDown className="mr-2" size={16} />
                    Save as PDF
                  </Button>
                  <Button
                    onClick={handleSaveExcel}
                    disabled={!data}
                    className="bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="mr-2" size={16} />
                    Save as XLSX
                  </Button>
                  <Button
                    onClick={() => window.location.href = 'https://temispob2.vercel.app/'}
                    disabled={!data}
                    className="bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <FileText className="mr-2" size={16} />
                    Deck Preview
                  </Button>
                  <Button
                    onClick={loadExistingData}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <RefreshCw className="mr-2" size={16} />
                    Refresh
                  </Button>
                </div>
                
                {data && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="w-full mt-3"
                  >
                    Preview Print Layout
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Data Preview Section */}
            <DataPreview data={data} settings={settings} onSettingChange={updateSetting} onDataChange={handleDataChange} />
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <SettingsPanel
              settings={settings}
              onSettingChange={updateSetting}
              onReset={resetSettings}
            />
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Print Preview</DialogTitle>
          </DialogHeader>
          {data && <PrintPreview data={data} settings={settings} />}
        </DialogContent>
      </Dialog>

      {/* SetTime Modal */}
      <Dialog open={showSetTimeDialog} onOpenChange={setShowSetTimeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Interval Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter interval (1-60):
              </label>
              <Input
                type="text"
                value={intervalValue}
                onChange={handleIntervalInputChange}
                placeholder="Enter a number between 1 and 60"
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSetTimeDialog(false);
                  setIntervalValue('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetTime}
                disabled={!intervalValue || parseInt(intervalValue) < 1 || parseInt(intervalValue) > 60}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Set
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
}
