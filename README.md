# 🌸 maddyInvoice

> **A beautiful, privacy-first Persian (Farsi) invoice generator — fully client-side, no backend, no signup.**

---

## ✨ Features

### 🧾 Invoice Management
- **Seller Profile** — Logo upload, contact info, social links, national/economic codes
- **Customer Book** — Save repeat customers for quick selection
- **Line Items** — Drag-and-drop reordering, quantity/unit/price/discount, item presets
- **Auto Calculations** — Subtotal, global discount (percent or fixed), VAT, shipping, grand total
- **Persian Words** — Grand total shown in Persian script (e.g. «سه میلیون و پانصد هزار تومان»)
- **Multi-Currency** — Toman, Rial, USD, EUR, USDT
- **Jalali Calendar** — Native Persian date picker with date-fns-jalali
- **Auto Numbering** — Custom prefix + yearly counter (e.g. MDY-1405-001)
- **Document Types** — فاکتور رسمی / پیش‌فاکتور / رسید / صورت‌حساب
- **Status Stamps** — Paid / Pending / Overdue with decorative rotated overlay
- **Payment Info** — Card number (auto-format + bank detection via prefix), IBAN, payment link
- **QR Code** — Auto-generated for card/payment info
- **Signature Pad** — Draw with mouse/touch, or upload image
- **Bilingual Mode** — Persian/English side-by-side for foreign clients

### 🎨 12 Professional Templates

| # | Template | Style |
|---|----------|-------|
| 1 | **Blossom** 🌸 | Pink pastel with delicate floral border |
| 2 | **Rose Gold** 🌹 | Luxury gold lines and accents |
| 3 | **Lavender Dream** 💜 | Soft purple tones |
| 4 | **Minimal Chic** ✨ | Clean white with pink accents |
| 5 | **Marble Luxe** 🏛️ | Marble-textured elegance |
| 6 | **Pastel Wave** 🌈 | Colorful pastel gradients |
| 7 | **Classic Formal** 📋 | Grayscale corporate style |
| 8 | **Dark Elegance** 🌙 | Dark theme with neon pink |
| 9 | **Botanical** 🌿 | Watercolor leaf motifs |
| 10 | **Geometric** 🔷 | Modern geometric patterns |
| 11 | **Vintage Paper** 📜 | Aged paper aesthetic |
| 12 | **Gradient Pop** 🎨 | Bold gradient backgrounds |

### 📤 Export Options
- **PDF** (A4/A5) — Perfect Persian text rendering via DOM→Image→PDF pipeline
- **PNG** (2× / 3× resolution)
- **Copy to Clipboard** — Instant image sharing
- **Print** — Dedicated print styles
- **Share Link** — Entire invoice compressed into URL hash (zero-server sharing)
- **JSON** — Backup and restore

### 📂 Archive & Dashboard
- **IndexedDB Archive** — Full offline storage
- **Search & Filter** — By buyer name, invoice number, or status
- **Mini Dashboard** — Monthly income chart, unpaid invoice count
- **Full Backup/Restore** — Export/import all data as JSON

### 🌐 Multi-Language Support
- فارسی (Persian) — RTL
- English — LTR
- Deutsch (German) — LTR
- العربية (Arabic) — RTL
- Русский (Russian) — LTR
- Français (French) — LTR

### 🎀 Design & UX
- **Feminine Pink Aesthetic** — Rose, powder pink, lilac color palette
- **Glassmorphism** — Frosted glass cards with pink-tinted shadows
- **Framer Motion** — Smooth 60fps animations, staggered list entrances
- **Dark Mode** — Deep plum and neon pink dark theme
- **Responsive** — Desktop split-view, tablet tabs, mobile wizard
- **Onboarding Tour** — 4-step cute guide for first-time visitors
- **Keyboard Shortcuts** — Ctrl+S (save), Ctrl+P (export), Ctrl+Z (undo)
- **Undo/Redo** — Full history stack
- **Confetti** 🎉 — Celebratory burst on successful export

### 🔒 Privacy & Offline
- **100% Client-Side** — Zero server requests, no data leaves your browser
- **PWA** — Installable, works fully offline
- **No Signup Required** — Just open and use

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### 📦 Download Fonts

Download the following WOFF2 font files and place them in `public/fonts/`:

- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) (default, all weights)
- Shabnam, Sahel, Lalezar (optional alternatives)

The app works without them (falls back to system fonts), but for best Persian text rendering, especially in PDF exports, install them.

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Animation** | Framer Motion |
| **State** | Zustand (with persist middleware) |
| **Calendar** | date-fns-jalali |
| **PDF** | html-to-image + jsPDF |
| **QR Code** | qrcode.react |
| **Compression** | lz-string (share links) |
| **Storage** | IndexedDB (idb) + localStorage |
| **PWA** | vite-plugin-pwa |
| **Drag & Drop** | @hello-pangea/dnd |

---

## 🏗 Project Structure

```
src/
├── types/          — TypeScript interfaces (Invoice, LineItem, Customer, etc.)
├── utils/          — Persian number utils, bank detector, calculation helpers
├── i18n/           — Translation files (fa, en, de, ar, ru, fr)
├── stores/         — Zustand stores (invoice, archive)
├── components/
│   ├── Form/       — Invoice form sections (seller, buyer, items, payment, meta)
│   ├── Preview/    — Live A4 preview with zoom and template carousel
│   ├── Templates/  — 12 template renderers
│   ├── Export/     — PDF/PNG/clipboard/print/share export panel
│   ├── Archive/    — Invoice archive and dashboard
│   └── UI/         — Shared UI components (Toast, Modal, SignaturePad, etc.)
└── App.tsx         — Main app with responsive layout
```

---

## 🔗 Share Invoices

Generate a shareable link that encodes the entire invoice in the URL hash using lz-string compression. The recipient opens the link and sees the exact same invoice — no server required.

---

## 📄 License

MIT © [Maddyrampant](https://github.com/Maddyrampant)

---

<div align="center">
  Made with 💖 for the Persian-speaking community
</div>
