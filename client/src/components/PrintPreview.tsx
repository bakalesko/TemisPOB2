import { ProcessedData, Settings } from '@/types/excel';
import { sortRows } from '@/lib/sortUtils';

interface PrintPreviewProps {
  data: ProcessedData;
  settings: Settings;
}

export function PrintPreview({ data, settings }: PrintPreviewProps) {
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (settings.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      default:
        return `${year}-${month}-${day}`;
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

  const getRowClassName = (index: number, company: string, personName: string = '') => {
    let className = '';
    
    // Check for multiple names (comma detection)
    if (settings.highlightMultipleNames && personName.includes(',')) {
      return 'bg-yellow-300 border-yellow-400';
    }
    
    if (company.toLowerCase() === 'nortrans') {
      className += `highlight-nortrans-${settings.nortransColor}`;
    } else if (index % 2 === 0) {
      className += `row-color-${settings.primaryRowColor}`;
    } else {
      className += `row-color-${settings.alternateRowColor}`;
    }
    
    return className;
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case '6': return 'text-xs';
      case '7': return 'text-xs';
      case '8': return 'text-xs';
      case '9': return 'text-xs';
      case '10': return 'text-sm';
      case '11': return 'text-sm';
      case '12': return 'text-base';
      case '14': return 'text-lg';
      case '16': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const getTextAlignClass = () => {
    switch (settings.textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const now = new Date();
  const dateStr = formatDate(now);
  const timeStr = formatTime(now);

  return (
    <div className="space-y-8">
      {data.groups.map(group => {
        const groupData = data.data[group];
        if (groupData.length === 0) return null;

        const sortedGroupData = sortRows(groupData, settings);
        
        return (
          <div key={group} className="print-page bg-white">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Muster Station {group} Report
              </h1>
              <p className="text-sm text-gray-600">
                Generated: {dateStr} {timeStr}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['Person Names'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      Person Names
                    </th>
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['Roles'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      Roles
                    </th>
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['Companies'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      Companies
                    </th>
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['Cabin'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      Cabin
                    </th>
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['Bunk'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      Bunk
                    </th>
                    <th className={`border border-gray-300 font-bold ${getFontSizeClass()} ${getTextAlignClass()}`} 
                        style={{
                          padding: `${settings.cellPadding}px`,
                          width: `${settings.columnWidths['LB Station'] || 100}px`,
                          height: `${settings.rowHeight}px`
                        }}>
                      LB Station
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGroupData.map((row, index) => {
                    const isNortrans = row.Companies.toLowerCase() === 'nortrans';
                    const boldClass = isNortrans && settings.nortransBold ? 'font-bold' : '';
                    
                    return (
                      <tr key={index} className={getRowClassName(index, row.Companies, row['Person Names'])}>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['Person Names'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {row['Person Names']}
                        </td>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['Roles'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {row['Roles']}
                        </td>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['Companies'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {row['Companies']}
                        </td>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['Cabin'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {row['Cabin']}
                        </td>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['Bunk'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {row['Bunk']}
                        </td>
                        <td className={`border border-gray-300 ${getFontSizeClass()} ${getTextAlignClass()} ${boldClass}`} 
                            style={{
                              padding: `${settings.cellPadding}px`,
                              width: `${settings.columnWidths['LB Station'] || 100}px`,
                              height: `${settings.rowHeight}px`
                            }}>
                          {(() => {
                            const musterStation = row['MusterStation General Alarm primary'];
                            if (!musterStation) return '';
                            // Extract LB number from strings like "LB5 - Deck 3 PS" or just "LB1"
                            const match = musterStation.toString().match(/LB(\d+)/i);
                            return match ? `LB${match[1]}` : musterStation;
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
