import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useT } from '../../i18n'
import { formatCardNumber, formatIBAN, detectBank } from '../../utils/persian'

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

export function PaymentForm() {
  const t = useT()
  const payment = useInvoiceStore((s) => s.invoice.payment)
  const setPayment = useInvoiceStore((s) => s.setPayment)

  const bank = payment.cardNumber ? detectBank(payment.cardNumber) : null

  const handleCardChange = useCallback(
    (value: string) => {
      const raw = value.replace(/\s|-/g, '')
      if (!/^\d*$/.test(raw)) return
      const formatted = formatCardNumber(raw)
      setPayment({ cardNumber: formatted, bankName: detectBank(raw)?.name ?? '' })
    },
    [setPayment]
  )

  const handleIBANChange = useCallback(
    (value: string) => {
      const raw = value.replace(/\s|-/g, '')
      const formatted = formatIBAN(raw)
      setPayment({ iban: formatted })
    },
    [setPayment]
  )

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }} variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={fadeUp}
        style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#4A2040', textAlign: 'right' }}
      >
        {t('paymentInfo')}
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('cardNumber')}</label>
          <input
            className="input-field"
            value={payment.cardNumber}
            onChange={(e) => handleCardChange(e.target.value)}
            placeholder="XXXX - XXXX - XXXX - XXXX"
            style={{ direction: 'ltr', textAlign: 'left', letterSpacing: '0.05em' }}
          />
          {bank && (
            <span
              style={{
                fontSize: '0.8rem',
                color: '#C9A7EB',
                fontWeight: 600,
                marginTop: '0.2rem',
                textAlign: 'right',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: '#C9A7EB',
              }} />
              {t('bankName')}: {bank.name}
            </span>
          )}
        </motion.div>

        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('iban')}</label>
          <input
            className="input-field"
            value={payment.iban}
            onChange={(e) => handleIBANChange(e.target.value)}
            placeholder="IR XXXX XXXX XXXX XXXX XXXX XXXX"
            style={{ direction: 'ltr', textAlign: 'left', letterSpacing: '0.05em' }}
          />
        </motion.div>

        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('paymentLink')}</label>
          <input
            className="input-field"
            value={payment.paymentLink}
            onChange={(e) => setPayment({ paymentLink: e.target.value })}
            placeholder="https://..."
            style={{ direction: 'ltr' }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
