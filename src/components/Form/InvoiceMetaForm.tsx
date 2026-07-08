import { motion } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useT } from '../../i18n'
import type { DocumentType, InvoiceStatus, Currency } from '../../types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
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

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#4A2040',
}

export function InvoiceMetaForm() {
  const t = useT()

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'official', label: t('official') },
    { value: 'proforma', label: t('proforma') },
    { value: 'receipt', label: t('receipt') },
    { value: 'statement', label: t('statement') },
  ]

  const statuses: { value: InvoiceStatus; label: string }[] = [
    { value: 'paid', label: t('paid') },
    { value: 'pending', label: t('pending') },
    { value: 'overdue', label: t('overdue') },
  ]

  const currencies: { value: Currency; label: string }[] = [
    { value: 'toman', label: t('toman') },
    { value: 'rial', label: t('rial') },
    { value: 'usd', label: t('usd') },
    { value: 'eur', label: t('eur') },
    { value: 'usdt', label: t('usdt') },
  ]

  const invoice = useInvoiceStore((s) => s.invoice)
  const setInvoice = useInvoiceStore((s) => s.setInvoice)

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }} variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={fadeUp}
        style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#4A2040', textAlign: 'right' }}
      >
        {t('invoiceMeta')}
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('invoiceNumber')}</label>
            <input
              className="input-field"
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice({ invoiceNumber: e.target.value })}
              style={{ direction: 'rtl' }}
            />
          </div>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('invoicePrefix')}</label>
            <input
              className="input-field"
              value={invoice.invoicePrefix}
              onChange={(e) => setInvoice({ invoicePrefix: e.target.value })}
              style={{ direction: 'rtl' }}
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>{t('documentType')}</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {documentTypes.map((dt) => (
              <label
                key={dt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.85rem',
                  background: invoice.documentType === dt.value
                    ? 'linear-gradient(135deg, #FF8FAB22, #C9A7EB22)'
                    : 'rgba(255,143,171,0.04)',
                  border: invoice.documentType === dt.value
                    ? '1px solid #FF8FAB'
                    : '1px solid rgba(255,143,171,0.1)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#4A2040',
                  fontWeight: invoice.documentType === dt.value ? 700 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="documentType"
                  value={dt.value}
                  checked={invoice.documentType === dt.value}
                  onChange={() => setInvoice({ documentType: dt.value })}
                  style={{ accentColor: '#FF8FAB' }}
                />
                {dt.label}
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('status')}</label>
            <select
              className="input-field"
              value={invoice.status}
              onChange={(e) => setInvoice({ status: e.target.value as InvoiceStatus })}
              style={{ direction: 'rtl' }}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('currency')}</label>
            <select
              className="input-field"
              value={invoice.currency}
              onChange={(e) => setInvoice({ currency: e.target.value as Currency })}
              style={{ direction: 'rtl' }}
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('issueDate')}</label>
            <input
              className="input-field"
              type="date"
              value={invoice.issueDate}
              onChange={(e) => setInvoice({ issueDate: e.target.value })}
              style={{ direction: 'rtl' }}
            />
          </div>
          <div style={inputStyle}>
            <label style={labelStyle}>{t('dueDate')}</label>
            <input
              className="input-field"
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({ dueDate: e.target.value })}
              style={{ direction: 'rtl' }}
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={labelStyle}>{t('notes')}</label>
          <textarea
            className="input-field"
            value={invoice.notes}
            onChange={(e) => setInvoice({ notes: e.target.value })}
            rows={3}
            style={{ direction: 'rtl', resize: 'vertical' }}
          />
        </motion.div>

        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={labelStyle}>{t('paymentTerms')}</label>
          <textarea
            className="input-field"
            value={invoice.paymentTerms}
            onChange={(e) => setInvoice({ paymentTerms: e.target.value })}
            rows={2}
            style={{ direction: 'rtl', resize: 'vertical' }}
          />
        </motion.div>

        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={labelStyle}>{t('thankYou')}</label>
          <input
            className="input-field"
            value={invoice.thankYouMessage}
            onChange={(e) => setInvoice({ thankYouMessage: e.target.value })}
            style={{ direction: 'rtl' }}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <label
            style={{
              ...labelStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '0.6rem 0.85rem',
              borderRadius: '0.85rem',
              background: 'rgba(201,167,235,0.1)',
              border: '1px solid rgba(201,167,235,0.2)',
            }}
          >
            <span>{t('bilingual')}</span>
            <div
              onClick={() => setInvoice({ bilingual: !invoice.bilingual })}
              style={{
                width: '2.75rem',
                height: '1.5rem',
                borderRadius: '1rem',
                background: invoice.bilingual
                  ? 'linear-gradient(135deg, #FF8FAB, #C9A7EB)'
                  : 'rgba(255,143,171,0.2)',
                position: 'relative',
                transition: 'background 0.3s',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '1.2rem',
                  height: '1.2rem',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '0.15rem',
                  left: invoice.bilingual ? '1.4rem' : '0.15rem',
                  transition: 'left 0.3s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              />
            </div>
            <input
              type="checkbox"
              checked={invoice.bilingual}
              onChange={(e) => setInvoice({ bilingual: e.target.checked })}
              style={{ display: 'none' }}
            />
          </label>
        </motion.div>
      </div>
    </motion.div>
  )
}
