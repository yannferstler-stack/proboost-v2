import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PLAN_LIMITS: Record<string, number> = { starter: 10, premium: 50, pro: 200 }

export async function POST(request: NextRequest) {
  try {
    // Authentification via Bearer token (session JWT du navigateur)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { rows } = await request.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Aucune facture à importer' }, { status: 400 })
    }

    // Vérifier le plan et la limite mensuelle
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    const plan = profile?.plan || 'starter'
    const limite = PLAN_LIMITS[plan] ?? 10

    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const { count } = await supabaseAdmin
      .from('factures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', debutMois.toISOString())

    const currentCount = count || 0
    const available = Math.max(0, limite - currentCount)

    if (available === 0) {
      return NextResponse.json({
        error: `Limite de ${limite} factures/mois atteinte (plan ${plan})`,
        limitReached: true,
        limite,
        currentCount,
      }, { status: 429 })
    }

    // On tronque silencieusement si on dépasse la capacité restante
    const rowsToInsert = rows.slice(0, available).map(r => ({ ...r, user_id: user.id }))

    const CHUNK = 50
    for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
      const { error } = await supabaseAdmin
        .from('factures')
        .insert(rowsToInsert.slice(i, i + CHUNK))
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      inserted: rowsToInsert.length,
      skipped: rows.length - rowsToInsert.length,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'import des factures' }, { status: 500 })
  }
}
