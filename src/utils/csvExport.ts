/**
 * CSV Export utilities
 * Provides functionality to export data to CSV format
 */

export interface CsvColumn {
  key: string;
  label: string;
  formatter?: (value: any) => string;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCsv<T>(data: T[], columns: CsvColumn[]): string {
  if (data.length === 0) return '';

  // Create header row
  const headers = columns.map(col => col.label).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key as keyof T];
      const formattedValue = col.formatter ? col.formatter(value) : String(value ?? '');
      // Escape quotes and wrap in quotes if contains comma or quote
      if (formattedValue.includes(',') || formattedValue.includes('"') || formattedValue.includes('\n')) {
        return `"${formattedValue.replace(/"/g, '""')}"`;
      }
      return formattedValue;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCsv<T>(data: T[], columns: CsvColumn[], filename: string): void {
  const csvContent = arrayToCsv(data, columns);
  if (csvContent) {
    downloadCsv(csvContent, filename);
  }
}

/**
 * Generate timestamp for filename
 */
export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}