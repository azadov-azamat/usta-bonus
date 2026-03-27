import * as XLSX from 'xlsx'

export interface ExcelProduct {
  name: string
  quantity: number
  bonusAmount: number
}

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function importFromExcel(file: File): Promise<ExcelProduct[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<ExcelProduct>(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsBinaryString(file)
  })
}

export function createExcelTemplate() {
  const templateData = [
    { name: 'Product Name', quantity: 100, bonusAmount: 500 },
  ]
  exportToExcel(templateData, 'product-template')
}
