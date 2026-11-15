/**
 * Feature 24: Reusable ExportToCSV utility
 * Reads structured tabular data and triggers a clean, client-side Blob download.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Target file name with .csv extension
 * @returns {string} The formatted CSV text
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('exportToCSV: Provided data is empty or not an array.')
    return ''
  }

  // 1. Extract and sanitize column headers
  const headers = Object.keys(data[0])

  const formatCell = (val) => {
    if (val === null || val === undefined) return '""'
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val)
    // Escape double quotes by doubling them
    str = str.replace(/"/g, '""')
    return `"${str}"`
  }

  // 2. Build rows
  const headerRow = headers.map(formatCell).join(',')
  const bodyRows = data.map((row) => headers.map((key) => formatCell(row[key])).join(','))
  const csvContent = '\uFEFF' + [headerRow, ...bodyRows].join('\r\n')

  // 3. Trigger client-side browser Blob download if running in browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof window.URL?.createObjectURL === 'function') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return csvContent
}

export default exportToCSV
