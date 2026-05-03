import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const body = await req.json()
  const { nombre, empresa, email, telefono, mensaje } = body

  if (!nombre?.trim() || !empresa?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Campos requeridos: nombre, empresa, email' }, { status: 400 })
  }

  const { error } = await supabase.from('prospects').insert({
    nombre:   nombre.trim(),
    empresa:  empresa.trim(),
    email:    email.trim().toLowerCase(),
    telefono: telefono?.trim() || null,
    mensaje:  mensaje?.trim()  || null,
    estado:   'nuevo',
  })

  if (error) {
    console.error('Supabase prospect insert error:', error.message)
    return NextResponse.json({ error: 'Error al guardar. Intentá de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
