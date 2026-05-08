import Stripe from 'stripe'
import { supabaseAdmin } from '../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Webhook signature error:', e.message)
    return res.status(400).send(`Webhook Error: ${e.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const customerId = session.customer
      const plan = session.metadata?.plan || 'starter'
      const userId = session.metadata?.userId

      if (userId) {
        await supabaseAdmin
          .from('medad_users')
          .update({ plan, stripe_customer_id: customerId })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer
      const status = subscription.status
      const priceId = subscription.items.data[0]?.price?.id

      let plan = 'free'
      if (status === 'active') {
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'
        else if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) plan = 'agency'
        else plan = 'starter'
      }

      await supabaseAdmin
        .from('medad_users')
        .update({ plan })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer

      await supabaseAdmin
        .from('medad_users')
        .update({ plan: 'free' })
        .eq('stripe_customer_id', customerId)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.status(200).json({ received: true })
}
