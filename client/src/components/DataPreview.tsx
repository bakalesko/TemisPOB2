import React, { useState, useRef, useEffect } from 'react';
import { Table, Inbox, GripVertical, GripHorizontal, Edit, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProcessedData, Settings, ExcelRow } from '@/types/excel';
import { sortRows } from '@/lib/sortUtils';

interface DataPreviewProps {
  data: ProcessedData | null;
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onDataChange?: (data: ProcessedData) => void;
}

export function DataPreview({ data, settings, onSettingChange, onDataChange }: DataPreviewProps) {
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [isResizing, setIsResizing] = useState<{ type: 'column' | 'row', index: number | string } | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number, column: string, group: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const initialSize = useRef<number>(0);

  const columns = ['Person Names', 'Roles', 'Companies', 'Cabin', 'Bunk', 'LB Station'];
  
  // Map display column names to actual data field names
  const columnFieldMap = {
    'Person Names': 'Person Names' as keyof ExcelRow,
    'Roles': 'Roles' as keyof ExcelRow, 
    'Companies': 'Companies' as keyof ExcelRow,
    'Cabin': 'Cabin' as keyof ExcelRow,
    'Bunk': 'Bunk' as keyof ExcelRow,
    'LB Station': 'MusterStation General Alarm primary' as keyof ExcelRow
  };

  // Handle starting edit mode
  const handleEditMode = () => {
    setIsEditMode(true);
  };

  // Handle saving edits - will save directly to Supabase Storage
  const handleSaveEdits = () => {
    if (data && onDataChange) {
      onDataChange(data);
      setIsEditMode(false);
      setEditingCell(null);
    }
  };

  // Handle canceling edits
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingCell(null);
    // Reload data from Supabase Storage to discard changes
    window.location.reload();
  };

  // Handle cell value change - directly modify the data object
  const handleCellChange = (group: string, rowIndex: number, column: string, value: string) => {
    if (!data) return;
    
    const fieldName = columnFieldMap[column as keyof typeof columnFieldMap];
    
    if (data.data[group] && data.data[group][rowIndex]) {
      data.data[group][rowIndex] = {
        ...data.data[group][rowIndex],
        [fieldName]: value
      };
    }
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'column' | 'row', index: number | string) => {
    e.preventDefault();
    setIsResizing({ type, index });
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    
    if (type === 'column') {
      initialSize.current = settings.columnWidths[index as string] || 100;
    } else {
      initialSize.current = settings.rowHeight;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    if (isResizing.type === 'column') {
      const deltaX = e.clientX - dragStartX.current;
      const newWidth = Math.max(50, initialSize.current + deltaX);
      
      onSettingChange('columnWidths', {
        ...settings.columnWidths,
        [isResizing.index]: newWidth
      });
    } else {
      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.max(25, initialSize.current + deltaY);
      onSettingChange('rowHeight', newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  // Add event listeners for mouse events
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const updateColumnWidth = (column: string, width: number) => {
    onSettingChange('columnWidths', {
      ...settings.columnWidths,
      [column]: Math.max(50, width)
    });
  };

  const updateRowHeight = (height: number) => {
    onSettingChange('rowHeight', Math.max(25, height));
  };

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Table className="text-primary-500 mr-2" size={20} />
              Data Preview
            </h2>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Inbox className="mx-auto mb-2" size={48} />
            <p>Upload an Excel file to preview data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentGroupData = activeGroup ? sortRows(data.data[activeGroup] || [], settings) : [];
  const firstGroupWithData = data.groups.find(group => data.data[group]?.length > 0) || data.groups[0];
  
  if (activeGroup === '' && firstGroupWithData) {
    setActiveGroup(firstGroupWithData);
  }

  const getRowClassName = (index: number, company: string, personName: string = '') => {
    let className = 'hover:bg-gray-50';
    
    // Check for multiple names (comma detection)
    if (settings.highlightMultipleNames && personName.includes(',')) {
      return className + ' bg-yellow-300 border-yellow-400';
    }
    
    if (company.toLowerCase() === 'nortrans') {
      className += ` highlight-nortrans-${settings.nortransColor}`;
    } else if (index % 2 === 0) {
      className += ` row-color-${settings.primaryRowColor}`;
    } else {
      className += ` row-color-${settings.alternateRowColor}`;
    }
    
    return className;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <Table className="text-primary-500 mr-2" size={18} />
              Data Preview
            </h2>
            {!isEditMode ? (
              <Button 
                onClick={handleEditMode}
                variant="outline" 
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <Edit className="mr-1" size={14} />
                Edit
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleSaveEdits}
                  variant="default" 
                  size="sm"
                  className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-1" size={14} />
                  Save
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  <X className="mr-1" size={14} />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{data.totalRows} total</span>
            <span>{data.occupiedRows} occupied</span>
            <span>{data.groups.length} groups</span>
            {isEditMode && <span className="text-orange-600 font-medium">• Edit Mode</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3 border-b border-gray-200">
          {data.groups.map(group => (
            <Button
              key={group}
              variant={activeGroup === group ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveGroup(group)}
              className={`px-2 py-1 text-xs font-medium rounded-t-lg border-b-2 ${
                activeGroup === group 
                  ? 'border-primary-500 text-primary-600 bg-primary-50' 
                  : 'border-transparent hover:border-primary-500 text-gray-600 hover:text-primary-600'
              }`}
            >
              {group}
              <span className={`ml-1 text-xs px-1 py-0.5 rounded-full ${
                activeGroup === group ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                {data.data[group]?.length || 0}
              </span>
            </Button>
          ))}
        </div>

        {/* Size Controls */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Table Dimensions</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Row Height</label>
              <input
                type="number"
                value={settings.rowHeight}
                onChange={(e) => updateRowHeight(parseInt(e.target.value) || 25)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                min="25"
                max="100"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {columns.slice(0, 3).map(column => (
                <div key={column}>
                  <label className="block text-xs text-gray-600 mb-1">{column.split(' ')[0]}</label>
                  <input
                    type="number"
                    value={settings.columnWidths[column] || 100}
                    onChange={(e) => updateColumnWidth(column, parseInt(e.target.value) || 50)}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                    min="50"
                    max="300"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {columns.slice(3).map(column => (
              <div key={column}>
                <label className="block text-xs text-gray-600 mb-1">{column.split(' ')[0]}</label>
                <input
                  type="number"
                  value={settings.columnWidths[column] || 100}
                  onChange={(e) => updateColumnWidth(column, parseInt(e.target.value) || 50)}
                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                  min="50"
                  max="300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 select-none">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-4"></th>
                {columns.map((column, index) => (
                  <th 
                    key={column}
                    className="relative px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                    style={{ width: `${settings.columnWidths[column] || 100}px` }}
                  >
                    {column}
                    <div
                      className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-300 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, 'column', column)}
                    >
                      <GripVertical className="w-3 h-3 text-gray-400 absolute right-0 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGroupData.map((row, index) => {
                const isNortrans = row.Companies.toLowerCase() === 'nortrans';
                const boldClass = isNortrans && settings.nortransBold ? 'font-bold' : '';
                
                return (
                  <tr 
                    key={index} 
                    className={`${getRowClassName(index, row.Companies, row['Person Names'])} relative`}
                    style={{ height: `${settings.rowHeight}px` }}
                  >
                    <td 
                      className="relative w-4 cursor-row-resize"
                      onMouseDown={(e) => handleMouseDown(e, 'row', index)}
                    >
                      <GripHorizontal className="w-3 h-3 text-gray-400 absolute left-0 top-1/2 transform -translate-y-1/2" />
                    </td>
                    {columns.map((column) => {
                      const cellValue = column === 'LB Station' 
                        ? (row['MusterStation General Alarm primary']?.toString().match(/LB\d+/i)?.[0] || row['MusterStation General Alarm primary'])
                        : row[column as keyof ExcelRow];
                      
                      const isEditingThisCell = editingCell?.rowIndex === index && 
                                               editingCell?.column === column && 
                                               editingCell?.group === activeGroup;
                      
                      return (
                        <td 
                          key={column}
                          className={`px-2 py-1 text-xs text-gray-600 ${boldClass} border-r border-gray-200 ${isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                          style={{ 
                            width: `${settings.columnWidths[column] || 100}px`,
                            height: `${settings.rowHeight}px`,
                            verticalAlign: 'top'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEditMode && !isEditingThisCell) {
                              setEditingCell({ rowIndex: index, column, group: activeGroup });
                              setEditingValue(cellValue?.toString() || '');
                            }
                          }}
                        >
                          {isEditMode && isEditingThisCell ? (
                            <Input
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value);
                                handleCellChange(activeGroup, index, column, e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingCell(null);
                                  setEditingValue('');
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                  setEditingValue('');
                                }
                              }}
                              onBlur={() => {
                                setEditingCell(null);
                                setEditingValue('');
                              }}
                              className="w-full h-full border border-blue-500 p-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                              style={{ minHeight: 'auto' }}
                            />
                          ) : (
                            <span className={isEditMode ? 'block w-full h-full' : ''}>
                              {cellValue}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
