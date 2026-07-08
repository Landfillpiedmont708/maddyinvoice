import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InvoiceData, Customer, LineItem, AppSettings, TemplateId, ToastMessage } from '../types'
import { defaultInvoiceData, generateId } from '../utils/helpers'

interface State {
  invoice: InvoiceData
  customers: Customer[]
  settings: AppSettings
  toasts: ToastMessage[]
  undoStack: InvoiceData[]
  redoStack: InvoiceData[]
  invoiceCounter: number

  setInvoice: (data: Partial<InvoiceData>) => void
  setSeller: (data: Partial<InvoiceData['seller']>) => void
  setBuyer: (data: Partial<Customer>) => void
  setPayment: (data: Partial<InvoiceData['payment']>) => void
  setItems: (items: LineItem[]) => void
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, data: Partial<LineItem>) => void
  moveItem: (from: number, to: number) => void
  setTemplate: (id: TemplateId) => void
  setGlobalDiscount: (discount: { type: 'percent' | 'fixed'; value: number }) => void
  setSettings: (data: Partial<AppSettings>) => void
  addCustomer: (customer: Customer) => void
  removeCustomer: (id: string) => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  resetInvoice: () => void
  loadInvoice: (data: InvoiceData) => void
  incrementCounter: () => void
  setCounter: (n: number) => void
}

export const useInvoiceStore = create<State>()(
  persist(
    (set, get) => ({
      invoice: defaultInvoiceData(),
      customers: [],
      settings: {
        theme: 'light',
        language: 'fa',
        defaultTemplate: 'blossom',
        defaultCurrency: 'toman',
        defaultVatRate: 10,
        autoSave: true,
        reducedMotion: false,
        onboardingDone: false,
      },
      toasts: [],
      undoStack: [],
      redoStack: [],
      invoiceCounter: 1,

      setInvoice: (data) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, ...data, updatedAt: new Date().toISOString() } }))
      },
      setSeller: (data) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, seller: { ...s.invoice.seller, ...data }, updatedAt: new Date().toISOString() } }))
      },
      setBuyer: (data) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, buyer: { ...s.invoice.buyer, ...data }, updatedAt: new Date().toISOString() } }))
      },
      setPayment: (data) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, payment: { ...s.invoice.payment, ...data }, updatedAt: new Date().toISOString() } }))
      },
      setItems: (items) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, items, updatedAt: new Date().toISOString() } }))
      },
      addItem: () => {
        get().pushHistory()
        set((s) => ({
          invoice: {
            ...s.invoice,
            items: [...s.invoice.items, { id: generateId(), description: '', quantity: 1, unit: 'عدد', unitPrice: 0, discount: 0, tax: 0 }],
            updatedAt: new Date().toISOString(),
          },
        }))
      },
      removeItem: (id) => {
        get().pushHistory()
        set((s) => ({
          invoice: { ...s.invoice, items: s.invoice.items.filter((i) => i.id !== id), updatedAt: new Date().toISOString() },
        }))
      },
      updateItem: (id, data) => {
        get().pushHistory()
        set((s) => ({
          invoice: {
            ...s.invoice,
            items: s.invoice.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
            updatedAt: new Date().toISOString(),
          },
        }))
      },
      moveItem: (from, to) => {
        get().pushHistory()
        set((s) => {
          const items = [...s.invoice.items]
          const [removed] = items.splice(from, 1)
          items.splice(to, 0, removed)
          return { invoice: { ...s.invoice, items, updatedAt: new Date().toISOString() } }
        })
      },
      setTemplate: (id) => set((s) => ({ invoice: { ...s.invoice, templateId: id } })),
      setGlobalDiscount: (discount) => {
        get().pushHistory()
        set((s) => ({ invoice: { ...s.invoice, globalDiscount: discount, updatedAt: new Date().toISOString() } }))
      },
      setSettings: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),
      addCustomer: (customer) => set((s) => ({ customers: [...s.customers.filter((c) => c.id !== customer.id), customer] })),
      removeCustomer: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),
      addToast: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: generateId() }] })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      undo: () => {
        const { undoStack, invoice } = get()
        if (undoStack.length === 0) return
        const prev = undoStack[undoStack.length - 1]
        set((s) => ({
          undoStack: s.undoStack.slice(0, -1),
          redoStack: [...s.redoStack, invoice],
          invoice: prev,
        }))
      },
      redo: () => {
        const { redoStack, invoice } = get()
        if (redoStack.length === 0) return
        const next = redoStack[redoStack.length - 1]
        set((s) => ({
          redoStack: s.redoStack.slice(0, -1),
          undoStack: [...s.undoStack, invoice],
          invoice: next,
        }))
      },
      pushHistory: () => set((s) => ({ undoStack: [...s.undoStack.slice(-49), s.invoice], redoStack: [] })),
      resetInvoice: () => set({ invoice: defaultInvoiceData() }),
      loadInvoice: (data) => set({ invoice: data }),
      incrementCounter: () => set((s) => ({ invoiceCounter: s.invoiceCounter + 1 })),
      setCounter: (n) => set({ invoiceCounter: n }),
    }),
    {
      name: 'maddyinvoice-storage',
      partialize: (state) => ({
        settings: state.settings,
        customers: state.customers,
        invoiceCounter: state.invoiceCounter,
        invoice: state.invoice,
      }),
      merge: (persisted: any, current) => ({ ...current, ...persisted }),
    }
  )
)
