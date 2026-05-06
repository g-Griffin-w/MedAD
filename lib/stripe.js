import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

export const PLANS = {
  free: { name: 'Free', price: 0, generations: 3 },
  starter: { name: 'Starter', price: 49, priceId: process.env.STRIPE_STARTER_PRICE_ID, generations: 30 },
  pro: { name: 'Pro', price: 149, priceId: process.env.STRIPE_PRO_PRICE_ID, generations: -1 },
  agency: { name: 'Agency', price: 299, priceId: process.env.STRIPE_AGENCY_PRICE_ID, generations: -1 },
}
