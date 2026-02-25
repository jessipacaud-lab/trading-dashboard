'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/settings',  icon: Settings,         label: 'Paramètres' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-18 lg:w-68 flex-shrink-0 flex flex-col h-screen z-30 fixed left-0 top-0"
      style={{ background: '#0B1220', borderRight: '1px solid rgba(148,163,184,0.14)' }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.10)' }}
      >
        {/* Icon mark — reprise fidèle du logo SVG */}
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0 relative overflow-hidden"
          style={{ background: '#0B1220', border: '1px solid rgba(148,163,184,0.18)' }}
        >
          {/* window bar */}
          <div className="absolute top-[7px] left-[6px] right-[6px] h-[5px] rounded-full"
               style={{ background: 'rgba(148,163,184,0.10)' }} />
          {/* data lines */}
          <div className="absolute top-[16px] left-[6px] w-[12px] h-[2.5px] rounded-full"
               style={{ background: 'rgba(231,234,240,0.75)' }} />
          <div className="absolute top-[20px] left-[6px] w-[16px] h-[2.5px] rounded-full"
               style={{ background: 'rgba(231,234,240,0.35)' }} />
          <div className="absolute top-[24px] left-[6px] w-[9px] h-[2.5px] rounded-full"
               style={{ background: 'rgba(231,234,240,0.22)' }} />
          {/* signal dot */}
          <div className="signal-dot absolute bottom-[5px] right-[5px]"
               style={{ width: 6, height: 6, animation: 'signal-pulse 2.5s ease-in-out infinite' }} />
        </div>

        {/* Wordmark */}
        <div className="hidden lg:block leading-none">
          <p className="text-[15px] font-semibold tracking-tight" style={{ color: '#E7EAF0' }}>
            Marketdesk
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9AA6B2' }}>
            pre-market OS
          </p>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-r-lg border-l-2 transition-all duration-150',
                active
                  ? 'nav-active'
                  : 'border-transparent hover:bg-[rgba(148,163,184,0.06)]'
              )}
              style={{ color: active ? '#7AA7FF' : '#9AA6B2' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <span className="hidden lg:block text-[13px] font-medium tracking-wide">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── User ─────────────────────────────────────────────────────── */}
      <div className="p-3 flex-shrink-0"
           style={{ borderTop: '1px solid rgba(148,163,184,0.10)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold"
            style={{
              background: 'rgba(122,167,255,0.12)',
              border: '1px solid rgba(122,167,255,0.22)',
              color: '#7AA7FF',
            }}
          >
            JP
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: '#E7EAF0' }}>
              J. Pacaud
            </p>
            <p className="text-[11px]" style={{ color: '#9AA6B2' }}>Pro Trader</p>
          </div>
          <div className="hidden lg:block w-2 h-2 rounded-full flex-shrink-0"
               style={{ background: '#59E6D6' }} />
        </div>
      </div>
    </aside>
  )
}
