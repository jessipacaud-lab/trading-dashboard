'use client'

import { cn } from '@/lib/utils'
import { Trash2, GripVertical } from 'lucide-react'

interface ChecklistItemProps {
  id:        string
  label:     string
  checked:   boolean
  onToggle:  (id: string, checked: boolean) => void
  onDelete?: (id: string) => void
  dragging?: boolean
}

export function ChecklistItemRow({ id, label, checked, onToggle, onDelete, dragging }: ChecklistItemProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
      dragging ? 'bg-surface-700 shadow-glow-cyan' : 'hover:bg-surface-900/50',
    )}>
      {/* Drag handle */}
      <GripVertical className="w-3 h-3 text-gray-700 flex-shrink-0 cursor-grab active:cursor-grabbing" />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(id, !checked)}
        className={cn(
          'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all',
          checked
            ? 'bg-accent-cyan border-accent-cyan'
            : 'border-white/20 hover:border-accent-cyan/50'
        )}
        aria-label={checked ? 'Décocher' : 'Cocher'}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-surface-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Label */}
      <span className={cn(
        'flex-1 text-[11px] transition-all',
        checked ? 'line-through text-gray-600' : 'text-gray-300'
      )}>
        {label}
      </span>

      {/* Delete (only visible on hover) */}
      {onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-accent-red transition-all"
          aria-label="Supprimer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
