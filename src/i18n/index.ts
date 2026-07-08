import { useInvoiceStore } from '../stores/invoiceStore'
import { fa } from './fa'
import { en } from './en'
import { de } from './de'
import { ar } from './ar'
import { ru } from './ru'
import { fr } from './fr'

export type Lang = 'fa' | 'en' | 'de' | 'ar' | 'ru' | 'fr'

const translations: Record<Lang, Record<string, any>> = {
  fa, en, de, ar, ru, fr,
}

export const rtlLangs: Record<Lang, boolean> = {
  fa: true, ar: true, en: false, de: false, ru: false, fr: false,
}

export function isRTL(lang: Lang): boolean {
  return rtlLangs[lang] ?? false
}

function resolve(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path
}

export function t(key: string): string {
  const lang = useInvoiceStore.getState().settings.language as Lang
  const dict = translations[lang] ?? fa
  return resolve(dict, key) || resolve(fa, key) || key
}

export function useT(): (key: string) => string {
  const lang = useInvoiceStore((s) => s.settings.language) as Lang
  return (key: string) => {
    const dict = translations[lang] ?? fa
    return resolve(dict, key) || resolve(fa, key) || key
  }
}

export { fa, en, de, ar, ru, fr }
