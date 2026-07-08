import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns-jalali'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { archiveStore } from '../../stores/archiveStore'
import Modal from '../UI/Modal'
import type { ArchiveEntry, Currency } from '../../types'
import { generateId, downloadBlob } from '../../utils/helpers'
import { formatNumber } from '../../utils/persian'
import { useT } from '../../i18n'

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const statusLabel = (s: string, tFn: (k: string) => string): string => {
  const map: Record<string, string> = {
    all: tFn('all'),
    paid: tFn('paid'),
    pending: tFn('pending'),
    overdue: tFn('overdue'),
  }
  return map[s] ?? s
}

const currencyLabel = (c: Currency, tFn: (k: string) => string): string => tFn(c)

function statusBadgeStyle(status: string): React.CSSProperties {
  const map: Record<string, { bg: string; text: string }> = {
    paid: { bg: '#D1FAE5', text: '#065F46' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    overdue: { bg: '#FEE2E2', text: '#991B1B' },
  }
  const c = map[status] ?? map.pending
  return {
    background: c.bg,
    color: c.text,
    padding: '0.2rem 0.65rem',
    borderRadius: '0.75rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'inline-block',
    lineHeight: 1.6,
  }
}

const tabVariants = {
  inactive: { opacity: 0.6 },
  active: { opacity: 1 },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
}

export default function ArchivePanel() {
  const t = useT()
  const [activeTab, setActiveTab] = useState<'archive' | 'dashboard'>('archive')
  const [entries, setEntries] = useState<ArchiveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [restoreConfirm, setRestoreConfirm] = useState(false)
  const [restoreJson, setRestoreJson] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadInvoice = useInvoiceStore((s) => s.loadInvoice)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const all = await archiveStore.getAll()
      setEntries(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const filtered = useMemo(() => {
    let result = entries
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase()
      result = result.filter(
        (e) => e.buyerName.toLowerCase().includes(q) || e.invoiceNumber.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter)
    }
    return result
  }, [entries, debouncedQuery, statusFilter])

  const dashboard = useMemo(() => {
    const now = new Date()
    const jYear = parseInt(format(now, 'yyyy'))
    const jMonth = parseInt(format(now, 'M'))

    const thisMonthIncome = entries
      .filter((e) => {
        if (e.status !== 'paid') return false
        const d = new Date(e.createdAt)
        return parseInt(format(d, 'yyyy')) === jYear && parseInt(format(d, 'M')) === jMonth
      })
      .reduce((sum, e) => sum + e.total, 0)

    const unpaidCount = entries.filter((e) => e.status === 'pending' || e.status === 'overdue').length
    const totalCount = entries.length

    const monthlyTotals: { year: number; month: number; label: string; total: number }[] = []
    for (let i = 5; i >= 0; i--) {
      let m = jMonth - i
      let y = jYear
      if (m <= 0) { m += 12; y -= 1 }
      const total = entries
        .filter((e) => e.status === 'paid')
        .filter((e) => {
          const d = new Date(e.createdAt)
          return parseInt(format(d, 'yyyy')) === y && parseInt(format(d, 'M')) === m
        })
        .reduce((sum, e) => sum + e.total, 0)
      monthlyTotals.push({ year: y, month: m, label: persianMonths[m - 1], total })
    }

    return { thisMonthIncome, unpaidCount, totalCount, monthlyTotals }
  }, [entries])

  const maxMonthly = useMemo(() => Math.max(...dashboard.monthlyTotals.map((m) => m.total), 1), [dashboard.monthlyTotals])

  const handleView = useCallback((entry: ArchiveEntry) => {
    loadInvoice(entry.data)
  }, [loadInvoice])

  const handleDuplicate = useCallback((entry: ArchiveEntry) => {
    const newInvoice = {
      ...entry.data,
      id: generateId(),
      invoiceNumber: '',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    loadInvoice(newInvoice)
  }, [loadInvoice])

  const handleDelete = useCallback(async () => {
    if (!deleteConfirmId) return
    await archiveStore.delete(deleteConfirmId)
    setEntries((prev) => prev.filter((e) => e.id !== deleteConfirmId))
    setDeleteConfirmId(null)
  }, [deleteConfirmId])

  const handleBackup = useCallback(async () => {
    const json = await archiveStore.backup()
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `maddyinvoice-backup-${format(new Date(), 'yyyy-MM-dd')}.json`)
  }, [])

  const handleRestoreSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setRestoreJson(ev.target?.result as string)
      setRestoreConfirm(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreJson) return
    try {
      await archiveStore.restore(restoreJson)
      await loadEntries()
    } catch {
      // silent
    }
    setRestoreConfirm(false)
    setRestoreJson(null)
  }, [restoreJson, loadEntries])

  const deleteTarget = useMemo(
    () => entries.find((e) => e.id === deleteConfirmId),
    [entries, deleteConfirmId],
  )

  return (
    <div className="glass" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexShrink: 0 }}>
        {(['archive', 'dashboard'] as const).map((tab) => (
          <motion.button
            key={tab}
            variants={tabVariants}
            animate={activeTab === tab ? 'active' : 'inactive'}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '1rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === tab
                ? 'linear-gradient(135deg, #FF8FAB, #C9A7EB)'
                : 'rgba(255, 143, 171, 0.08)',
              color: activeTab === tab ? 'white' : '#4A2040',
              transition: 'background 0.25s',
            }}
          >
            {tab === 'archive' ? t('archive') : t('dashboard')}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'archive' ? (
          <motion.div
            key="archive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {/* Toolbar: search + filter + backup/restore */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <input
                className="input-field"
                style={{ flex: '1 1 180px', minWidth: 0 }}
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="input-field"
                style={{ width: 'auto', minWidth: '110px', flexShrink: 0 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {(['all', 'paid', 'pending', 'overdue'] as const).map((s) => (
                  <option key={s} value={s}>{statusLabel(s, t)}</option>
                ))}
              </select>
              <button className="btn-secondary" style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', flexShrink: 0 }} onClick={handleBackup}>
                {t('backup')}
              </button>
              <button className="btn-secondary" style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', flexShrink: 0 }} onClick={() => fileInputRef.current?.click()}>
                {t('restore')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleRestoreSelect}
              />
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#C9A7EB', fontWeight: 600 }}>
                  {t('loading')}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#C9A7EB',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                  }}
                >
                  {entries.length === 0 ? t('noInvoices') : t('noResults')}
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((entry) => (
                      <motion.div
                        key={entry.id}
                        layout
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                        className="card"
                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4A2040', direction: 'ltr', textAlign: 'left' }}>
                            {entry.invoiceNumber}
                          </div>
                          <span style={statusBadgeStyle(entry.status)}>
                            {statusLabel(entry.status, t)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#4A2040' }}>{entry.buyerName}</div>

                        <div style={{ fontSize: '0.75rem', color: '#C9A7EB' }}>
                          {format(new Date(entry.createdAt), 'yyyy/MM/dd')}
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FF8FAB', marginTop: 'auto' }}>
                          {formatNumber(entry.total)} {currencyLabel(entry.currency, t)}
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                          <button
                            className="btn-primary"
                            style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleView(entry)}
                          >
                            {t('view')}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleDuplicate(entry)}
                          >
                            {t('duplicate')}
                          </button>
                          <button
                            style={{
                              flex: 1,
                              padding: '0.4rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: '1rem',
                              border: '1px solid rgba(255, 45, 95, 0.3)',
                              background: 'rgba(255, 45, 95, 0.08)',
                              color: '#FF2D5F',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onClick={() => setDeleteConfirmId(entry.id)}
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
          >
            {/* Mini stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                {
                  label: t('thisMonthIncome'),
                  value: formatNumber(dashboard.thisMonthIncome),
                  sub: t('toman'),
                  gradient: 'linear-gradient(135deg, #FF8FAB, #FFB6C1)',
                },
                {
                  label: t('unpaidInvoices'),
                  value: formatNumber(dashboard.unpaidCount),
                  sub: t('invoiceLabel'),
                  gradient: 'linear-gradient(135deg, #FBBF24, #FDE68A)',
                },
                {
                  label: t('totalInvoicesCount'),
                  value: formatNumber(dashboard.totalCount),
                  sub: t('invoiceLabel'),
                  gradient: 'linear-gradient(135deg, #C9A7EB, #E0CFF7)',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    borderTop: '3px solid transparent',
                    borderImage: stat.gradient,
                    borderImageSlice: 1,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#4A2040', opacity: 0.7 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4A2040' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#C9A7EB' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: '#4A2040' }}>
                {t('recentMonthsIncome')}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px' }}>
                {dashboard.monthlyTotals.map((m) => {
                  const height = (m.total / maxMonthly) * 100
                  return (
                    <div
                      key={`${m.year}-${m.month}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FF8FAB', marginBottom: '0.25rem', lineHeight: 1.2, textAlign: 'center' }}>
                        {formatNumber(m.total)}
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 2)}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.05 }}
                        style={{
                          width: '100%',
                          maxWidth: '48px',
                          borderRadius: '0.5rem 0.5rem 0 0',
                          background: 'linear-gradient(180deg, #FF8FAB, #FFC2D1)',
                          minHeight: '4px',
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', color: '#4A2040', marginTop: '0.35rem', fontWeight: 500, textAlign: 'center' }}>
                        {m.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('deleteInvoiceRecord')}
      >
        <p style={{ margin: '0.5rem 0 1.25rem', lineHeight: 1.8, color: '#4A2040' }}>
          {t('confirmDeleteInvoice')} {deleteTarget?.invoiceNumber ?? ''} ?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
            {t('cancel')}
          </button>
          <button className="btn-primary" onClick={handleDelete}>
            {t('confirm')}
          </button>
        </div>
      </Modal>

      {/* Restore confirm modal */}
      <Modal
        isOpen={restoreConfirm}
        onClose={() => { setRestoreConfirm(false); setRestoreJson(null) }}
        title={t('restoreBackup')}
      >
        <p style={{ margin: '0.5rem 0 1.25rem', lineHeight: 1.8, color: '#4A2040' }}>
          {t('restoreConfirmMessage')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => { setRestoreConfirm(false); setRestoreJson(null) }}>
            {t('cancel')}
          </button>
          <button className="btn-primary" onClick={handleRestoreConfirm}>
            {t('confirm')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
