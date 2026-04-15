import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, clinicName } = await req.json();
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return Response.json({ ok: false, error: 'No Brevo key' });

    // 1. Add contact to Brevo
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          CLINIC: clinicName,
        },
        listIds: [2], // default list — change to your list ID in Brevo
        updateEnabled: true,
      }),
    });

    // 2. Send welcome email via Brevo
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Vetaia', email: 'kamilassari@gmail.com' },
        to: [{ email, name: `${firstName} ${lastName}` }],
        subject: 'Bienvenue sur Vetaia 🐾',
        htmlContent: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111D1B;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 22px; font-weight: 600; color: #111D1B;">Vet<span style="color: #0B7A6A;">aia</span></span>
            </div>
            <h1 style="font-size: 24px; font-weight: 400; color: #111D1B; margin-bottom: 12px;">
              Bienvenue, Dr. ${firstName} ${lastName} 👋
            </h1>
            <p style="font-size: 15px; color: #4A6460; line-height: 1.7; margin-bottom: 24px;">
              Votre compte Vetaia est activé. Vous pouvez dès maintenant vous connecter et générer vos premiers comptes-rendus vétérinaires en 30 secondes.
            </p>
            <a href="https://leash-ai-website.vercel.app/login" style="display: inline-block; background: #0B7A6A; color: white; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 500;">
              Accéder à mon espace →
            </a>
            <p style="font-size: 13px; color: #B5AFA6; margin-top: 40px; line-height: 1.6;">
              Une question ? Répondez directement à cet email.<br/>
              Clinique enregistrée : <strong>${clinicName}</strong>
            </p>
          </div>
        `,
      }),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[api/register]', err);
    return Response.json({ ok: false });
  }
}
