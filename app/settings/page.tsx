'use client'

import { useState, useEffect } from 'react'
import { PreMarketChecklist } from '@/components/checklist/PreMarketChecklist'
import { Settings2, CheckSquare, Info, Brain, Key, CheckCircle2, XCircle, Eye, EyeOff, RefreshCw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'checklist' | 'briefing' | 'about'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'checklist', label: 'Checklist',  icon: <CheckSquare className="w-3.5 h-3.5" /> },
  { id: 'briefing',  label: 'Briefing IA', icon: <Brain       className="w-3.5 h-3.5" /> },
  { id: 'about',     label: 'À propos',   icon: <Info        className="w-3.5 h-3.5" /> },
]

// ── Briefing settings tab ─────────────────────────────────────────────────────

function BriefingSettings() {
  const [apiKey, setApiKey]         = useState('')
  const [showKey, setShowKey]       = useState(false)
  const [saved, setSaved]           = useState(false)
  const [forcing, setForcing]       = useState(false)
  const [forceMsg, setForceMsg]     = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('anthropic_key') ?? ''
    setApiKey(stored)
  }, [])

  const hasKey    = apiKey.trim().startsWith('sk-')
  const isValid   = hasKey

  const handleSave = () => {
    localStorage.setItem('anthropic_key', apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    setApiKey('')
    localStorage.removeItem('anthropic_key')
  }

  const handleForceGenerate = () => {
    const key = localStorage.getItem('anthropic_key') ?? ''
    if (!key || !key.startsWith('sk-')) {
      setForceMsg('Enregistrez d\'abord votre clé API.')
      setTimeout(() => setForceMsg(''), 3000)
      return
    }
    setForcing(true)
    setForceMsg('Génération lancée…')
    // Dispatch custom event — AIDailyBriefing écoute cet event
    window.dispatchEvent(new Event('briefing:force'))
    setTimeout(() => {
      setForcing(false)
      setForceMsg('✓ Briefing en cours de génération sur le dashboard.')
      setTimeout(() => setForceMsg(''), 4000)
    }, 1000)
  }

  return (
    <div className="max-w-xl space-y-5">

      {/* Status card */}
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-xl border',
        isValid
          ? 'bg-[#00e5a010] border-[#00e5a033]'
          : 'bg-[#ff4d6a10] border-[#ff4d6a33]'
      )}>
        {isValid
          ? <CheckCircle2 className="w-5 h-5 text-[#00e5a0] flex-shrink-0" />
          : <XCircle      className="w-5 h-5 text-[#ff4d6a] flex-shrink-0" />
        }
        <div>
          <p className={cn('text-[11px] font-semibold', isValid ? 'text-[#00e5a0]' : 'text-[#ff4d6a]')}>
            {isValid ? 'Clé API configurée' : 'Clé API manquante'}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {isValid
              ? 'Le briefing IA se génère automatiquement à 8H et 14H (lundi–vendredi).'
              : 'Entrez votre clé Anthropic ci-dessous pour activer le briefing automatique.'}
          </p>
        </div>
      </div>

      {/* Key input */}
      <div className="bg-surface-800 border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-accent-cyan" />
          <p className="text-[11px] font-semibold text-gray-200">Clé API Anthropic</p>
        </div>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-…"
            className="w-full pl-3 pr-10 py-2.5 text-[11px] bg-surface-900 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#00c8ff66] font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={() => setShowKey(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
            title={showKey ? 'Masquer' : 'Afficher'}
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 py-2 rounded-lg text-[11px] font-medium bg-[#00c8ff15] text-accent-cyan border border-[#00c8ff33] hover:bg-[#00c8ff25] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? '✓ Enregistrée' : 'Enregistrer la clé'}
          </button>
          {apiKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:text-[#ff4d6a] bg-surface-900 border border-white/5 hover:border-[#ff4d6a33] transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        <p className="text-[10px] text-gray-600">
          Obtenez votre clé sur{' '}
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            console.anthropic.com
          </a>
          . Elle est stockée localement dans votre navigateur et n&apos;est jamais partagée.
        </p>
      </div>

      {/* Briefing schedule info */}
      <div className="bg-surface-800 border border-white/5 rounded-xl p-5 space-y-3">
        <p className="text-[11px] font-semibold text-gray-200">Planification du briefing</p>
        <div className="space-y-2">
          {[
            { time: '8H00',  label: 'Briefing pré-marché',    desc: 'Analyse initiale avant l\'ouverture London/NY', color: '#f59e0b' },
            { time: '14H00', label: 'Mise à jour mi-session',  desc: 'Adaptation en fonction des évolutions du matin', color: '#00c8ff' },
          ].map(({ time, label, desc, color }) => (
            <div key={time} className="flex items-start gap-3 p-3 bg-surface-900 rounded-lg border border-white/5">
              <span className="text-[11px] font-bold font-mono mt-0.5" style={{ color }}>{time}</span>
              <div>
                <p className="text-[11px] text-gray-300 font-medium">{label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600 pt-1">
          <span className="w-2 h-2 rounded-full bg-[#00e5a0]" />
          Lundi au vendredi uniquement — ~10 appels API par semaine
        </div>
      </div>

      {/* Force generate */}
      <div className="bg-surface-800 border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          <p className="text-[11px] font-semibold text-gray-200">Génération manuelle</p>
        </div>
        <p className="text-[10px] text-gray-500">
          Force la génération immédiate du briefing pour le slot actuel (ignore le cache).
          Utile pour tester ou si la génération automatique n&apos;a pas fonctionné.
        </p>
        <button
          onClick={handleForceGenerate}
          disabled={forcing || !isValid}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-medium text-[#f59e0b] bg-[#f59e0b12] border border-[#f59e0b33] hover:bg-[#f59e0b20] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${forcing ? 'animate-spin' : ''}`} />
          Générer maintenant
        </button>
        {forceMsg && (
          <p className="text-[10px] text-accent-cyan">{forceMsg}</p>
        )}
      </div>

    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('checklist')

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-surface-700 rounded-lg">
          <Settings2 className="w-4 h-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-100">Paramètres</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Configurez votre checklist, clé API et les préférences du dashboard.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-surface-800 border border-white/5 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
              tab === t.id
                ? 'bg-[#00c8ff15] text-accent-cyan border border-[#00c8ff33]'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'checklist' && (
        <div className="max-w-xl">
          <PreMarketChecklist />
          <p className="text-[10px] text-gray-600 mt-3">
            Les items de checklist sont réinitialisés automatiquement chaque jour.
          </p>
        </div>
      )}

      {tab === 'briefing' && <BriefingSettings />}

      {tab === 'about' && (
        <div className="max-w-xl space-y-4">

          {/* App info */}
          <div className="bg-surface-800 border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00c8ff15] border border-[#00c8ff33] flex items-center justify-center">
                <span className="text-accent-cyan text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-100">Apex Trading Desk</p>
                <p className="text-[10px] text-gray-500">Version 1.0 — MVP Solo</p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-gray-400">
              <p>Dashboard pre-market personnel, conçu pour préparer chaque session de trading.</p>
              <p>Alimenté par <span className="text-accent-cyan">Claude (Anthropic)</span> pour le briefing IA quotidien.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              {[
                { label: 'Stack',   value: 'Next.js 14 + TypeScript' },
                { label: 'UI',      value: 'TailwindCSS + Lucide' },
                { label: 'Market',  value: 'yahoo-finance2' },
                { label: 'Charts',  value: 'TradingView Widgets' },
                { label: 'IA',      value: 'Claude Sonnet 4.5' },
                { label: 'Bias',    value: 'Scoring Engine local' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</p>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Design system */}
          <div className="bg-surface-800 border border-white/5 rounded-xl p-5 space-y-3">
            <p className="text-[11px] font-semibold text-gray-200">Design System — Marketdesk</p>
            <div className="flex flex-wrap gap-3">
              {[
                { color: '#7AA7FF', label: 'Blue — primary, brand' },
                { color: '#59E6D6', label: 'Cyan — bullish, gain' },
                { color: '#FF5C7A', label: 'Red — bearish, perte' },
                { color: '#FFC24A', label: 'Amber — warning, alerte' },
                { color: '#CBD5E1', label: 'Neutral — range' },
              ].map(({ color, label }) => (
                <div key={color} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
