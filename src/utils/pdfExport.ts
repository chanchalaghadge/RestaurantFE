/**
 * PDF Export utilities
 * Provides functionality to export data to PDF format
 */

export interface PdfColumn {
  key: string;
  label: string;
  formatter?: (value: any) => string;
}

/**
 * Generate PDF content as text (can be used with browser print)
 */
export function generatePdfContent<T>(data: T[], columns: PdfColumn[], title: string): string {
  if (data.length === 0) return '';

  let content = `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => {
                const value = item[col.key as keyof T];
                const formattedValue = col.formatter ? col.formatter(value) : String(value ?? '');
                return `<td>${formattedValue}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  return content;
}

/**
 * Export data to PDF using browser print functionality
 */
export function exportToPdf<T>(data: T[], columns: PdfColumn[], title: string): void {
  const content = generatePdfContent(data, columns, title);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Generate timestamp for filename
 */
export function generatePdfTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}
