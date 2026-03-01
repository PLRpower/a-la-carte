import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature!, endpointSecret)
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode === 'subscription') {
          const userId = session.client_reference_id
          if (userId) {
            await supabaseAdmin.from('profiles').update({
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active'
            }).eq('id', userId)
          }
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const status = subscription.status

        let currentPeriodEnd = null
        const endTimestamp = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end
        if (endTimestamp) {
          currentPeriodEnd = new Date(endTimestamp * 1000).toISOString()
        }

        let planId = null
        if (subscription.items?.data?.length > 0) {
          planId = subscription.items.data[0].price?.id || subscription.items.data[0].plan?.id
        }

        await supabaseAdmin.from('profiles').update({
          subscription_status: status,
          current_period_end: currentPeriodEnd,
          plan_id: planId,
          stripe_subscription_id: subscription.id
        }).eq('stripe_customer_id', customerId)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        await supabaseAdmin.from('profiles').update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
          plan_id: null
        }).eq('stripe_customer_id', customerId)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        if (invoice.subscription) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active'
          }).eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        if (invoice.subscription) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due'
          }).eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error('Webhook error:', error)
    return new Response(
      `Webhook handler failed: ${error.message}`,
      { status: 500 }
    )
  }
})
