'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Plus, X, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { addInvestment, updateInvestment, deleteInvestment } from '@/app/actions/investments'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES, INVESTMENT_TYPES } from '@/lib/constants'
import { PageHero } from '@/components/shared/page-hero'

type Investment = { id: string; name: string; type: string; ticker: string | null; quantity: number; avg_buy_price: number; currency: string; current_price: number | null }
type Account    = { id: string; name: string; color: string; balance: number; currency: string }

const DARK = { bg: '#1c1c1e', border: 'rgba(255,255,255,0.10)', input: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.13)', text: 'rgba(255,255,255,0.88)', label: 'rgba(255,255,255,0.38)' }

/** Shared dark panel tokens, matching the rest of the dashboard. */
const PANEL = { bg: '#0d1017', border: 'rgba(148,163,184,0.13)', divider: 'rgba(148,163,184,0.07)', heading: '#f1f5f9', muted: 'rgba(148,163,184,0.75)', faint: 'rgba(148,163,184,0.6)' }

function inputStyle() {
  return { background: DARK.input, border: `1px solid ${DARK.inputBorder}`, color: DARK.text }
}

// ─── Add Investment modal ──────────────────────────────────────────────────────
function AddModal({ open, onClose, accounts, onSuccess }: {
  open: boolean; onClose: () => void; accounts: Account[]; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selAcc, setSelAcc] = useState('')
  const [qty,   setQty]   = useState('')
  const [price, setPrice] = useState('')

  const totalCost = qty && price ? Number(qty) * Number(price) : 0
  const selAccBal = accounts.find(a => a.id === selAcc)?.balance ?? 0

  function handleSubmit(fd: FormData) {
    fd.set('account_id', selAcc)
    setError(null)
    startTransition(async () => {
      const res = await addInvestment(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden" style={{ background: DARK.bg, border: `1px solid ${DARK.border}` }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${DARK.border}` }}>
          <h2 className="text-sm font-bold" style={{ color: DARK.text }}>Add Investment</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <form action={handleSubmit} className="px-6 pb-6 pt-5 space-y-4 overflow-y-auto max-h-[80vh] sm:max-h-none">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Name</label>
              <input name="name" type="text" required placeholder="e.g. Reliance, NIFTY 50" className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Ticker</label>
              <input name="ticker" type="text" placeholder="RELIANCE" className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all uppercase" style={inputStyle()} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Type</label>
            <select name="type" defaultValue="stock" className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()}>
              {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Qty</label>
              <input name="quantity" type="number" step="0.001" min="0.001" required placeholder="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Buy Price</label>
              <input name="avg_buy_price" type="number" step="0.01" min="0" required placeholder="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Currency</label>
              <select name="currency" defaultValue="INR" className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          {accounts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Deduct from Account <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => setSelAcc('')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: !selAcc ? '1px solid #10b981' : `1px solid ${DARK.inputBorder}`, background: !selAcc ? 'rgba(16,185,129,0.12)' : DARK.input, color: !selAcc ? '#34d399' : 'rgba(255,255,255,0.55)' }}>
                  None
                </button>
                {accounts.map(a => (
                  <button key={a.id} type="button" onClick={() => setSelAcc(a.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ border: selAcc === a.id ? '1px solid #10b981' : `1px solid ${DARK.inputBorder}`, background: selAcc === a.id ? 'rgba(16,185,129,0.12)' : DARK.input, color: selAcc === a.id ? '#34d399' : 'rgba(255,255,255,0.65)' }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                    {a.name} <span style={{ color: 'rgba(255,255,255,0.35)' }}>{formatCurrency(Number(a.balance), a.currency)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {totalCost > 0 && (
            <div className="rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: selAcc && selAccBal < totalCost ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', color: selAcc && selAccBal < totalCost ? '#f87171' : 'rgba(255,255,255,0.6)', border: `1px solid ${DARK.inputBorder}` }}>
              Total cost: {formatCurrency(totalCost, 'INR')}
              {selAcc && <span className="ml-2 opacity-70">· Balance after: {formatCurrency(selAccBal - totalCost, 'INR')}</span>}
            </div>
          )}
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}
          <button type="submit" disabled={isPending} className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Adding...' : 'Add Investment'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Investment modal ─────────────────────────────────────────────────────
function EditModal({ inv, open, onClose, onSuccess }: {
  inv: Investment; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await updateInvestment(inv.id, fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: DARK.bg, border: `1px solid ${DARK.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: DARK.text }}>Edit {inv.name}</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Name</label>
              <input name="name" type="text" required defaultValue={inv.name} autoFocus className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Ticker</label>
              <input name="ticker" type="text" defaultValue={inv.ticker ?? ''} className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all uppercase" style={inputStyle()} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Type</label>
            <select name="type" defaultValue={inv.type} className="w-full px-3 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()}>
              {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Qty</label>
              <input name="quantity" type="number" step="0.001" min="0.001" required defaultValue={Number(inv.quantity)} className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: DARK.label }}>Avg Buy Price</label>
              <input name="avg_buy_price" type="number" step="0.01" min="0" required defaultValue={Number(inv.avg_buy_price)} className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/25 transition-all" style={inputStyle()} />
            </div>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${DARK.inputBorder}`, color: 'rgba(255,255,255,0.65)' }}>Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirmation ───────────────────────────────────────────────────────
function DeleteModal({ inv, open, onClose, onSuccess }: {
  inv: Investment; open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  function handle() {
    startTransition(async () => { await deleteInvestment(inv.id); onSuccess(); onClose() })
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6" style={{ background: DARK.bg, border: `1px solid ${DARK.border}` }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: DARK.text }}>Delete {inv.name}?</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${DARK.inputBorder}`, color: 'rgba(255,255,255,0.65)' }}>Cancel</button>
          <button onClick={handle} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">{isPending ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────
export function InvestmentsView({ investments, accounts }: { investments: Investment[]; accounts: Account[] }) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [editInv, setEditInv] = useState<Investment | null>(null)
  const [delInv,  setDelInv]  = useState<Investment | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const refresh = () => router.refresh()

  const totalInvested = investments.reduce((s, i) => s + Number(i.quantity) * Number(i.avg_buy_price), 0)
  const totalCurrent  = investments.reduce((s, i) => s + Number(i.quantity) * (i.current_price != null ? Number(i.current_price) : Number(i.avg_buy_price)), 0)
  const totalPnL      = totalCurrent - totalInvested
  const pnlPct        = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const up            = totalPnL >= 0
  const TYPE_ICONS: Record<string, string> = { stock: '📈', mutual_fund: '🏦', crypto: '₿', etf: '📊', bond: '📃', real_estate: '🏠', other: '💼' }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !listRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-inv-row]', { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out', stagger: 0.04, delay: 0.1 })
    }, listRef)
    return () => ctx.revert()
  }, [investments.length])

  return (
    <>
      <div className="space-y-6">
        <PageHero
          kicker="Portfolio"
          title={<>Stocks, SIPs,<br />crypto and more.</>}
          stat={investments.length > 0 ? totalCurrent : undefined}
          statLabel={investments.length > 0 ? 'Current value' : undefined}
          subtitle={investments.length === 0 ? 'Nothing tracked yet' : undefined}
          accent={up ? '#10b981' : '#f43f5e'}
          shape="orbit"
          intensity={0.55}
          actions={
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#04140e' }}>
              <Plus className="w-4 h-4" /> Add investment
            </button>
          }
        >
          {investments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.22)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>Invested</span>
                <span className="text-xs font-black" style={{ color: '#e2e8f0' }}>{formatCurrency(totalInvested, 'INR')}</span>
              </span>
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: up ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                  border: `1px solid ${up ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.28)'}`,
                }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>P&amp;L</span>
                <span className="text-xs font-black" style={{ color: up ? '#6ee7b7' : '#fb7185' }}>
                  {up ? '+' : ''}{formatCurrency(totalPnL, 'INR')} ({pnlPct.toFixed(1)}%)
                </span>
              </span>
              <span className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.8)' }}>Holdings</span>
                <span className="text-xs font-black" style={{ color: '#c4b5fd' }}>{investments.length}</span>
              </span>
            </div>
          )}
        </PageHero>

        {investments.length > 0 ? (
          <div ref={listRef} className="rounded-2xl overflow-hidden" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PANEL.border}` }}>
                    <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: PANEL.muted }}>Asset</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest hidden sm:table-cell" style={{ color: PANEL.muted }}>Qty</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: PANEL.muted }}>Invested</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest hidden sm:table-cell" style={{ color: PANEL.muted }}>P&amp;L</th>
                    <th className="px-4 py-3.5 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => {
                    const invested = Number(inv.quantity) * Number(inv.avg_buy_price)
                    const current  = Number(inv.quantity) * (inv.current_price != null ? Number(inv.current_price) : Number(inv.avg_buy_price))
                    const pnl      = current - invested
                    const rowUp    = pnl >= 0
                    return (
                      <tr key={inv.id} data-inv-row className="transition-colors group hover:bg-white/[0.03]" style={{ borderBottom: `1px solid ${PANEL.divider}` }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg flex-shrink-0">{TYPE_ICONS[inv.type] ?? '💼'}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: PANEL.heading }}>{inv.name}</p>
                              <p className="text-[11px] capitalize" style={{ color: PANEL.faint }}>{inv.ticker ?? inv.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-sm" style={{ color: PANEL.muted }}>{Number(inv.quantity).toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatCurrency(invested, inv.currency)}</span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-sm font-bold" style={{ color: rowUp ? '#34d399' : '#fb7185' }}>
                            {rowUp ? '+' : ''}{formatCurrency(pnl, inv.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button onClick={() => setEditInv(inv)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:text-emerald-400 hover:bg-emerald-400/10" style={{ color: 'rgba(148,163,184,0.7)' }} title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDelInv(inv)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:text-red-400 hover:bg-red-400/10" style={{ color: 'rgba(148,163,184,0.7)' }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl py-20 text-center" style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}` }}>
            <p className="text-3xl mb-3">📈</p>
            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>No investments tracked</p>
            <p className="text-xs mt-1 mb-4" style={{ color: PANEL.muted }}>Add stocks, mutual funds, crypto and more</p>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              <Plus className="w-3.5 h-3.5" /> Add Investment
            </button>
          </div>
        )}
      </div>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} accounts={accounts} onSuccess={refresh} />
      {editInv && <EditModal   inv={editInv} open={!!editInv} onClose={() => setEditInv(null)} onSuccess={refresh} />}
      {delInv  && <DeleteModal inv={delInv}  open={!!delInv}  onClose={() => setDelInv(null)}  onSuccess={refresh} />}
    </>
  )
}
