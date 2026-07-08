import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import type { ToastMessage } from '../../types'

const icons: Record<ToastMessage['type'], string> = {
  success: '✅',
  error: '❌',
  info: '💡',
  warning: '⚠️',
}

const bgColors: Record<ToastMessage['type'], string> = {
  success: '#FF8FAB',
  error: '#FF2D95',
  info: '#C9A7EB',
  warning: '#FFB347',
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useInvoiceStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  const dismiss = useCallback(() => removeToast(toast.id), [toast.id, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={dismiss}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '1rem',
        background: `linear-gradient(135deg, ${bgColors[toast.type]}22, ${bgColors[toast.type]}44)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${bgColors[toast.type]}55`,
        boxShadow: `0 8px 32px ${bgColors[toast.type]}33`,
        cursor: 'pointer',
        minWidth: '260px',
        maxWidth: '400px',
        color: '#4A2040',
        fontWeight: 500,
        fontSize: '0.9rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="alert"
    >
      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{toast.icon ?? icons[toast.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#4A2040',
          opacity: 0.5,
          fontSize: '1.1rem',
          padding: '0 0 0 0.5rem',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function Toast() {
  const toasts = useInvoiceStore((s) => s.toasts)

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        insetInlineEnd: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
