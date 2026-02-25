import { NextRequest, NextResponse } from 'next/server'
import { completionsStore, newId } from '@/lib/localStore'
import { todayISO } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date  = searchParams.get('date') ?? todayISO()
  const store = completionsStore()
  const ids   = store.get(date) ?? new Set<string>()

  // Return shape compatible with ChecklistCompletion[]
  const data = Array.from(ids).map(item_id => ({
    id:             newId(),
    user_id:        'local',
    item_id,
    completed_date: date,
    created_at:     new Date().toISOString(),
  }))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { item_id, completed } = await req.json()
  const today = todayISO()
  const store = completionsStore()

  if (!store.has(today)) store.set(today, new Set())
  const daySet = store.get(today)!

  if (completed) {
    daySet.add(item_id)
    return NextResponse.json({
      id:             newId(),
      user_id:        'local',
      item_id,
      completed_date: today,
      created_at:     new Date().toISOString(),
    })
  } else {
    daySet.delete(item_id)
    return NextResponse.json({ success: true })
  }
}
