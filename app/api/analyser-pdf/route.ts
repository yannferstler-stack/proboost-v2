import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '../../lib/auth'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function POST(request: NextRequest) {
  // ── Auth : seuls les utilisateurs connectés peuvent analyser un PDF ──
  const userId = await getAuthUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    // ── Validation du fichier ──
    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Analyse cette facture et extrais les informations suivantes en JSON uniquement, sans texte autour.
Règles :
- "montant" doit être un nombre décimal (ex: 1500.00), pas une chaîne.
- Les dates doivent être au format YYYY-MM-DD.
- Si une information est absente, mets null.
- Si pas de date d'échéance, utilise la date de facture + 30 jours.

{
  "numero_facture": "numéro ou référence de la facture",
  "client_nom": "nom du client ou de la société débitrice",
  "client_email": "email du client si présent sinon null",
  "client_telephone": "téléphone du client si présent sinon null",
  "montant": 0.00,
  "date_facture": "YYYY-MM-DD",
  "date_echeance": "YYYY-MM-DD"
}`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extraction JSON robuste : chercher le premier { … } dans la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Analyse PDF : pas de JSON trouvé dans la réponse Claude:', text)
      return NextResponse.json({ error: 'Impossible d\'extraire les données de la facture' }, { status: 422 })
    }

    const data = JSON.parse(jsonMatch[0])

    // Normaliser montant en nombre
    if (typeof data.montant === 'string') {
      data.montant = parseFloat(data.montant.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
    }

    return NextResponse.json(data)
  } catch (error: any) {
    const raw = error?.message || ''
    console.error('Erreur analyse PDF:', raw)
    const message = error?.status === 401
      ? 'Clé API Anthropic invalide — vérifiez ANTHROPIC_API_KEY'
      : error?.status === 404
        ? 'Modèle IA indisponible — vérifiez le nom du modèle'
        : raw.toLowerCase().includes('credit') || raw.toLowerCase().includes('balance')
          ? 'Crédits Anthropic insuffisants — rechargez sur console.anthropic.com'
          : raw.toLowerCase().includes('rate') || raw.toLowerCase().includes('limit')
            ? 'Limite d\'appels API atteinte — réessayez dans quelques instants'
            : 'Erreur lors de l\'analyse du PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
