'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil, Trash2, AlertTriangle, Star, ArrowRightLeft, StickyNote } from 'lucide-react'
import { addAccount, updateAccount, deleteAccount, setDefaultAccount } from '@/app/actions/accounts'
import { addTransfer, deleteTransfer } from '@/app/actions/transfers'
import { formatCurrency, cn } from '@/lib/utils'
import { ACCOUNT_TYPES, CURRENCIES } from '@/lib/constants'

type Account  = { id: string; name: string; type: string; balance: number; currency: string; color: string; is_default: boolean }
type Transfer = { id: string; date: string; amount_in_base: number; currency: string; note: string | null; account_id: string | null; to_account_id: string | null; created_at: string }

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899']

function AddModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState(COLORS[0])

  function handleSubmit(fd: FormData) {
    fd.set('color', color)
    setError(null)
    startTransition(async () => {
      const res = await addAccount(fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Add Account</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Name</label>
            <input name="name" type="text" required autoFocus placeholder="e.g. HDFC Savings"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
            <select name="type" defaultValue="savings" className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/25">
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Opening Balance</label>
              <input name="balance" type="number" step="any" defaultValue="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Currency</label>
              <select name="currency" defaultValue="INR" className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/25">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} className="w-7 h-7 rounded-full flex-shrink-0"
                  style={{ background: c, outline: color === c ? `3px solid ${c}` : '3px solid transparent', outlineOffset: '2px', transform: color === c ? 'scale(1.2)' : 'scale(1)', opacity: color === c ? 1 : 0.65 }} />
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending} className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>
            {isPending ? 'Adding...' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function EditModal({ acc, open, onClose, onSuccess }: { acc: Account; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState(acc.color)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('color', color)
    setError(null)
    startTransition(async () => {
      const res = await updateAccount(acc.id, fd)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Edit Account</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
            <input name="name" type="text" required defaultValue={acc.name} autoFocus className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
            <select name="type" defaultValue={acc.type} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/25">
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} className="w-7 h-7 rounded-full flex-shrink-0"
                  style={{ background: c, outline: color === c ? `3px solid ${c}` : '3px solid transparent', outlineOffset: '2px', transform: color === c ? 'scale(1.2)' : 'scale(1)', opacity: color === c ? 1 : 0.65 }} />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">💡 Balance is updated automatically from your transactions and can&apos;t be edited directly here.</p>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#10b981' }}>{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ acc, open, onClose, onSuccess }: { acc: Account; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  function handle() {
    startTransition(async () => {
      const res = await deleteAccount(acc.id)
      if (res.error) { setError(res.error); return }
      onSuccess(); onClose()
    })
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Delete &quot;{acc.name}&quot;?</p>
            <p className="text-xs text-gray-400 mt-1">Accounts with transactions can&apos;t be deleted — remove or reassign those first.</p>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handle} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">{isPending ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Transfer modal ────────────────────────────────────────────────────────────
function TransferModal({ accounts, open, onClose, onSuccess }: { accounts: Account[]; open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '')
  const [toId, setToId]     = useState(accounts.find(a => a.id !== accounts[0]?.id)?.id ?? '')
  const [noteLen, setNoteLen] = useState(0)

  const fromAcc = accounts.find(a => a.id === fromId)
  const toOptions = accounts.filter(a => a.id !== fromId)

  function handleSubmit(fd: FormData) {
    fd.set('from_account_id', fromId)
    fd.set('to_account_id', toId)
    setError(null)
    startTransition(async () => {
      const res = await addTransfer(fd)
      if (res.error) { setError(res.error); return }
      setNoteLen(0); onSuccess(); onClose()
    })
  }

  if (!open) return null
  if (accounts.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-1">You need 2 accounts to transfer</p>
          <p className="text-xs text-gray-400 mb-4">Add another account first, then come back to move money between them.</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold text-black" style={{ background: '#10b981' }}>Got it</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><ArrowRightLeft className="w-4 h-4 text-indigo-500" /> Transfer Between Accounts</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          {/* From */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">From</label>
              {fromAcc && <span className="text-[11px] text-gray-400">Balance: <span className="font-bold text-gray-600">{formatCurrency(Number(fromAcc.balance), fromAcc.currency)}</span></span>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {accounts.map(a => (
                <button key={a.id} type="button"
                  onClick={() => { setFromId(a.id); if (toId === a.id) setToId(accounts.find(x => x.id !== a.id)?.id ?? '') }}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                    fromId === a.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: a.color }} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* To */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">To</label>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {toOptions.map(a => (
                <button key={a.id} type="button" onClick={() => setToId(a.id)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                    toId === a.id ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: a.color }} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
            <input name="amount" type="number" step="any" min="0.01" required placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-2xl font-black text-gray-900 placeholder:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Note <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
              <span className={cn('text-[10px] font-medium', noteLen > 90 ? 'text-red-400' : 'text-gray-300')}>{noteLen}/100</span>
            </div>
            <input name="note" type="text" maxLength={100} placeholder="e.g. moving savings to checking"
              onChange={e => setNoteLen(e.target.value.length)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={isPending || !toId} className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50" style={{ background: '#6366f1', color: '#fff' }}>
            {isPending ? 'Transferring...' : 'Transfer'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Delete transfer confirmation ──────────────────────────────────────────────
function DeleteTransferModal({ open, onClose, onConfirm, isPending }: { open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Delete this transfer?</p>
            <p className="text-xs text-gray-400 mt-1">Reverses the balance on both accounts. Cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50">{isPending ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}

export function AccountsView({ accounts, netWorth, transfers }: { accounts: Account[]; netWorth: number; transfers: Transfer[] }) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [editAcc, setEditAcc] = useState<Account | null>(null)
  const [delAcc, setDelAcc] = useState<Account | null>(null)
  const [delTransferId, setDelTransferId] = useState<string | null>(null)
  const [isDeletingTransfer, startDelTransfer] = useTransition()
  const refresh = () => router.refresh()

  function makeDefault(id: string) { startTransition(() => setDefaultAccount(id).then(refresh)) }
  const [, startTransition] = useTransition()

  const accountName = (id: string | null) => accounts.find(a => a.id === id)?.name ?? 'Deleted account'
  const accountColor = (id: string | null) => accounts.find(a => a.id === id)?.color ?? '#6b7280'

  function handleDeleteTransfer() {
    if (!delTransferId) return
    startDelTransfer(async () => { await deleteTransfer(delTransferId); setDelTransferId(null); router.refresh() })
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Accounts</h1>
            <p className="text-sm text-gray-400 mt-0.5">Net worth: <span className="font-bold text-emerald-500">{formatCurrency(netWorth, 'INR')}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTransferOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8', background: 'rgba(99,102,241,0.08)' }}>
              <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-black hover:-translate-y-px transition-all duration-150" style={{ background: '#10b981' }}>
              <Plus className="w-4 h-4" /> Add account
            </button>
          </div>
        </div>

        {accounts.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {accounts.map(a => (
              <div key={a.id} className="surface-light rounded-2xl p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: a.color }}>
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        {a.name}
                        {a.is_default && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">{a.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!a.is_default && (
                      <button onClick={() => makeDefault(a.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-amber-400 hover:bg-amber-50" title="Set as default"><Star className="w-3 h-3" /></button>
                    )}
                    <button onClick={() => setEditAcc(a)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => setDelAcc(a)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatCurrency(Number(a.balance), a.currency)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-light rounded-2xl py-20 text-center">
            <p className="text-3xl mb-3">🏦</p>
            <p className="text-sm font-semibold text-gray-500">No accounts yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Add a bank account, wallet, or card to get started</p>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Account
            </button>
          </div>
        )}

        {/* ── Transfer History ─────────────────────────────────────────────── */}
        {transfers.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Transfer History</h2>
            <div className="surface-light rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">From → To</th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-4 py-3.5 w-14"></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium whitespace-nowrap align-top">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                            <span className="w-2 h-2 rounded-full" style={{ background: accountColor(t.account_id) }} />
                            {accountName(t.account_id)}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                            <span className="w-2 h-2 rounded-full" style={{ background: accountColor(t.to_account_id) }} />
                            {accountName(t.to_account_id)}
                          </span>
                        </div>
                        {t.note && (
                          <p className="flex items-center gap-1 mt-1.5" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 500 }}>
                            <StickyNote className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.40)' }} />
                            {t.note}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right align-top">
                        <span className="text-sm font-black" style={{ color: '#818cf8' }}>{formatCurrency(Number(t.amount_in_base), t.currency)}</span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDelTransferId(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors" title="Delete transfer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
      <TransferModal accounts={accounts} open={transferOpen} onClose={() => setTransferOpen(false)} onSuccess={refresh} />
      {editAcc && <EditModal acc={editAcc} open={!!editAcc} onClose={() => setEditAcc(null)} onSuccess={refresh} />}
      {delAcc && <DeleteModal acc={delAcc} open={!!delAcc} onClose={() => setDelAcc(null)} onSuccess={refresh} />}
      <DeleteTransferModal open={!!delTransferId} onClose={() => setDelTransferId(null)} onConfirm={handleDeleteTransfer} isPending={isDeletingTransfer} />
    </>
  )
}
