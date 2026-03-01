import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, familyId, shareCode } = await req.json()

    if (!email || !familyId || !shareCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'À la carte <onboarding@resend.dev>',
        to: email, // If not verified domain, resend limits this to the dev's email only
        subject: "Invitation à rejoindre une famille sur À la carte",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #4CAF50;">Bienvenue sur À la carte !</h1>
            <p style="font-size: 16px; color: #333;">
              On vous a invité à rejoindre une famille pour partager des recettes, des ingrédients et votre liste de courses.
            </p>
            <div style="margin: 30px 0;">
              <a href="https://a-la-carte-app.com/?family_code=${shareCode}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Rejoindre la famille
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Si vous n'avez pas encore de compte, vous serez invité à en créer un.<br/>
              Si le bouton ne fonctionne pas, copiez ce lien : <br/>
              <a href="https://a-la-carte-app.com/?family_code=${shareCode}">https://a-la-carte-app.com/?family_code=${shareCode}</a>
            </p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
  } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
