import { useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  fileName: string | null;
}

export function FileUpload({ onFileSelect, isLoading, error, fileName }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="text-primary-500 mr-2" size={20} />
          Upload Excel File
        </h2>
        
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div className="space-y-2">
            <Upload className="mx-auto text-gray-400" size={32} />
            <div>
              <p className="text-base font-medium text-gray-700">
                {isLoading ? 'Processing file...' : 'Drop your Excel file here'}
              </p>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Please wait' : 'or click to browse files'}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Supports .xlsx files only
            </div>
          </div>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileInput}
            disabled={isLoading}
          />
        </div>

        {fileName && !error && (
          <div className="mt-4 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-500 mr-2" size={16} />
            <span className="text-sm text-green-700">{fileName} uploaded successfully</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="text-red-500 mr-2" size={16} />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
