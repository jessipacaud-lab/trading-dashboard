// ── In-memory stores (persistent across requests in dev, reset on restart) ────
// Used by: checklist API

import type { ChecklistItemType } from './types'

const g = globalThis as typeof globalThis & {
  _checklistItems?: ChecklistItemType[]
  _checklistCompletions?: Map<string, Set<string>>
}

// ── ID generator ──────────────────────────────────────────────────────────────

let _idCounter = 0
export function newId(): string {
  return `${Date.now()}-${++_idCounter}`
}

// ── Checklist items store ─────────────────────────────────────────────────────

const DEFAULT_ITEMS: Omit<ChecklistItemType, 'id' | 'user_id' | 'created_at'>[] = [
  { label: 'Vérifier calendrier économique',        sort_order: 0, is_active: true },
  { label: 'Analyser les marchés asiatiques',       sort_order: 1, is_active: true },
  { label: 'Identifier niveaux clés H4/D1',         sort_order: 2, is_active: true },
  { label: 'Lire le briefing IA quotidien',         sort_order: 3, is_active: true },
  { label: 'Vérifier positions ouvertes MT5',       sort_order: 4, is_active: true },
  { label: 'Définir les setups du jour',            sort_order: 5, is_active: true },
  { label: 'Confirmer risk management (SL/TP/size)',sort_order: 6, is_active: true },
]

export function checklistStore(): ChecklistItemType[] {
  if (!g._checklistItems) {
    g._checklistItems = DEFAULT_ITEMS.map((item, i) => ({
      ...item,
      id:         `default-${i}`,
      user_id:    'local',
      created_at: new Date().toISOString(),
    }))
  }
  return g._checklistItems
}

// ── Completions store ─────────────────────────────────────────────────────────
// Map<date (YYYY-MM-DD), Set<item_id>>

export function completionsStore(): Map<string, Set<string>> {
  if (!g._checklistCompletions) {
    g._checklistCompletions = new Map()
  }
  return g._checklistCompletions
}
