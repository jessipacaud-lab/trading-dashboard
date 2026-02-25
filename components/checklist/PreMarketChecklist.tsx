'use client'

import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ChecklistItemRow } from './ChecklistItem'
import type { ChecklistItemType } from '@/lib/types'
import { Plus, RotateCcw, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PreMarketChecklist() {
  const [items, setItems]           = useState<ChecklistItemType[]>([])
  const [completedIds, setCompleted] = useState<Set<string>>(new Set())
  const [newLabel, setNewLabel]     = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/checklist').then(r => r.json()),
      fetch('/api/checklist/completions').then(r => r.json()),
    ]).then(([itemsData, completionsData]) => {
      setItems(itemsData as ChecklistItemType[])
      setCompleted(new Set((completionsData as { item_id: string }[]).map(c => c.item_id)))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggle = async (id: string, checked: boolean) => {
    // Optimistic update
    setCompleted(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
    await fetch('/api/checklist/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ item_id: id, completed: checked }),
    })
  }

  const addItem = async () => {
    if (!newLabel.trim()) return
    const res  = await fetch('/api/checklist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ label: newLabel.trim() }),
    })
    const item = await res.json() as ChecklistItemType
    setItems(prev => [...prev, item])
    setNewLabel('')
  }

  const deleteItem = async (id: string) => {
    await fetch('/api/checklist', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const resetAll = async () => {
    // Remove all completions for today
    for (const id of Array.from(completedIds)) {
      await fetch('/api/checklist/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ item_id: id, completed: false }),
      })
    }
    setCompleted(new Set())
  }

  const progress = items.length ? Math.round((completedIds.size / items.length) * 100) : 0

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">
      <SectionHeader
        title="Pre-Market Checklist"
        subtitle={`${completedIds.size}/${items.length} complétés`}
        action={
          <div className="flex items-center gap-2">
            {/* Progress */}
            <div className="flex items-center gap-2 text-[9px]">
              <div className="w-20 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width:  `${progress}%`,
                    background: progress === 100 ? '#00e5a0' : 'linear-gradient(90deg,#00c8ff,#a855f7)',
                  }}
                />
              </div>
              <span style={{ color: progress === 100 ? '#00e5a0' : '#00c8ff' }}>{progress}%</span>
            </div>
            {progress > 0 && (
              <button onClick={resetAll} title="Reset du jour"
                className="p-1 text-gray-600 hover:text-gray-400 transition-colors">
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        }
      />

      {/* All done banner */}
      {progress === 100 && items.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#00e5a012] border-b border-[#00e5a033]">
          <CheckSquare className="w-3.5 h-3.5 text-accent-green" />
          <span className="text-[10px] text-accent-green font-medium">
            Checklist complète — Tu es prêt à trader ! 🚀
          </span>
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {items.map(item => (
              <ChecklistItemRow
                key={item.id}
                id={item.id}
                label={item.label}
                checked={completedIds.has(item.id)}
                onToggle={toggle}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}

        {/* Add new item */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Ajouter un item de checklist…"
            className="flex-1 px-3 py-1.5 text-[11px] bg-surface-900 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#00c8ff44]"
          />
          <button onClick={addItem}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
              newLabel.trim()
                ? 'bg-[#00c8ff12] text-accent-cyan border border-[#00c8ff33] hover:bg-[#00c8ff20]'
                : 'bg-surface-700 text-gray-600 cursor-not-allowed'
            )}
            disabled={!newLabel.trim()}
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>
      </div>
    </section>
  )
}
