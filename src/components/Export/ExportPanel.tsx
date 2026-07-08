import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng, toBlob } from 'html-to-image'
import { jsPDF } from 'jspdf'
import LZ from 'lz-string'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { downloadBlob } from '../../utils/helpers'
import { useT } from '../../i18n'

interface ExportPanelProps {
  previewRef: React.RefObject<HTMLDivElement | null>
}

const PNG_SCALES = [2, 3]

const CONFETTI_COLORS = ['#FF8FAB', '#FFC2D1', '#C9A7EB', '#FFD700']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.3,
        duration: 1.2 + Math.random() * 0.8,
      })),
    [],
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -30, rotate: 0, opacity: 1, scale: 1 }}
          animate={{ y: '110vh', rotate: p.rotation, opacity: 0, scale: 0.4 }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

export function ExportPanel({ previewRef }: ExportPanelProps) {
  const t = useT()
  const invoice = useInvoiceStore((s) => s.invoice)
  const addToast = useInvoiceStore((s) => s.addToast)
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice)
  const [exporting, setExporting] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const capture = useCallback(
    async (pixelRatio: number = 1) => {
      const el = previewRef.current
      if (!el) throw new Error('Preview element not found')
      return toPng(el, { pixelRatio, cacheBust: true })
    },
    [previewRef],
  )

  const captureBlob = useCallback(
    async (pixelRatio: number = 1) => {
      const el = previewRef.current
      if (!el) throw new Error('Preview element not found')
      return toBlob(el, { pixelRatio, cacheBust: true })
    },
    [previewRef],
  )

  const handleExportPDF = useCallback(async () => {
    setExporting('pdf')
    try {
      const dataUrl = await capture(2)
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (1123 / 794) * pdfW
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`invoice-${invoice.invoiceNumber || 'export'}.pdf`)
      addToast({ type: 'success', message: t('exportSuccess') })
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 2500)
    } catch {
      addToast({ type: 'error', message: t('error') })
    } finally {
      setExporting(null)
    }
  }, [capture, invoice.invoiceNumber, addToast])

  const handleExportPNG = useCallback(
    async (scale: number) => {
      setExporting(`png-${scale}x`)
      try {
        const dataUrl = await capture(scale)
        downloadBlob(
          await (await fetch(dataUrl)).blob(),
          `invoice-${invoice.invoiceNumber || 'export'}-${scale}x.png`,
        )
        addToast({ type: 'success', message: t('exportSuccess') })
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 2500)
      } catch {
        addToast({ type: 'error', message: t('error') })
      } finally {
        setExporting(null)
      }
    },
    [capture, invoice.invoiceNumber, addToast],
  )

  const handleCopyImage = useCallback(async () => {
    setExporting('copy')
    try {
      const blob = await captureBlob(2)
      if (!blob) throw new Error('Failed to capture')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      addToast({ type: 'success', message: t('copySuccess') })
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 2500)
    } catch {
      addToast({ type: 'error', message: t('error') })
    } finally {
      setExporting(null)
    }
  }, [captureBlob, addToast])

  const handlePrint = useCallback(async () => {
    setExporting('print')
    try {
      const dataUrl = await capture(2)
      const win = window.open('', '_blank')
      if (!win) throw new Error('Popup blocked')
      win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head><title>Print Invoice</title>
        <style>
          body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          img { max-width: 100%; height: auto; }
          @media print { body { margin: 0; } img { max-width: 100%; } }
        </style>
        </head>
        <body><img src="${dataUrl}" onload="window.print();window.close()" /></body>
        </html>
      `)
      win.document.close()
    } catch {
      addToast({ type: 'error', message: t('error') })
    } finally {
      setExporting(null)
    }
  }, [capture, addToast])

  const handleShareLink = useCallback(async () => {
    setExporting('share')
    try {
      const compressed = LZ.compressToEncodedURIComponent(JSON.stringify(invoice))
      const url = `${window.location.origin}${window.location.pathname}#${compressed}`
      await navigator.clipboard.writeText(url)
      addToast({ type: 'success', message: t('copySuccess') })
    } catch {
      addToast({ type: 'error', message: t('error') })
    } finally {
      setExporting(null)
    }
  }, [invoice, addToast])

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `invoice-${invoice.invoiceNumber || 'export'}.json`)
    addToast({ type: 'success', message: t('exportSuccess') })
  }, [invoice, addToast])

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        loadInvoice(data)
        addToast({ type: 'success', message: t('exportSuccess') })
      } catch {
        addToast({ type: 'error', message: t('error') })
      }
      e.target.value = ''
    },
    [loadInvoice, addToast],
  )

  const isExporting = exporting !== null

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {celebrate && (
          <motion.div
            key="confetti"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Confetti />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card space-y-4" dir="rtl">
        <div className="flex items-center justify-between">
          <h3
            className="text-sm font-semibold"
            style={{ color: '#4A2040' }}
          >
            {t('export')}
          </h3>
          {isExporting && (
            <span className="text-xs font-medium" style={{ color: '#FF8FAB' }}>
              {t('loading')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-primary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {t('exportPdf')}
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {t('copyImage')}
          </button>

          {PNG_SCALES.map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => handleExportPNG(scale)}
              disabled={isExporting}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {t('exportPng')} {scale}x
            </button>
          ))}

          <button
            type="button"
            onClick={handlePrint}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            {t('print')}
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {t('shareLink')}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('exportJson')}
          </button>

          <button
            type="button"
            onClick={handleImportJSON}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {t('importJson')}
          </button>
        </div>
      </div>
    </>
  )
}
