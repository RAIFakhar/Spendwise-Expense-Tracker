import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await db.budget.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await db.budget.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}
