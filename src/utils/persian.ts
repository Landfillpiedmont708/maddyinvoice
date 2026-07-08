const persianDigits: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

export function toPersianNumber(n: number | string): string {
  return String(n).replace(/[0-9]/g, d => persianDigits[d] || d)
}

export function toEnglishNumber(s: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹'
  return s.replace(/[۰-۹]/g, d => String(persian.indexOf(d)))
}

export function formatNumber(n: number): string {
  return toPersianNumber(n.toLocaleString('en-US'))
}

const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه']
const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده']

function convertGroup(n: number): string {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  let result = ''
  if (h > 0) result += hundreds[h] + ' '
  if (t === 1) result += teens[o] + ' '
  else {
    if (t > 0) result += tens[t] + ' '
    if (o > 0) result += ones[o] + ' '
  }
  return result.trim()
}

export function numberToPersianWords(n: number): string {
  if (n === 0) return 'صفر'
  const groups: [number, string][] = [
    [1_000_000_000, 'میلیارد'],
    [1_000_000, 'میلیون'],
    [1_000, 'هزار'],
  ]
  let remaining = Math.floor(n)
  let result = ''
  for (const [divisor, label] of groups) {
    if (remaining >= divisor) {
      const g = Math.floor(remaining / divisor)
      result += convertGroup(g) + ' ' + label + ' '
      remaining %= divisor
    }
  }
  if (remaining > 0) result += convertGroup(remaining) + ' '
  return result.trim()
}

export function numberToWords(n: number, currency: string): string {
  const words = numberToPersianWords(n)
  if (currency === 'toman') return words + ' تومان'
  if (currency === 'rial') return words + ' ریال'
  return words
}

const bankPrefixes: Record<string, { name: string; nameEn: string }> = {
  '603799': { name: 'بانک ملی', nameEn: 'Melli' },
  '589210': { name: 'بانک سپه', nameEn: 'Sepah' },
  '627648': { name: 'بانک اقتصاد نوین', nameEn: 'Eghtesad Novin' },
  '627961': { name: 'بانک صادرات', nameEn: 'Saderat' },
  '603770': { name: 'بانک کشاورزی', nameEn: 'Keshavarzi' },
  '628023': { name: 'بانک مسکن', nameEn: 'Maskan' },
  '627760': { name: 'بانک پست بانک', nameEn: 'Post Bank' },
  '502908': { name: 'بانک توسعه تعاون', nameEn: 'Tose\'e Ta\'avon' },
  '627412': { name: 'بانک اقتصاد نوین', nameEn: 'Eghtesad Novin' },
  '622106': { name: 'بانک پارسیان', nameEn: 'Parsian' },
  '502229': { name: 'بانک پارسیان', nameEn: 'Parsian' },
  '627488': { name: 'بانک کارآفرین', nameEn: 'Karafarin' },
  '621986': { name: 'بانک سامان', nameEn: 'Saman' },
  '639346': { name: 'بانک سینا', nameEn: 'Sina' },
  '639607': { name: 'بانک سرمایه', nameEn: 'Sarmayeh' },
  '502806': { name: 'بانک شهر', nameEn: 'Shahr' },
  '502938': { name: 'بانک دی', nameEn: 'Day' },
  '639599': { name: 'بانک قوامین', nameEn: 'Ghavamin' },
  '606373': { name: 'بانک مهر ایران', nameEn: 'Mehr Iran' },
  '505416': { name: 'بانک گردشگری', nameEn: 'Tourism Bank' },
  '636949': { name: 'بانک حکمت ایرانیان', nameEn: 'Hekmat Iranian' },
  '585983': { name: 'بانک تجارت', nameEn: 'Tejarat' },
  '639217': { name: 'بانک آینده', nameEn: 'Ayandeh' },
  '627884': { name: 'بانک رفاه', nameEn: 'Refah' },
}

export function detectBank(cardNumber: string): { name: string; nameEn: string } | null {
  const cleaned = cardNumber.replace(/\s|-/g, '')
  for (const [prefix, info] of Object.entries(bankPrefixes)) {
    if (cleaned.startsWith(prefix)) return info
  }
  return null
}

export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s|-/g, '').slice(0, 16)
  const groups = cleaned.match(/.{1,4}/g)
  return groups ? groups.join(' - ') : ''
}

export function formatIBAN(value: string): string {
  const cleaned = value.replace(/\s|-/g, '').toUpperCase().slice(0, 26)
  const groups = cleaned.match(/.{1,4}/g)
  return groups ? groups.join(' - ') : ''
}
