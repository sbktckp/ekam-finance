'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { formatCurrency } from '@/lib/utils'
import type { SceneShape } from './ambient-scene'

const AmbientScene = dynamic(
  () => import('./ambient-scene').then(m => m.AmbientScene),
  { ssr: false, loading: () => null },
)

/**
 * The standard hero slab for every dashboard page.
 *
 * Carries the landing page's language into the app: uppercase emerald kicker,
 * heavy tight-tracked headline, a particle field behind a dark scrim, and a
 * gold-flecked accent. Pass `stat` to get a count-up headline figure.
 */
export function PageHero({
  kicker,
  title,
  subtitle,
  stat,
  statLabel,
  currency = 'INR',
  accent = '#10b981',
  shape = 'knot',
  intensity = 0.5,
  actions,
  children,
}: {
  kicker: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  stat?: number
  statLabel?: string
  currency?: string
  accent?: string
  shape?: SceneShape
  intensity?: number
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const statRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-hero]', { opacity: 1, y: 0 })
        return
      }
      gsap.from('[data-hero]', {
        opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.06,
      })
      const el = statRef.current
      if (el && typeof stat === 'number') {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: stat, duration: 1.1, ease: 'power2.out',
          onUpdate: () => { el.textContent = formatCurrency(obj.v, currency) },
        })
      }
    }, rootRef)
    return () => ctx.revert()
  }, [stat, currency])

  const rgb = accent.startsWith('#')
    ? [1, 3, 5].map(i => parseInt(accent.slice(i, i + 2), 16)).join(',')
    : '16,185,129'

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: `radial-gradient(120% 140% at 82% 18%, rgba(${rgb},0.16) 0%, rgba(139,92,246,0.09) 38%, rgba(11,14,20,0) 70%), #0b0e14`,
        border: '1px solid rgba(148,163,184,0.14)',
      }}
    >
      <div className="absolute inset-0">
        <AmbientScene accent={accent} shape={shape} intensity={intensity} />
      </div>

      {/* Dark readability scrim, clearing to the right so the field stays visible. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(100deg, #0b0e14 0%, rgba(11,14,20,0.92) 34%, rgba(11,14,20,0.45) 58%, rgba(11,14,20,0) 80%)' }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="min-w-0">
            <p
              data-hero
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: accent }}
            >
              {kicker}
            </p>

            <h1
              data-hero
              className="font-black"
              style={{ fontSize: 'clamp(24px, 4vw, 34px)', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#f8fafc' }}
            >
              {title}
            </h1>

            {subtitle && (
              <p data-hero className="text-sm mt-2" style={{ color: 'rgba(148,163,184,0.85)' }}>
                {subtitle}
              </p>
            )}

            {typeof stat === 'number' && (
              <>
                {statLabel && (
                  <p
                    data-hero
                    className="text-[11px] font-bold uppercase tracking-widest mt-5"
                    style={{ color: 'rgba(148,163,184,0.7)' }}
                  >
                    {statLabel}
                  </p>
                )}
                <p
                  ref={statRef}
                  data-hero
                  className="font-black leading-none mt-1"
                  style={{ fontSize: 'clamp(30px, 6vw, 40px)', letterSpacing: '-0.04em', color: '#ffffff' }}
                >
                  {formatCurrency(stat, currency)}
                </p>
              </>
            )}
          </div>

          {actions && <div data-hero className="flex-shrink-0 flex flex-wrap gap-2">{actions}</div>}
        </div>

        {children && <div data-hero className="mt-6">{children}</div>}
      </div>
    </div>
  )
}

export default PageHero
