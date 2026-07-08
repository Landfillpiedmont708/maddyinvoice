import { format } from 'date-fns-jalali'
import type { InvoiceData, LineItem } from '../types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function generateInvoiceNumber(prefix: string, count: number): string {
  const jYear = format(new Date(), 'yyyy')
  return `${prefix}-${jYear}-${String(count).padStart(3, '0')}`
}

export function calcItemTotal(item: LineItem): number {
  return item.quantity * item.unitPrice - item.discount
}

export function calcSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + calcItemTotal(item), 0)
}

export function calcGlobalDiscount(
  subtotal: number,
  discount: { type: 'percent' | 'fixed'; value: number }
): number {
  if (discount.type === 'percent') return (subtotal * discount.value) / 100
  return discount.value
}

export function calcGrandTotal(
  items: LineItem[],
  globalDiscount: { type: 'percent' | 'fixed'; value: number },
  vatRate: number,
  shippingCost: number
): number {
  const subtotal = calcSubtotal(items)
  const discount = calcGlobalDiscount(subtotal, globalDiscount)
  const afterDiscount = subtotal - discount
  const vat = (afterDiscount * vatRate) / 100
  return afterDiscount + vat + shippingCost
}

export function defaultInvoiceData(): InvoiceData {
  return {
    id: generateId(),
    templateId: 'blossom',
    documentType: 'official',
    status: 'pending',
    invoiceNumber: '',
    invoicePrefix: 'MDY',
    currency: 'toman',
    issueDate: format(new Date(), 'yyyy/MM/dd'),
    dueDate: '',
    seller: {
      name: '',
      logo: '',
      phone: '',
      email: '',
      address: '',
      nationalCode: '',
      economicCode: '',
      socialLinks: [],
    },
    buyer: {
      id: '',
      name: '',
      company: '',
      phone: '',
      address: '',
      nationalCode: '',
    },
    items: [{ id: generateId(), description: '', quantity: 1, unit: 'عدد', unitPrice: 0, discount: 0, tax: 0 }],
    globalDiscount: { type: 'percent', value: 0 },
    vatRate: 10,
    shippingCost: 0,
    notes: '',
    paymentTerms: '',
    thankYouMessage: 'با تشکر از خرید شما',
    payment: { cardNumber: '', iban: '', bankName: '', paymentLink: '' },
    signature: '',
    bilingual: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function compressState(data: InvoiceData): string {
  const LZ = (window as any).LZString
  return LZ ? LZ.compressToEncodedURIComponent(JSON.stringify(data)) : encodeURIComponent(JSON.stringify(data))
}

export function decompressState(hash: string): InvoiceData | null {
  try {
    const LZ = (window as any).LZString
    const str = LZ ? LZ.decompressFromEncodedURIComponent(hash) : decodeURIComponent(hash)
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
