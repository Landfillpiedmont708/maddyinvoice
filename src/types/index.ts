export interface SellerProfile {
  name: string
  logo: string
  phone: string
  email: string
  address: string
  nationalCode: string
  economicCode: string
  socialLinks: { label: string; url: string }[]
}

export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  address: string
  nationalCode: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  tax: number
}

export interface PaymentInfo {
  cardNumber: string
  iban: string
  bankName: string
  paymentLink: string
}

export type DocumentType = 'official' | 'proforma' | 'receipt' | 'statement'
export type InvoiceStatus = 'paid' | 'pending' | 'overdue'
export type Currency = 'toman' | 'rial' | 'usd' | 'eur' | 'usdt'
export type TemplateId =
  | 'blossom' | 'rose-gold' | 'lavender' | 'minimal-chic'
  | 'marble-luxe' | 'pastel-wave' | 'classic-formal' | 'dark-elegance'
  | 'botanical' | 'geometric' | 'vintage-paper' | 'gradient-pop'

export interface InvoiceData {
  id: string
  templateId: TemplateId
  documentType: DocumentType
  status: InvoiceStatus
  invoiceNumber: string
  invoicePrefix: string
  currency: Currency
  issueDate: string
  dueDate: string
  seller: SellerProfile
  buyer: Customer
  items: LineItem[]
  globalDiscount: { type: 'percent' | 'fixed'; value: number }
  vatRate: number
  shippingCost: number
  notes: string
  paymentTerms: string
  thankYouMessage: string
  payment: PaymentInfo
  signature: string
  bilingual: boolean
  createdAt: string
  updatedAt: string
}

export interface ArchiveEntry {
  id: string
  invoiceNumber: string
  buyerName: string
  total: number
  currency: Currency
  status: InvoiceStatus
  createdAt: string
  data: InvoiceData
}

export interface AppSettings {
  theme: 'light' | 'dark'
  language: 'fa' | 'en' | 'de' | 'ar' | 'ru' | 'fr'
  defaultTemplate: TemplateId
  defaultCurrency: Currency
  defaultVatRate: number
  autoSave: boolean
  reducedMotion: boolean
  onboardingDone: boolean
}

export interface InvoiceTemplate {
  id: TemplateId
  name: string
  nameEn: string
  preview: string
  customization: TemplateCustomization
}

export interface TemplateCustomization {
  primaryColor: string
  fontFamily: string
  fontSize: number
  showLogo: boolean
  showSignature: boolean
  showQR: boolean
  showPaymentInfo: boolean
  logoPosition: 'left' | 'right' | 'center'
  watermark: string
}

export interface ItemPreset {
  id: string
  description: string
  unit: string
  unitPrice: number
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  icon?: string
}
