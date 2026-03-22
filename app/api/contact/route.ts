import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { nom, email, sujet, message } = await request.json()

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    await getResend().emails.send({
      from: 'ManaFlow <onboarding@resend.dev>',
      to: 'contact@manaflow.fr',
      replyTo: email,
      subject: `[Contact] ${sujet}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F9FAFB; border-radius: 12px;">
          <h2 style="color: #111; margin-bottom: 24px;">Nouveau message de contact</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 100px;">Nom</td><td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${nom}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Sujet</td><td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${sujet}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
            <p style="color: #111; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API /contact]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Réessayez plus tard.' }, { status: 500 })
  }
}
