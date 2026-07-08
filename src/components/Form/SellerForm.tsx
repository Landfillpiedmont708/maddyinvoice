import { useRef, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useT } from '../../i18n'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const

const socialLinkStyle = {
  display: 'flex' as const,
  gap: '0.5rem',
  alignItems: 'center',
}

const inputStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.35rem',
}

export function SellerForm() {
  const t = useT()
  const invoice = useInvoiceStore((s) => s.invoice)
  const setSeller = useInvoiceStore((s) => s.setSeller)
  const fileRef = useRef<HTMLInputElement>(null)
  const seller = invoice.seller

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSeller({ logo: reader.result as string })
    reader.readAsDataURL(file)
  }

  const addSocialLink = () => {
    setSeller({ socialLinks: [...seller.socialLinks, { label: '', url: '' }] })
  }

  const updateSocialLink = (index: number, field: 'label' | 'url', value: string) => {
    const links = seller.socialLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    setSeller({ socialLinks: links })
  }

  const removeSocialLink = (index: number) => {
    setSeller({ socialLinks: seller.socialLinks.filter((_, i) => i !== index) })
  }

  const field = (label: string, key: keyof typeof seller, type = 'text') => (
    <div style={inputStyle}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{label}</label>
      <input
        className="input-field"
        type={type}
        value={seller[key] as string}
        onChange={(e) => setSeller({ [key]: e.target.value })}
        style={{ direction: 'rtl' }}
      />
    </div>
  )

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }} variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={fadeUp}
        style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#4A2040', textAlign: 'right' }}
      >
        {t('sellerInfo')}
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <motion.div variants={fadeUp} style={inputStyle}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('logo')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {seller.logo && (
              <img
                src={seller.logo}
                alt="Logo"
                style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', objectFit: 'cover', border: '1px solid rgba(255,143,171,0.2)' }}
              />
            )}
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ fontSize: '0.85rem' }}>
              {t('uploadLogo')}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>{field(t('name'), 'name')}</motion.div>
        <motion.div variants={fadeUp}>{field(t('phone'), 'phone', 'tel')}</motion.div>
        <motion.div variants={fadeUp}>{field(t('email'), 'email', 'email')}</motion.div>
        <motion.div variants={fadeUp}>
          <div style={inputStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('address')}</label>
            <textarea
              className="input-field"
              value={seller.address}
              onChange={(e) => setSeller({ address: e.target.value })}
              rows={2}
              style={{ direction: 'rtl', resize: 'vertical' }}
            />
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>{field(t('nationalCode'), 'nationalCode')}</motion.div>
        <motion.div variants={fadeUp}>{field(t('economicCode'), 'economicCode')}</motion.div>

        <motion.div variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4A2040' }}>{t('socialLinks')}</span>
            <button type="button" className="btn-secondary" onClick={addSocialLink} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              + {t('addLink')}
            </button>
          </div>
          {seller.socialLinks.map((link, i) => (
            <div key={i} style={{ ...socialLinkStyle, marginTop: '0.6rem' }}>
              <input
                className="input-field"
                placeholder={t('label')}
                value={link.label}
                onChange={(e) => updateSocialLink(i, 'label', e.target.value)}
                style={{ flex: 1, direction: 'rtl' }}
              />
              <input
                className="input-field"
                placeholder={t('url')}
                value={link.url}
                onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                style={{ flex: 2, direction: 'rtl' }}
              />
              <button
                type="button"
                onClick={() => removeSocialLink(i)}
                style={{
                  background: 'rgba(255,45,149,0.1)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  width: '2.25rem',
                  height: '2.25rem',
                  cursor: 'pointer',
                  color: '#FF2D95',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
