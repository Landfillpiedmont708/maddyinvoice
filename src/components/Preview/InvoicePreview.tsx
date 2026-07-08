import { forwardRef, useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { templates } from '../Templates/templatesData'
import { TemplateRenderer } from '../Templates/TemplateRenderer'
import { useT } from '../../i18n'

interface InvoicePreviewProps {
  className?: string
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ className }, ref) {
    const t = useT()
    const invoice = useInvoiceStore((s) => s.invoice)
    const setTemplate = useInvoiceStore((s) => s.setTemplate)
    const containerRef = useRef<HTMLDivElement>(null)
    const [zoom, setZoom] = useState(1)

    const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), [])
    const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.25)), [])
    const actualSize = useCallback(() => setZoom(1), [])

    const fitToWidth = useCallback(() => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 48
        setZoom(Math.max(0.25, Math.min(Math.round((w / 794) * 100) / 100, 3)))
      }
    }, [])

    useEffect(() => {
      const handleResize = () => fitToWidth()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [fitToWidth])

    const MemoRenderer = useMemo(
      () => <TemplateRenderer invoice={invoice} scale={1} />,
      [invoice],
    )

    return (
      <div className={`flex flex-col gap-4 ${className ?? ''}`} dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              className="btn-secondary flex items-center justify-center text-lg"
              style={{ width: 36, height: 36, padding: 0 }}
              aria-label="zoom out"
            >
              −
            </button>
            <span
              className="font-mono text-sm font-semibold min-w-[4rem] text-center"
              style={{ color: '#4A2040' }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="btn-secondary flex items-center justify-center text-lg"
              style={{ width: 36, height: 36, padding: 0 }}
              aria-label="zoom in"
            >
              +
            </button>
            <div className="w-px h-6 mx-1" style={{ background: '#FFC2D1' }} />
            <button
              type="button"
              onClick={fitToWidth}
              className="btn-secondary text-xs"
            >
              fitting
            </button>
            <button
              type="button"
              onClick={actualSize}
              className={`btn-secondary text-xs ${zoom === 1 ? 'ring-2 ring-rose' : ''}`}
            >
              1:1
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-auto rounded-2xl"
          style={{
            background: 'rgba(255, 194, 209, 0.15)',
            maxHeight: 'calc(100vh - 340px)',
          }}
        >
          <div
            style={{
              padding: '24px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 0,
            }}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(74, 32, 64, 0.12), 0 2px 8px rgba(74, 32, 64, 0.06)',
                background: '#fff',
                lineHeight: 0,
              }}
            >
              <div
                ref={ref}
                style={{
                  width: 794,
                  minHeight: 1123,
                  background: '#fff',
                  position: 'relative',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={invoice.templateId}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    {MemoRenderer}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: '#4A2040' }}
          >
            {t('templates')}
          </h3>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {templates.map((t) => {
              const active = invoice.templateId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200"
                  style={{
                    minWidth: 72,
                    borderColor: active ? '#FF8FAB' : 'transparent',
                    background: active
                      ? 'linear-gradient(135deg, rgba(255, 143, 171, 0.1), rgba(201, 167, 235, 0.1))'
                      : 'rgba(255, 255, 255, 0.5)',
                    boxShadow: active
                      ? '0 4px 16px rgba(255, 143, 171, 0.2)'
                      : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <span className="text-2xl">{t.preview}</span>
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{
                      color: active ? '#FF8FAB' : '#4A2040',
                    }}
                  >
                    {t.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  },
)
