import { Cog, FileText, Palette, Clock, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings } from '@/types/excel';

interface SettingsPanelProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
}

export function SettingsPanel({ settings, onSettingChange, onReset }: SettingsPanelProps) {
  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Cog className="text-primary-500 mr-2" size={20} />
            Settings
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-primary-500 underline"
          >
            Reset to Default
          </Button>
        </div>

        <div className="space-y-6">
          {/* Page Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FileText className="text-gray-400 mr-2" size={14} />
              Page Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Orientation</label>
                <Select
                  value={settings.orientation}
                  onValueChange={(value: 'portrait' | 'landscape') => onSettingChange('orientation', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Print Mode</label>
                <Select
                  value={settings.printMode}
                  onValueChange={(value: 'double' | 'single') => onSettingChange('printMode', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="double">Double-sided</SelectItem>
                    <SelectItem value="single">Single-sided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="colorPrint"
                  checked={settings.colorPrint}
                  onCheckedChange={(checked) => onSettingChange('colorPrint', checked as boolean)}
                />
                <label htmlFor="colorPrint" className="text-xs text-gray-600">
                  Color Printing
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Page Margin</label>
                <Select
                  value={settings.pageMargin}
                  onValueChange={(value: any) => onSettingChange('pageMargin', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">1.3 cm</SelectItem>
                    <SelectItem value="0.75">1.9 cm</SelectItem>
                    <SelectItem value="1">2.5 cm</SelectItem>
                    <SelectItem value="1.25">3.2 cm</SelectItem>
                    <SelectItem value="1.5">3.8 cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Cell Padding</label>
                <Select
                  value={settings.cellPadding}
                  onValueChange={(value: any) => onSettingChange('cellPadding', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1px</SelectItem>
                    <SelectItem value="2">2px</SelectItem>
                    <SelectItem value="3">3px</SelectItem>
                    <SelectItem value="4">4px</SelectItem>
                    <SelectItem value="5">5px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Table Spacing</label>
                <Select
                  value={settings.tableSpacing}
                  onValueChange={(value: any) => onSettingChange('tableSpacing', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5px</SelectItem>
                    <SelectItem value="10">10px</SelectItem>
                    <SelectItem value="15">15px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="25">25px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Palette className="text-gray-400 mr-2" size={14} />
              Appearance
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Theme</label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: 'light' | 'dark' | 'sepia') => onSettingChange('theme', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: any) => onSettingChange('fontFamily', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: any) => onSettingChange('fontSize', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6pt</SelectItem>
                    <SelectItem value="7">7pt</SelectItem>
                    <SelectItem value="8">8pt</SelectItem>
                    <SelectItem value="9">9pt</SelectItem>
                    <SelectItem value="10">10pt</SelectItem>
                    <SelectItem value="11">11pt</SelectItem>
                    <SelectItem value="12">12pt</SelectItem>
                    <SelectItem value="14">14pt</SelectItem>
                    <SelectItem value="16">16pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Alignment</label>
                <Select
                  value={settings.textAlign}
                  onValueChange={(value: 'left' | 'center' | 'right') => onSettingChange('textAlign', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Palette className="text-gray-400 mr-2" size={14} />
              Row Colors
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Primary Row Color</label>
                <Select
                  value={settings.primaryRowColor}
                  onValueChange={(value: any) => onSettingChange('primaryRowColor', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="light-gray">Light Gray</SelectItem>
                    <SelectItem value="light-blue">Light Blue</SelectItem>
                    <SelectItem value="light-green">Light Green</SelectItem>
                    <SelectItem value="light-yellow">Light Yellow</SelectItem>
                    <SelectItem value="light-purple">Light Purple</SelectItem>
                    <SelectItem value="light-pink">Light Pink</SelectItem>
                    <SelectItem value="light-orange">Light Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Alternate Row Color</label>
                <Select
                  value={settings.alternateRowColor}
                  onValueChange={(value: any) => onSettingChange('alternateRowColor', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="light-gray">Light Gray</SelectItem>
                    <SelectItem value="light-blue">Light Blue</SelectItem>
                    <SelectItem value="light-green">Light Green</SelectItem>
                    <SelectItem value="light-yellow">Light Yellow</SelectItem>
                    <SelectItem value="light-purple">Light Purple</SelectItem>
                    <SelectItem value="light-pink">Light Pink</SelectItem>
                    <SelectItem value="light-orange">Light Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nortrans Highlight</label>
                <Select
                  value={settings.nortransColor}
                  onValueChange={(value: any) => onSettingChange('nortransColor', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light-gray">Light Gray</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nortransBold"
                  checked={settings.nortransBold}
                  onCheckedChange={(checked) => onSettingChange('nortransBold', checked as boolean)}
                />
                <label htmlFor="nortransBold" className="text-xs text-gray-600">
                  Bold Nortrans Rows
                </label>
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ArrowUpDown className="text-gray-400 mr-2" size={14} />
              Row Sorting
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sort By</label>
                <Select
                  value={settings.sortBy}
                  onValueChange={(value: any) => onSettingChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original Order</SelectItem>
                    <SelectItem value="name">Person Names (A-Z)</SelectItem>
                    <SelectItem value="cabin">Cabin Number</SelectItem>
                    <SelectItem value="company">Company Name</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sort Direction</label>
                <Select
                  value={settings.sortDirection}
                  onValueChange={(value: any) => onSettingChange('sortDirection', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending (A-Z, 1-9)</SelectItem>
                    <SelectItem value="desc">Descending (Z-A, 9-1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Special Highlighting */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <AlertTriangle className="text-gray-400 mr-2" size={14} />
              Special Highlighting
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">Highlight Multiple Names</label>
                <Switch
                  checked={settings.highlightMultipleNames}
                  onCheckedChange={(value) => onSettingChange('highlightMultipleNames', value)}
                />
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Highlights rows in bright yellow when multiple people are detected (names contain comma)
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="text-gray-400 mr-2" size={14} />
              Date & Time
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date Format</label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value: any) => onSettingChange('dateFormat', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time Format</label>
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value: any) => onSettingChange('timeFormat', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hour</SelectItem>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
