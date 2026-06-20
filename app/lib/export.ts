import Papa from 'papaparse'

export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportToPDF(data: any[], filename: string, title: string) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  const keys = Object.keys(data[0] || {}).filter(k => !['id', 'userId', 'updatedAt'].includes(k))
  autoTable(doc, {
    head: [keys.map(k => k.charAt(0).toUpperCase() + k.slice(1))],
    body: data.map(row => keys.map(k => String(row[k] ?? ''))),
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 92, 246] },
  })
  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
