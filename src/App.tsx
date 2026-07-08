import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInvoiceStore } from './stores/invoiceStore'
import { InvoicePreview } from './components/Preview/InvoicePreview'
import { ExportPanel } from './components/Export/ExportPanel'
import ArchivePanel from './components/Archive/ArchivePanel'
import { SellerForm } from './components/Form/SellerForm'
import { BuyerForm } from './components/Form/BuyerForm'
import { ItemsForm } from './components/Form/ItemsForm'
import { PaymentForm } from './components/Form/PaymentForm'
import { InvoiceMetaForm } from './components/Form/InvoiceMetaForm'
import Toast from './components/UI/Toast'
import { useT, isRTL, type Lang } from './i18n'

type View = 'form' | 'preview' | 'export' | 'archive'
type FormStep = 'meta' | 'seller' | 'buyer' | 'items' | 'payment'

function App() {
  const previewRef = useRef<HTMLDivElement>(null)
  const settings = useInvoiceStore((s) => s.settings)
  const setSettings = useInvoiceStore((s) => s.setSettings)
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice)
  const addToast = useInvoiceStore((s) => s.addToast)
  const undo = useInvoiceStore((s) => s.undo)
  const redo = useInvoiceStore((s) => s.redo)
  const t = useT()

  const [view, setView] = useState<View>('form')
  const [formStep, setFormStep] = useState<FormStep>('meta')
  const [mobileStep, setMobileStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!settings.onboardingDone)
  const [onboardingStep, setOnboardingStep] = useState(0)

  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  useEffect(() => {
    const dir = isRTL(settings.language as Lang) ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = settings.language
    if (settings.theme === 'dark') document.body.classList.add('dark')
    else document.body.classList.remove('dark')
  }, [settings.theme, settings.language])

  useEffect(() => {
    const h = window.location.hash.slice(1)
    if (h) {
      try {
        const LZ = (window as any).LZString
        const str = LZ ? LZ.decompressFromEncodedURIComponent(h) : decodeURIComponent(h)
        if (str) {
          const data = JSON.parse(str)
          useInvoiceStore.getState().loadInvoice(data)
          addToast({ type: 'info', message: t('invoiceLoadedFromShare') })
        }
      } catch { /* ignore invalid hash */ }
    }
  }, [addToast])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        addToast({ type: 'success', message: t('saveSuccess') })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setView('export')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, addToast, t])

  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false)
    setSettings({ onboardingDone: true })
  }, [setSettings])

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'form', label: t('form'), icon: '📝' },
    { id: 'preview', label: t('preview'), icon: '👁️' },
    { id: 'export', label: t('export'), icon: '📤' },
    { id: 'archive', label: t('archive'), icon: '📂' },
  ]

  const formSteps: { id: FormStep; label: string }[] = [
    { id: 'meta', label: t('invoiceNumber') },
    { id: 'seller', label: t('sellerInfo') },
    { id: 'buyer', label: t('buyerInfo') },
    { id: 'items', label: t('items') },
    { id: 'payment', label: t('paymentInfo') },
  ]

  const renderOnboarding = () => {
    const steps = [t('onboarding1'), t('onboarding2'), t('onboarding3'), t('onboarding4')]
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-8 max-w-sm w-full mx-4 text-center"
        >
          <motion.div
            key={onboardingStep}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="text-5xl mb-4">
              {['🌸', '✨', '📄', '💖'][onboardingStep]}
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#4A2040' }}>
              {steps[onboardingStep]}
            </h2>
          </motion.div>
          <div className="flex justify-center gap-2 my-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === onboardingStep ? '#FF8FAB' : '#FFC2D1',
                  width: i === onboardingStep ? 24 : 8,
                }}
              />
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-6">
            {onboardingStep < steps.length - 1 ? (
              <>
                <button type="button" onClick={completeOnboarding} className="btn-secondary text-sm">
                  {t('skip')}
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep((s) => s + 1)}
                  className="btn-primary text-sm"
                >
                  {t('next')}
                </button>
              </>
            ) : (
              <button type="button" onClick={completeOnboarding} className="btn-primary">
                {t('done')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  const renderFormStep = () => {
    switch (formStep) {
      case 'meta': return <InvoiceMetaForm />
      case 'seller': return <SellerForm />
      case 'buyer': return <BuyerForm />
      case 'items': return <ItemsForm />
      case 'payment': return <PaymentForm />
    }
  }

  const renderDesktopLayout = () => (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #F8F0FF 100%)' }}>
      <nav className="w-16 flex flex-col items-center py-4 gap-2 glass" style={{ borderRadius: 0 }}>
        <div className="text-lg font-bold mb-4" style={{ color: '#FF8FAB' }}>M</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition-all text-lg"
            style={{
              background: view === item.id ? 'linear-gradient(135deg, rgba(255,143,171,0.2), rgba(201,167,235,0.2))' : 'transparent',
              color: view === item.id ? '#FF8FAB' : '#4A2040',
            }}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-lg"
          title={settings.theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {settings.theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          type="button"
          onClick={resetInvoice}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-lg"
          title={t('newInvoice')}
        >
          🆕
        </button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {view === 'form' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex gap-2 mb-6">
                {formSteps.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setFormStep(step.id)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: formStep === step.id ? '#FF8FAB' : 'rgba(255,143,171,0.1)',
                      color: formStep === step.id ? 'white' : '#4A2040',
                    }}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={formStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderFormStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="w-[600px] overflow-y-auto p-6 border-r" style={{ borderColor: 'rgba(255,143,171,0.15)' }}>
            <InvoicePreview ref={previewRef} />
            <div className="mt-6">
              <ExportPanel previewRef={previewRef} />
            </div>
          </div>
        )}

        {view === 'preview' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <InvoicePreview ref={previewRef} />
            </div>
          </div>
        )}

        {view === 'export' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <InvoicePreview ref={previewRef} />
              <ExportPanel previewRef={previewRef} />
            </div>
          </div>
        )}

        {view === 'archive' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ArchivePanel />
          </div>
        )}
      </div>
    </div>
  )

  const renderMobileLayout = () => (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #F8F0FF 100%)' }}>
      <div className="sticky top-0 z-20 glass px-4 py-3 flex items-center justify-between" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-3">
          <span className="font-bold" style={{ color: '#FF8FAB' }}>maddyInvoice</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            👁️ {t('preview')}
          </button>
          <button
            type="button"
            onClick={() => setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {settings.theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {formSteps.map((step, i) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setMobileStep(i)}
              className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={{
                background: mobileStep === i ? '#FF8FAB' : 'rgba(255,143,171,0.1)',
                color: mobileStep === i ? 'white' : '#4A2040',
              }}
            >
              {i + 1}. {step.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={formSteps[mobileStep].id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
          >
            {(() => {
              setFormStep(formSteps[mobileStep].id)
              return renderFormStep()
            })()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 justify-between mt-6">
          <button
            type="button"
            onClick={() => setMobileStep((s) => Math.max(0, s - 1))}
            disabled={mobileStep === 0}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ← {t('previous')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (mobileStep < formSteps.length - 1) {
                setMobileStep((s) => s + 1)
              } else {
                setView('export')
              }
            }}
            className="btn-primary text-sm"
          >
            {mobileStep < formSteps.length - 1 ? t('next') + ' →' : t('finishAndExport')}
          </button>
        </div>

        <div className="mt-6">
          <div className="flex gap-2">
            {(['export', 'archive'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="btn-secondary text-sm flex-1"
              >
                {v === 'export' ? t('export') : t('archive')}
              </button>
            ))}
          </div>
        </div>

        {view === 'export' && (
          <div className="mt-4">
            <ExportPanel previewRef={previewRef} />
          </div>
        )}

        {view === 'archive' && (
          <div className="mt-4">
            <ArchivePanel />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-30 bg-white overflow-y-auto"
            style={{ background: '#FFF5F7' }}
          >
            <div className="sticky top-0 glass p-3 flex justify-between items-center" style={{ borderRadius: 0 }}>
              <span className="font-bold" style={{ color: '#4A2040' }}>{t('preview')}</span>
              <button type="button" onClick={() => setShowPreview(false)} className="btn-secondary text-xs px-3 py-1">
                ✕ {t('close')}
              </button>
            </div>
            <div className="p-4">
              <InvoicePreview ref={previewRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      {isDesktop || isTablet ? renderDesktopLayout() : renderMobileLayout()}
      <Toast />

      <AnimatePresence>
        {showOnboarding && renderOnboarding()}
      </AnimatePresence>
    </>
  )
}

export default App
