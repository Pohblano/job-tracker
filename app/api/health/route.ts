// Simple health endpoint for monitoring the TV display availability.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}
