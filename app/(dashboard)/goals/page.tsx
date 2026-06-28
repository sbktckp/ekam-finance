import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-gray-100 text-gray-600',
}

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-500 mt-1">Track your savings targets</p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          + New goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.target_amount > 0
              ? Math.min((Number(goal.saved_amount) / Number(goal.target_amount)) * 100, 100)
              : 0
            const remaining = Math.max(Number(goal.target_amount) - Number(goal.saved_amount), 0)
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{goal.title}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-gray-500">
                          By {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[goal.status]}`}>
                    {goal.status}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{formatCurrency(Number(goal.saved_amount), goal.currency)} saved</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-gray-900">{formatCurrency(remaining, goal.currency)}</span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No goals yet</p>
            <p className="text-gray-400 text-xs mt-1">Set a savings goal to start tracking your progress</p>
          </div>
        )}
      </div>
    </div>
  )
}
