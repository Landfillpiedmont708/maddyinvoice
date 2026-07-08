import React from 'react'
import type { InvoiceData } from '../../types'
import { formatNumber, numberToPersianWords, formatCardNumber, formatIBAN, detectBank } from '../../utils/persian'
import { calcSubtotal, calcGlobalDiscount, calcGrandTotal } from '../../utils/helpers'

interface Props {
  invoice: InvoiceData
  scale?: number
  className?: string
}

export function TemplateRenderer({ invoice, scale = 1, className = '' }: Props) {
  const subtotal = calcSubtotal(invoice.items)
  const discountVal = calcGlobalDiscount(subtotal, invoice.globalDiscount)
  const grandTotal = calcGrandTotal(invoice.items, invoice.globalDiscount, invoice.vatRate, invoice.shippingCost)
  const afterDiscount = subtotal - discountVal
  const vatAmount = (afterDiscount * invoice.vatRate) / 100
  const bank = detectBank(invoice.payment.cardNumber)

  const baseStyle: React.CSSProperties = {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    fontSize: 12,
    lineHeight: 1.8,
    color: '#333',
    position: 'relative',
    overflow: 'hidden',
  }

  const renderByTemplate = () => {
    switch (invoice.templateId) {
      case 'blossom':
        return renderBlossom()
      case 'rose-gold':
        return renderRoseGold()
      case 'dark-elegance':
        return renderDarkElegance()
      default:
        return renderDefault()
    }
  }

  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: invoice.templateId === 'dark-elegance' ? '#FF8FAB' : '#4A2040' }}>
          {invoice.documentType === 'official' ? 'فاکتور رسمی' :
           invoice.documentType === 'proforma' ? 'پیش‌فاکتور' :
           invoice.documentType === 'receipt' ? 'رسید' : 'صورت‌حساب'}
        </h2>
        <p style={{ margin: '4px 0', fontSize: 11, color: '#888' }}>
          شماره: {invoice.invoiceNumber || '---'}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        {invoice.seller.logo && (
          <img src={invoice.seller.logo} alt="logo" style={{ height: 50, maxWidth: 120, objectFit: 'contain' }} />
        )}
      </div>
    </div>
  )

  const renderSellerInfo = () => (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: '#4A2040' }}>{invoice.seller.name || '---'}</h3>
      <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
        {invoice.seller.phone && `تلفن: ${invoice.seller.phone}  |  `}
        {invoice.seller.email && `${invoice.seller.email}`}
      </p>
      {invoice.seller.address && <p style={{ margin: 0, fontSize: 11, color: '#666' }}>{invoice.seller.address}</p>}
    </div>
  )

  const renderBuyerInfo = () => (
    <div style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8 }}>
      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>خریدار:</p>
      <p style={{ margin: 0, fontWeight: 600 }}>{invoice.buyer.name || invoice.buyer.company || '---'}</p>
      {invoice.buyer.phone && <p style={{ margin: 0, fontSize: 11, color: '#666' }}>تلفن: {invoice.buyer.phone}</p>}
      {invoice.buyer.address && <p style={{ margin: 0, fontSize: 11, color: '#666' }}>{invoice.buyer.address}</p>}
      {invoice.buyer.nationalCode && <p style={{ margin: 0, fontSize: 11, color: '#666' }}>کد ملی: {invoice.buyer.nationalCode}</p>}
    </div>
  )

  const renderItems = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 11 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #FF8FAB', background: '#FFF5F7' }}>
          <th style={{ padding: '6px 8px', textAlign: 'right' }}>ردیف</th>
          <th style={{ padding: '6px 8px', textAlign: 'right' }}>شرح</th>
          <th style={{ padding: '6px 8px', textAlign: 'center' }}>تعداد</th>
          <th style={{ padding: '6px 8px', textAlign: 'center' }}>واحد</th>
          <th style={{ padding: '6px 8px', textAlign: 'left' }}>قیمت واحد</th>
          <th style={{ padding: '6px 8px', textAlign: 'left' }}>تخفیف</th>
          <th style={{ padding: '6px 8px', textAlign: 'left' }}>مجموع</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item, idx) => {
          const itemTotal = item.quantity * item.unitPrice - item.discount
          return (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatNumber(idx + 1)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{item.description || '---'}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center' }}>{formatNumber(item.quantity)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.unit}</td>
              <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(item.unitPrice)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(item.discount)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(itemTotal)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  const renderTotals = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <table style={{ width: '50%', fontSize: 11 }}>
        <tbody>
          <tr><td style={{ padding: '4px 8px', textAlign: 'left' }}>زیرمجموع</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>{formatNumber(subtotal)}</td></tr>
          {discountVal > 0 && (
            <tr><td style={{ padding: '4px 8px', textAlign: 'left' }}>تخفیف ({invoice.globalDiscount.type === 'percent' ? '%' : ''})</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>({formatNumber(discountVal)})</td></tr>
          )}
          {vatAmount > 0 && (
            <tr><td style={{ padding: '4px 8px', textAlign: 'left' }}>مالیات ({invoice.vatRate}%)</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>{formatNumber(vatAmount)}</td></tr>
          )}
          {invoice.shippingCost > 0 && (
            <tr><td style={{ padding: '4px 8px', textAlign: 'left' }}>حمل</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>{formatNumber(invoice.shippingCost)}</td></tr>
          )}
          <tr style={{ borderTop: '2px solid #FF8FAB', fontWeight: 700 }}>
            <td style={{ padding: '8px', textAlign: 'left' }}>جمع کل</td>
            <td style={{ padding: '8px', textAlign: 'left' }}>{formatNumber(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  const renderPayment = () => (
    <div style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8, fontSize: 11 }}>
      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>اطلاعات پرداخت:</p>
      {invoice.payment.cardNumber && (
        <p style={{ margin: 0 }}>شماره کارت: {formatCardNumber(invoice.payment.cardNumber)} {bank && <span>({bank.name})</span>}</p>
      )}
      {invoice.payment.iban && <p style={{ margin: 0 }}>شماره شبا: {formatIBAN(invoice.payment.iban)}</p>}
      {invoice.payment.bankName && <p style={{ margin: 0 }}>بانک: {invoice.payment.bankName}</p>}
    </div>
  )

  const renderBlossom = () => (
    <div style={{
      ...baseStyle,
      background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE4EC 50%, #FFF0F5 100%)',
      border: '3px solid #FFC2D1',
      borderRadius: 12,
      padding: 24,
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 6,
        background: 'linear-gradient(90deg, #FF8FAB, #C9A7EB, #FF8FAB)',
      }} />
      {renderHeader()}
      {renderSellerInfo()}
      {renderBuyerInfo()}
      {renderItems()}
      {renderTotals()}
      <div style={{ fontSize: 11, color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
        {numberToPersianWords(grandTotal)} {invoice.currency === 'toman' ? 'تومان' : invoice.currency === 'rial' ? 'ریال' : ''}
      </div>
      {invoice.notes && <div style={{ marginTop: 12, fontSize: 11, color: '#666' }}>{invoice.notes}</div>}
      {invoice.thankYouMessage && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#FF8FAB', textAlign: 'center', fontWeight: 700 }}>
          {invoice.thankYouMessage}
        </div>
      )}
      {invoice.status === 'paid' && <StatusStamp color="#22c55e" text="پرداخت شد" />}
      {invoice.status === 'overdue' && <StatusStamp color="#ef4444" text="پرداخت نشده" />}
    </div>
  )

  const renderRoseGold = () => (
    <div style={{
      ...baseStyle,
      background: '#FFFFFF',
      border: '2px solid #FFD700',
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#B8860B', letterSpacing: 2, fontFamily: 'serif' }}>
          {invoice.seller.name || 'INVOICE'}
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', margin: '8px 0' }} />
      </div>
      {renderBuyerInfo()}
      {renderItems()}
      {renderTotals()}
      {renderPayment()}
      {invoice.thankYouMessage && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#B8860B', textAlign: 'center' }}>{invoice.thankYouMessage}</div>
      )}
    </div>
  )

  const renderDarkElegance = () => (
    <div style={{
      ...baseStyle,
      background: 'linear-gradient(135deg, #1A0D14 0%, #2D1522 50%, #1A0D14 100%)',
      border: '1px solid #FF2D95',
      borderRadius: 12,
      padding: 24,
      color: '#FFC2D1',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        background: 'linear-gradient(90deg, transparent, #FF2D95, #FF8FAB, #FF2D95, transparent)',
        boxShadow: '0 0 20px rgba(255, 45, 149, 0.5)',
      }} />
      {renderHeader()}
      {renderSellerInfo()}
      {renderBuyerInfo()}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #FF2D95' }}>
            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#FF8FAB' }}>ردیف</th>
            <th style={{ padding: '6px 8px', textAlign: 'right', color: '#FF8FAB' }}>شرح</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#FF8FAB' }}>تعداد</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#FF8FAB' }}>واحد</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#FF8FAB' }}>قیمت واحد</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#FF8FAB' }}>تخفیف</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#FF8FAB' }}>مجموع</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => {
            const itemTotal = item.quantity * item.unitPrice - item.discount
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,45,149,0.2)' }}>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{formatNumber(idx + 1)}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{item.description || '---'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{formatNumber(item.quantity)}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.unit}</td>
                <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(item.unitPrice)}</td>
                <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(item.discount)}</td>
                <td style={{ padding: '6px 8px', textAlign: 'left' }}>{formatNumber(itemTotal)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <table style={{ width: '50%', fontSize: 11 }}>
          <tbody>
            <tr><td style={{ padding: '4px 8px', textAlign: 'left', color: '#FFC2D1' }}>زیرمجموع</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>{formatNumber(subtotal)}</td></tr>
            {discountVal > 0 && <tr><td style={{ padding: '4px 8px', textAlign: 'left', color: '#FFC2D1' }}>تخفیف</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>({formatNumber(discountVal)})</td></tr>}
            {vatAmount > 0 && <tr><td style={{ padding: '4px 8px', textAlign: 'left', color: '#FFC2D1' }}>مالیات</td><td style={{ padding: '4px 8px', textAlign: 'left' }}>{formatNumber(vatAmount)}</td></tr>}
            <tr style={{ borderTop: '2px solid #FF2D95', fontWeight: 700 }}>
              <td style={{ padding: '8px', textAlign: 'left', color: '#FF8FAB' }}>جمع کل</td>
              <td style={{ padding: '8px', textAlign: 'left', color: '#FF8FAB' }}>{formatNumber(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: '#FF8FAB', textAlign: 'center' }}>
        {numberToPersianWords(grandTotal)} {invoice.currency === 'toman' ? 'تومان' : ''}
      </div>
      {invoice.thankYouMessage && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#FF2D95', textAlign: 'center' }}>{invoice.thankYouMessage}</div>
      )}
      {invoice.status === 'paid' && <StatusStamp color="#FF2D95" text="پرداخت شد" />}
    </div>
  )

  const renderDefault = () => (
    <div style={{
      ...baseStyle,
      background: '#FFFFFF',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 24,
    }}>
      {renderHeader()}
      {renderSellerInfo()}
      {renderBuyerInfo()}
      {renderItems()}
      {renderTotals()}
      {renderPayment()}
      <div style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>
        {numberToPersianWords(grandTotal)} {invoice.currency === 'toman' ? 'تومان' : ''}
      </div>
      {invoice.notes && <div style={{ marginTop: 12, fontSize: 11, color: '#666' }}>{invoice.notes}</div>}
      {invoice.thankYouMessage && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#4A2040', textAlign: 'center', fontWeight: 700 }}>
          {invoice.thankYouMessage}
        </div>
      )}
    </div>
  )

  return (
    <div
      className={className}
      style={{
        width: 794 * scale,
        minHeight: 1123 * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      {renderByTemplate()}
    </div>
  )
}

function StatusStamp({ color, text }: { color: string; text: string }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: 40,
      transform: 'rotate(-15deg)',
      border: `3px solid ${color}`,
      color,
      padding: '8px 24px',
      borderRadius: 4,
      fontSize: 18,
      fontWeight: 800,
      opacity: 0.6,
      pointerEvents: 'none',
    }}>
      {text}
    </div>
  )
}
