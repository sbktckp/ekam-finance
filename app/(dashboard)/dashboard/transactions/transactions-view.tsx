'use client'

import { useState, useTransition, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Plus, Pencil, Trash2, X, AlertTriangle, SlidersHorizontal, StickyNote } from 'lucide-react'
import { deleteTransaction, updateTransaction } from '@/app/actions/transactions'
import { AddTransactionModal } from '@/components/modals/add-transaction-modal'
import { AddAccountModal }     from '@/components/modals/add-account-modal'
import { formatCurrency, cn }  from '@/lib/utils'
import { PageHero } from '@/components/shared/page-hero'

type Account  = { id: string; name: string; color: string; type: string; currency: string; balance: number }
type Category = { id: string; name: string; icon: string; color: string; type: string }
type Txn      = {
  id: string; date: string; merchant: string | null; note: string | null
  type: string; amount: number; amount_in_base: number; currency: string
  category_id: string | null; account_id: string | null
}

const DARK = { bg: '#1c1c1e', border: 'rgba(255,255,255,0.10)', input: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.13)', text: 'rgba(255,255,255,0.88)', label: 'rgba(255,255,255,0.38)' }

/** Panel tokens shared by the filter bar and the ledger, matching accounts. */
const PANEL = { bg: '#0d1017', border: 'rgba(148,163,184,0.13)', divider: 'rgba(148,163,184,0.07)', muted: 'rgba(148,163,184,0.75)' }

/** "2026-08" -> "August 2026" */
function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// ─── Edit modal (income + expense) ─────────────────────────────────────────────
function EditModal({ txn, categories, open, onClose, onSuccess }: {
  txn: Txn; categories: Category[]; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selCat, setSelCat] = useState(txn.category_id ?? '')

  const isIncome = txn.type === 'income'
  const relevantCats = categories.filter(c => c.type === txn.type || c.type === 'both')

  function handleSubmit(fd: FormData) {
    fd.set('category_id', selCat)
    setError(null)
    startTransition(async () => {
      const res = await updateTransaction(txn.id, fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl" style={{ background: DARK.bg, border: `1px solid ${DARK.border}` }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${DARK.border}` }}>
          <h2 className="text-sm font-bold" style={{ color: DARK.text }}>Edit {isIncome ? 'Income' : 'Expense'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Amount</label>
            <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={txn.amount_in_base}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: DARK.input, border: `1px solid ${DARK.inputBorder}`, color: DARK.text }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>{isIncome ? 'Source' : 'Merchant'}</label>
            <input name="merchant" type="text" maxLength={100} required defaultValue={txn.merchant ?? ''} placeholder={isIncome ? 'e.g. Salary...' : 'e.g. Swiggy, Landlord...'}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: DARK.input, border: `1px solid ${DARK.inputBorder}`, color: DARK.text }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Note <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span></label>
            <input name="note" type="text" maxLength={100} defaultValue={txn.note ?? ''} placeholder={isIncome ? 'e.g. Q3 bonus' : 'e.g. team lunch after sprint demo'}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: DARK.input, border: `1px solid ${DARK.inputBorder}`, color: DARK.text }} />
          </div>
          {relevantCats.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Category</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-0.5">
                {relevantCats.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setSelCat(cat.id === selCat ? '' : cat.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all"
                    style={{ border: selCat === cat.id ? '1px solid #34d399' : `1px solid ${DARK.inputBorder}`, background: selCat === cat.id ? 'rgba(52,211,153,0.10)' : DARK.input }}>
                    <span className="text-lg leading-none">{cat.icon}</span>
                    <span className="text-[10px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.65)' }}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Date</label>
            <input name="date" type="date" required defaultValue={txn.date}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all"
              style={{ background: DARK.input, border: `1px solid ${DARK.inputBorder}`, color: DARK.text }} />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}
          <button type="submit" disabled={isPending} className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: isIncome ? '#10b981' : '#f43f5e', color: isIncome ? '#000' : '#fff' }}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirmation ───────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, isPending }: {
  open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl p-6 max-w-sm w-full" style={{ background: DARK.bg, border: `1px solid ${DARK.border}` }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: DARK.text }}>Delete transaction?</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Reverses the account balance. Cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${DARK.inputBorder}`, color: 'rgba(255,255,255,0.65)' }}>Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────
interface Props {
  transactions: Txn[]
  accounts:     Account[]
  categories:   Category[]
  budgetByCategory: Record<string, number>
  spentByCategory:  Record<string, number>
  /** "YYYY-MM" for today. The ledger opens on this month by default. */
  currentMonth: string
}

export function TransactionsView({ transactions, accounts, categories, budgetByCategory, spentByCategory, currentMonth }: Props) {
  const router = useRouter()
  const [txnOpen, setTxnOpen]  = useState(false)
  const [accOpen, setAccOpen]  = useState(false)
  const [editTxn, setEditTxn]  = useState<Txn | null>(null)
  const [delTxn,  setDelTxn]   = useState<Txn | null>(null)
  const [isDeleting, startDel] = useTransition()
  const ledgerRef = useRef<HTMLDivElement>(null)

  // ── Filters ────────────────────────────────────────────────────────────────
  // The month defaults to the current one so the header totals describe "this
  // month" rather than an arbitrary slice of history.
  const [showFilters,  setShowFilters]  = useState(false)
  const [fType,        setFType]        = useState<'all' | 'income' | 'expense'>('all')
  const [fCategoryId,  setFCategoryId]  = useState('')
  const [fMonth,       setFMonth]       = useState(currentMonth)
  const [fAmountMin,   setFAmountMin]   = useState('')
  const [fAmountMax,   setFAmountMax]   = useState('')

  // Build month options from available transaction dates
  const monthOptions = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.substring(0, 7)))
    months.add(currentMonth)
    return Array.from(months).sort().reverse().map(m => ({ value: m, label: monthLabel(m) }))
  }, [transactions, currentMonth])

  const filtered = useMemo(() => transactions.filter(t => {
    if (fType !== 'all' && t.type !== fType) return false
    if (fCategoryId && t.category_id !== fCategoryId) return false
    if (fMonth && !t.date.startsWith(fMonth)) return false
    if (fAmountMin && Number(t.amount_in_base) < Number(fAmountMin)) return false
    if (fAmountMax && Number(t.amount_in_base) > Number(fAmountMax)) return false
    return true
  }), [transactions, fType, fCategoryId, fMonth, fAmountMin, fAmountMax])

  // Totals reflect the current filter, so the hero always describes what you see.
  const totals = useMemo(() => {
    let income = 0, expense = 0
    filtered.forEach(t => {
      const v = Number(t.amount_in_base)
      if (t.type === 'income') income += v
      else if (t.type === 'expense') expense += v
    })
    return { income, expense, net: income - expense }
  }, [filtered])

  // The default month is not a "filter" the user applied, so it doesn't count
  // toward the badge — otherwise the page would always look pre-filtered.
  const activeFilters = [
    fType !== 'all',
    !!fCategoryId,
    fMonth !== currentMonth,
    !!fAmountMin,
    !!fAmountMax,
  ].filter(Boolean).length

  function clearFilters() {
    setFType('all'); setFCategoryId(''); setFMonth(currentMonth); setFAmountMin(''); setFAmountMax('')
  }

  function handleDelete() {
    if (!delTxn) return
    startDel(async () => { await deleteTransaction(delTxn.id); setDelTxn(null); router.refresh() })
  }

  // Rows fade in on first paint and whenever the filter result changes.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !ledgerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-txn-row]', {
        opacity: 0, y: 10, duration: 0.35, ease: 'power2.out', stagger: 0.02, overwrite: true,
      })
    }, ledgerRef)
    return () => ctx.revert()
  }, [filtered.length, fType, fCategoryId, fMonth])

  const scopeLabel = fMonth ? monthLabel(fMonth) : 'All time'

  const heroChips = (
    <div className="flex flex-wrap gap-2">
      {[
        { l: 'In',  v: totals.income,  c: '#34d399', bg: 'rgba(16,185,129,0.12)', bd: 'rgba(16,185,129,0.3)' },
        { l: 'Out', v: totals.expense, c: '#fb7185', bg: 'rgba(244,63,94,0.12)',  bd: 'rgba(244,63,94,0.28)' },
        { l: 'Net', v: totals.net,     c: totals.net >= 0 ? '#6ee7b7' : '#fb7185', bg: 'rgba(148,163,184,0.10)', bd: 'rgba(148,163,184,0.22)' },
      ].map(s => (
        <span key={s.l} className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
          style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>{s.l}</span>
          <span className="text-xs font-black" style={{ color: s.c }}>{formatCurrency(Math.round(s.v), 'INR')}</span>
        </span>
      ))}
    </div>
  )

  return (
    <>
      <div className="space-y-5">
        <PageHero
          kicker={scopeLabel}
          title={<>Every rupee,<br />accounted for.</>}
          subtitle={`${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}${activeFilters > 0 ? ' matching your filters' : ''}`}
          shape="ring"
          intensity={0.55}
          actions={
            <>
              <button onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  border: `1px solid ${showFilters ? 'rgba(52,211,153,0.45)' : 'rgba(148,163,184,0.25)'}`,
                  background: showFilters ? 'rgba(52,211,153,0.12)' : 'rgba(148,163,184,0.08)',
                  color: showFilters ? '#6ee7b7' : 'rgba(226,232,240,0.85)',
                }}>
                <SlidersHorizontal className="w-4 h-4" />
                Filter
                {activeFilters > 0 && (
                  <span className="ml-0.5 bg-emerald-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
              <button onClick={() => setAccOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(148,163,184,0.25)', color: 'rgba(226,232,240,0.85)', background: 'rgba(148,163,184,0.08)' }}>
                <Plus className="w-4 h-4" /> Account
              </button>
              <button onClick={() => setTxnOpen(true)}
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25"
                style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#04140e' }}>
                <Plus className="w-4 h-4" /> Add
              </button>
            </>
          }
        >
          {filtered.length > 0 && heroChips}
        </PageHero>

        {/* Filter bar */}
        {showFilters && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
            <div className="flex flex-wrap gap-3 items-end">
              {/* Type */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>Type</p>
                <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(148,163,184,0.10)' }}>
                  {(['all', 'income', 'expense'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setFType(t)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                      style={{
                        background: fType === t ? (t === 'income' ? 'rgba(16,185,129,0.20)' : t === 'expense' ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.12)') : 'transparent',
                        color: fType === t ? (t === 'income' ? '#34d399' : t === 'expense' ? '#f87171' : 'rgba(255,255,255,0.88)') : 'rgba(148,163,184,0.7)',
                      }}>
                      {t === 'all' ? 'All' : t === 'income' ? '+ Income' : '− Expense'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>Category</p>
                <select value={fCategoryId} onChange={e => setFCategoryId(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium focus:outline-none"
                  style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.2)', color: 'rgba(226,232,240,0.9)', minWidth: 140 }}>
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              {/* Month */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>Month</p>
                <select value={fMonth} onChange={e => setFMonth(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium focus:outline-none"
                  style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.2)', color: 'rgba(226,232,240,0.9)', minWidth: 140 }}>
                  <option value="">All time</option>
                  {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Amount range */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>Amount</p>
                <div className="flex items-center gap-1.5">
                  <input type="number" placeholder="Min" value={fAmountMin} onChange={e => setFAmountMin(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none"
                    style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.2)', color: 'rgba(226,232,240,0.9)' }} />
                  <span style={{ color: 'rgba(148,163,184,0.5)' }}>–</span>
                  <input type="number" placeholder="Max" value={fAmountMax} onChange={e => setFAmountMax(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none"
                    style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.2)', color: 'rgba(226,232,240,0.9)' }} />
                </div>
              </div>

              {activeFilters > 0 && (
                <button onClick={clearFilters} className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(148,163,184,0.8)', border: '1px solid rgba(148,163,184,0.18)' }}>
                  Reset
                </button>
              )}
            </div>
            <p style={{ color: 'rgba(148,163,184,0.55)', fontSize: '11px' }}>
              Showing {filtered.length} of {transactions.length} transactions in range
            </p>
          </div>
        )}

        {/* Ledger */}
        <div ref={ledgerRef} className="rounded-2xl overflow-hidden" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
          {filtered.length > 0 ? (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${PANEL.border}` }}>
                      <th className="text-left px-3 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: PANEL.muted }}>Date</th>
                      <th className="text-left px-3 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: PANEL.muted }}>Description</th>
                      <th className="text-left px-3 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest hidden sm:table-cell" style={{ color: PANEL.muted }}>Category</th>
                      <th className="text-left px-3 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest hidden md:table-cell" style={{ color: PANEL.muted }}>Account</th>
                      <th className="text-right px-3 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: PANEL.muted }}>Amount</th>
                      <th className="px-4 py-3.5 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(txn => {
                      const cat = txn.category_id ? categories.find(c => c.id === txn.category_id) : null
                      const acc = txn.account_id ? accounts.find(a => a.id === txn.account_id) : null
                      const income = txn.type === 'income'
                      return (
                        <tr key={txn.id} data-txn-row className="transition-colors group hover:bg-white/[0.03]" style={{ borderBottom: `1px solid ${PANEL.divider}` }}>
                          <td className="px-3 sm:px-6 py-4 text-sm font-medium whitespace-nowrap align-top" style={{ color: 'rgba(148,163,184,0.8)' }}>
                            {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                                style={{ background: income ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.12)', color: income ? '#34d399' : '#fb7185' }}>
                                {income ? '+' : '−'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                  {txn.merchant ?? txn.note ?? 'Transaction'}
                                </p>
                                {txn.merchant && txn.note && (
                                  <p className="flex items-center gap-1 mt-1 truncate max-w-[220px]" style={{ color: 'rgba(148,163,184,0.75)', fontSize: '12px', fontWeight: 500 }}>
                                    <StickyNote className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(148,163,184,0.55)' }} />
                                    {txn.note}
                                  </p>
                                )}
                                {acc && (
                                  <p className="flex items-center gap-1.5 mt-1 md:hidden" style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.65)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: acc.color }} />
                                    {acc.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden sm:table-cell align-top">
                            {cat ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: `${cat.color}1f`, color: '#e2e8f0', border: `1px solid ${cat.color}33` }}>
                                {cat.icon} {cat.name}
                              </span>
                            ) : <span className="text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>—</span>}
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell align-top">
                            {acc ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(148,163,184,0.12)', color: '#e2e8f0' }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: acc.color }} />
                                {acc.name}
                              </span>
                            ) : <span className="text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>—</span>}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right align-top">
                            <span className="text-sm font-black whitespace-nowrap" style={{ color: income ? '#34d399' : '#fb7185' }}>
                              {income ? '+' : '−'}{formatCurrency(Number(txn.amount_in_base), txn.currency)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-4 align-top">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button onClick={() => setEditTxn(txn)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:text-emerald-400 hover:bg-emerald-400/10" style={{ color: 'rgba(148,163,184,0.7)' }} title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDelTxn(txn)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:text-red-400 hover:bg-red-400/10" style={{ color: 'rgba(148,163,184,0.7)' }} title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: row layout instead of a table, so amount/actions never get clipped */}
              <div className="sm:hidden">
                {filtered.map(txn => {
                  const acc = txn.account_id ? accounts.find(a => a.id === txn.account_id) : null
                  const income = txn.type === 'income'
                  return (
                    <div key={txn.id} data-txn-row className="flex items-start justify-between gap-2 px-4 py-3.5" style={{ borderBottom: `1px solid ${PANEL.divider}` }}>
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                          style={{ background: income ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.12)', color: income ? '#34d399' : '#fb7185' }}>
                          {income ? '+' : '−'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.92)' }}>
                            {txn.merchant ?? txn.note ?? 'Transaction'}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.65)' }}>
                            {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {acc ? ` · ${acc.name}` : ''}
                          </p>
                          {txn.merchant && txn.note && (
                            <p className="truncate mt-0.5" style={{ color: 'rgba(148,163,184,0.75)', fontSize: '11px' }}>
                              {txn.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-sm font-black whitespace-nowrap" style={{ color: income ? '#34d399' : '#fb7185' }}>
                          {income ? '+' : '−'}{formatCurrency(Number(txn.amount_in_base), txn.currency)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setEditTxn(txn)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ color: 'rgba(148,163,184,0.7)' }} title="Edit">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDelTxn(txn)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ color: 'rgba(148,163,184,0.7)' }} title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-3xl mb-3">{transactions.length > 0 ? '🔍' : '💸'}</p>
              <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                {transactions.length > 0 ? `Nothing in ${scopeLabel}` : 'No transactions yet'}
              </p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(148,163,184,0.7)' }}>
                {transactions.length > 0
                  ? <button onClick={() => setFMonth('')} className="text-emerald-400 underline underline-offset-2">Show all time</button>
                  : 'Click Add to record your first one'}
              </p>
              {transactions.length === 0 && (
                <button onClick={() => setTxnOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                  <Plus className="w-3.5 h-3.5" /> Add Transaction
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editTxn && <EditModal txn={editTxn} categories={categories} open={!!editTxn} onClose={() => setEditTxn(null)} onSuccess={() => router.refresh()} />}
      <DeleteModal open={!!delTxn} onClose={() => setDelTxn(null)} onConfirm={handleDelete} isPending={isDeleting} />
      <AddTransactionModal open={txnOpen} onClose={() => setTxnOpen(false)} accounts={accounts} categories={categories} budgetByCategory={budgetByCategory} spentByCategory={spentByCategory} />
      <AddAccountModal open={accOpen} onClose={() => setAccOpen(false)} />
    </>
  )
}
