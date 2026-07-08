import { openDB, type IDBPDatabase } from 'idb'
import type { ArchiveEntry } from '../types'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB('maddyinvoice-archive', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('invoices')) {
          const store = db.createObjectStore('invoices', { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
          store.createIndex('status', 'status')
          store.createIndex('buyerName', 'buyerName')
        }
      },
    })
  }
  return dbPromise
}

export const archiveStore = {
  async getAll(): Promise<ArchiveEntry[]> {
    const db = await getDb()
    return db.getAll('invoices')
  },

  async get(id: string): Promise<ArchiveEntry | undefined> {
    const db = await getDb()
    return db.get('invoices', id)
  },

  async save(entry: ArchiveEntry): Promise<void> {
    const db = await getDb()
    await db.put('invoices', entry)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('invoices', id)
  },

  async clear(): Promise<void> {
    const db = await getDb()
    await db.clear('invoices')
  },

  async search(query: string): Promise<ArchiveEntry[]> {
    const all = await this.getAll()
    const q = query.toLowerCase()
    return all.filter(
      (e) =>
        e.buyerName.toLowerCase().includes(q) ||
        e.invoiceNumber.toLowerCase().includes(q)
    )
  },

  async filterByStatus(status: string): Promise<ArchiveEntry[]> {
    const all = await this.getAll()
    if (!status || status === 'all') return all
    return all.filter((e) => e.status === status)
  },

  async backup(): Promise<string> {
    const all = await this.getAll()
    return JSON.stringify(all)
  },

  async restore(json: string): Promise<void> {
    const data = JSON.parse(json)
    const db = await getDb()
    const tx = db.transaction('invoices', 'readwrite')
    await Promise.all(data.map((entry: ArchiveEntry) => tx.store.put(entry)))
    await tx.done
  },
}
