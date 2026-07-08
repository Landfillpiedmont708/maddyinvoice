import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useT } from '../../i18n'
import { calcItemTotal } from '../../utils/helpers'
import { formatNumber } from '../../utils/persian'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const

const units = ['عدد', 'ساعت', 'پروژه', 'متر', 'کیلوگرم', 'بسته', 'خدمت', 'روز', 'ماه'] as const

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#4A2040',
  display: 'block',
  marginBottom: '0.25rem',
  textAlign: 'right',
}

export function ItemsForm() {
  const t = useT()
  const invoice = useInvoiceStore((s) => s.invoice)
  const addItem = useInvoiceStore((s) => s.addItem)
  const removeItem = useInvoiceStore((s) => s.removeItem)
  const updateItem = useInvoiceStore((s) => s.updateItem)
  const setItems = useInvoiceStore((s) => s.setItems)
  const setGlobalDiscount = useInvoiceStore((s) => s.setGlobalDiscount)
  const setInvoice = useInvoiceStore((s) => s.setInvoice)
  const { items, globalDiscount, vatRate, shippingCost } = invoice

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(items)
    const [removed] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, removed)
    setItems(reordered)
  }

  return (
    <motion.div className="glass" style={{ padding: '1.5rem' }} variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={fadeUp}
        style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#4A2040', textAlign: 'right' }}
      >
        {t('items')}
      </motion.h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, index) => {
                const itemTotal = calcItemTotal(item)
                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        variants={fadeUp}
                        style={{
                          ...provided.draggableProps.style,
                          background: snapshot.isDragging
                            ? 'rgba(255,143,171,0.12)'
                            : 'rgba(255,143,171,0.04)',
                          borderRadius: '1rem',
                          padding: '0.75rem',
                          border: '1px solid rgba(255,143,171,0.1)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              cursor: 'grab',
                              color: '#C9A7EB',
                              fontSize: '1.2rem',
                              paddingTop: '1.5rem',
                              userSelect: 'none',
                              flexShrink: 0,
                            }}
                          >
                            ⠿
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={labelStyle}>{t('description')}</label>
                                <input
                                  className="input-field"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                  style={{ direction: 'rtl', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>{t('quantity')}</label>
                                <input
                                  className="input-field"
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: Math.max(0, Number(e.target.value)) })}
                                  style={{ direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={labelStyle}>{t('unit')}</label>
                                <select
                                  className="input-field"
                                  value={item.unit}
                                  onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                                  style={{ direction: 'rtl', fontSize: '0.85rem' }}
                                >
                                  {units.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label style={labelStyle}>{t('unitPrice')}</label>
                                <input
                                  className="input-field"
                                  type="number"
                                  min="0"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                                  style={{ direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>{t('discount')}</label>
                                <input
                                  className="input-field"
                                  type="number"
                                  min="0"
                                  value={item.discount}
                                  onChange={(e) => updateItem(item.id, { discount: Math.max(0, Number(e.target.value)) })}
                                  style={{ direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                style={{
                                  background: 'rgba(255,45,149,0.1)',
                                  border: 'none',
                                  borderRadius: '0.75rem',
                                  padding: '0.35rem 0.8rem',
                                  cursor: 'pointer',
                                  color: '#FF2D95',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {t('removeItem')}
                              </button>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A2040' }}>
                                {t('total')}: {formatNumber(itemTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <motion.button
        type="button"
        className="btn-secondary"
        onClick={addItem}
        variants={fadeUp}
        style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.85rem' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        + {t('addItem')}
      </motion.button>

      <motion.div variants={fadeUp} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('globalDiscount')}</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <select
                className="input-field"
                value={globalDiscount.type}
                onChange={(e) => setGlobalDiscount({ ...globalDiscount, type: e.target.value as 'percent' | 'fixed' })}
                style={{ flex: 1, direction: 'rtl', fontSize: '0.85rem' }}
              >
                <option value="percent">%</option>
                <option value="fixed">{invoice.currency === 'toman' || invoice.currency === 'rial' ? t('toman') : invoice.currency.toUpperCase()}</option>
              </select>
              <input
                className="input-field"
                type="number"
                min="0"
                value={globalDiscount.value}
                onChange={(e) => setGlobalDiscount({ ...globalDiscount, value: Math.max(0, Number(e.target.value)) })}
                style={{ flex: 2, direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('vat')} (%)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            max="100"
            value={vatRate}
            onChange={(e) => setInvoice({ vatRate: Math.max(0, Number(e.target.value)) })}
            style={{ direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
          />
        </div>

        <div>
          <label style={labelStyle}>{t('shipping')}</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={shippingCost}
            onChange={(e) => setInvoice({ shippingCost: Math.max(0, Number(e.target.value)) })}
            style={{ direction: 'ltr', fontSize: '0.85rem', textAlign: 'right' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
