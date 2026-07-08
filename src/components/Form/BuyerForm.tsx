import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useT } from '../../i18n'
import type { Customer } from '../../types'
import { generateId } from '../../utils/helpers'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const

const inputStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.35rem',
}

export function BuyerForm() {
  const t = useT()
  const invoice = useInvoiceStore((s) => s.invoice)
  const customers = useInvoiceStore((s) => s.customers)
  const setBuyer = useInvoiceStore((s) => s.setBuyer)
  const addCustomer = useInvoiceStore((s) => s.addCustomer)
  const removeCustomer = useInvoiceStore((s) => s.removeCustomer)

  const [mode, setMode] = useState<'manual' | 'book'>('manual')
  const buyer = invoice.buyer

  const field = (label: string, key: keyof typeof buyer, type = 'text') => (
    <div style={inputStyle}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{label}</label>
      <input
        className="input-field"
        type={type}
        value={buyer[key] as string}
        onChange={(e) => setBuyer({ [key]: e.target.value })}
        style={{ direction: 'rtl' }}
      />
    </div>
  )

  const handleSelectCustomer = (id: string) => {
    const c = customers.find((c) => c.id === id)
    if (c) {
      setBuyer({ id: c.id, name: c.name, company: c.company, phone: c.phone, address: c.address, nationalCode: c.nationalCode })
    }
  }

  const handleSaveCustomer = () => {
    const customer: Customer = {
      id: buyer.id || generateId(),
      name: buyer.name,
      company: buyer.company,
      phone: buyer.phone,
      address: buyer.address,
      nationalCode: buyer.nationalCode,
    }
    addCustomer(customer)
    setBuyer({ id: customer.id })
  }

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }} variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={fadeUp}
        style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#4A2040', textAlign: 'right' }}
      >
        {t('buyerInfo')}
      </motion.h2>

      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className={mode === 'manual' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('manual')}
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          {t('newCustomer')}
        </button>
        <button
          type="button"
          className={mode === 'book' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('book')}
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          {t('customerBook')}
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'manual' ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            {field(t('name'), 'name')}
            {field(t('company'), 'company')}
            {field(t('phone'), 'phone', 'tel')}
            {field(t('address'), 'address')}
            {field(t('nationalCode'), 'nationalCode')}

            <motion.button
              type="button"
              className="btn-secondary"
              onClick={handleSaveCustomer}
              style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('saveCustomer')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            <div style={inputStyle}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('selectCustomer')}</label>
              <select
                className="input-field"
                value={buyer.id}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                style={{ direction: 'rtl' }}
              >
                <option value="">{t('selectCustomer')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `- ${c.company}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {field(t('name'), 'name')}
            {field(t('company'), 'company')}
            {field(t('phone'), 'phone', 'tel')}
            {field(t('address'), 'address')}
            {field(t('nationalCode'), 'nationalCode')}

            {customers.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040', display: 'block', marginBottom: '0.5rem' }}>
                  {t('customerBook')} ({customers.length})
                </span>
                {customers.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(255,143,171,0.06)',
                      marginBottom: '0.35rem',
                      direction: 'rtl',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#4A2040' }}>
                      <strong>{c.name}</strong>
                      {c.company && <span style={{ opacity: 0.6 }}> - {c.company}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomer(c.id)}
                      style={{
                        background: 'rgba(255,45,149,0.1)',
                        border: 'none',
                        borderRadius: '0.6rem',
                        width: '2rem',
                        height: '2rem',
                        cursor: 'pointer',
                        color: '#FF2D95',
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
