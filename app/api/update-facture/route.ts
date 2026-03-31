import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, client_email, client_telephone } = body

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    // Valider email si fourni
    if (client_email !== undefined && client_email !== null && client_email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(client_email)) {
        return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
      }
    }

    // Construire l'objet de mise à jour
    const updates: Record<string, string> = {}
    if (client_email !== undefined) updates.client_email = client_email
    if (client_telephone !== undefined) updates.client_telephone = client_telephone

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
    }

    // Mettre à jour uniquement les factures appartenant à l'utilisateur
    const { data, error } = await supabase
      .from('factures')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erreur update facture:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true, facture: data })
  } catch (err) {
    console.error('Erreur update-facture:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
