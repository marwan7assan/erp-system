import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadCsv, downloadPdf } from '../utils/reportExport'

const rows = [
  { month: 'Jan', sales: 1000, purchases: 400, expenses: 200, net: 400, growth: '5%' },
  { month: 'Feb', sales: 1200, purchases: 500, expenses: 250, net: 450, growth: '12%' },
]

let created

beforeEach(() => {
  created = { blob: null, link: null }

  // Blob مزيف يحفظ المحتوى عشان نقدر نقراه
  vi.stubGlobal(
    'Blob',
    class {
      constructor(parts, options) {
        this.parts = parts
        this.type = options?.type
      }
    },
  )

  URL.createObjectURL = vi.fn((blob) => {
    created.blob = blob
    return 'blob:fake'
  })
  URL.revokeObjectURL = vi.fn()

  // نمنع الضغط الفعلي على اللينك ونحفظه
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    created.link = this
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const getContent = () => created.blob.parts[0]

describe('downloadCsv', () => {
  it('downloads a file named with the year', () => {
    downloadCsv(rows, 2025)

    expect(created.link.download).toBe('erp-financial-report-2025.csv')
    expect(created.blob.type).toBe('text/csv;charset=utf-8')
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })

  it('starts with a BOM and the headings row', () => {
    downloadCsv(rows, 2025)

    const content = getContent()
    expect(content.startsWith('\uFEFF')).toBe(true)
    expect(content.split('\r\n')[0]).toBe(
      '\uFEFF"Month","Gross Sales","Purchases","Expenses","Net Profit","MoM Growth"',
    )
  })

  it('writes one line per row, in order', () => {
    downloadCsv(rows, 2025)

    const lines = getContent().split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('"Jan","1000","400","200","400","5%"')
    expect(lines[2]).toBe('"Feb","1200","500","250","450","12%"')
  })

  it('escapes double quotes inside values', () => {
    downloadCsv([{ ...rows[0], month: 'Say "hi"' }], 2025)

    expect(getContent()).toContain('"Say ""hi"""')
  })
})

describe('downloadPdf', () => {
  it('downloads a PDF named with the year', () => {
    downloadPdf(rows, 2025)

    expect(created.link.download).toBe('erp-financial-report-2025.pdf')
    expect(created.blob.type).toBe('application/pdf')
  })

  it('has a valid PDF header and footer', () => {
    downloadPdf(rows, 2025)

    const pdf = getContent()
    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf.endsWith('%%EOF')).toBe(true)
  })

  it('contains the title, the year and the month rows', () => {
    downloadPdf(rows, 2025)

    const pdf = getContent()
    expect(pdf).toContain('ERP System - Financial Report')
    expect(pdf).toContain('Fiscal year: 2025')
    expect(pdf).toContain('Jan')
    expect(pdf).toContain('Feb')
  })

  it('escapes parentheses in text', () => {
    downloadPdf([{ ...rows[0], month: 'Q(1)' }], 2025)

    expect(getContent()).toContain('Q\\(1\\)')
  })

  it('startxref points to the real position of the xref table', () => {
    downloadPdf(rows, 2025)

    const pdf = getContent()
    const declared = Number(pdf.match(/startxref\n(\d+)\n%%EOF/)[1])
    const actual = pdf.indexOf('\nxref\n') + 1
    expect(declared).toBe(actual)
  })
})