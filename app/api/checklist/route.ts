import { NextRequest, NextResponse } from 'next/server'
import { checklistStore, newId } from '@/lib/localStore'

export async function GET() {
  const items = checklistStore()
    .filter(i => i.is_active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const { label } = await req.json()
  const store     = checklistStore()
  const maxOrder  = store.reduce((m, i) => Math.max(m, i.sort_order), -1)
  const item = {
    id:         newId(),
    user_id:    'local',
    label:      label ?? '',
    sort_order: maxOrder + 1,
    is_active:  true,
    created_at: new Date().toISOString(),
  }
  store.push(item)
  return NextResponse.json(item, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const store = checklistStore()
  const idx   = store.findIndex(i => i.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  store[idx] = { ...store[idx], ...updates }
  return NextResponse.json(store[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const store   = checklistStore()
  const idx     = store.findIndex(i => i.id === id)
  // Soft delete via is_active = false
  if (idx !== -1) store[idx] = { ...store[idx], is_active: false }
  return NextResponse.json({ success: true })
}
