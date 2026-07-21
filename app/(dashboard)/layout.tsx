import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="dk flex h-screen" style={{ background: '#0a0a0a' }}>
      <Sidebar />
      <main className="flex-1 md:ml-60 overflow-auto pt-[52px] md:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
