# MedAd — AI Ad Creative for Med Spas

## Step 1 — Create Supabase Table

Go to Supabase → SQL Editor → New Query → paste and run:

```sql
CREATE TABLE medad_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  generations_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE medad_users DISABLE ROW LEVEL SECURITY;
```

## Step 2 — Upload to GitHub
Create a new repo called `medad` and upload all files.

## Step 3 — Add Environment Variables in Vercel

```
ANTHROPIC_API_KEY=your_medad_anthropic_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-medad-url.vercel.app
STRIPE_SECRET_KEY=your_medad_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_medad_stripe_publishable_key
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (add after deploy)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

## Step 4 — Deploy on Vercel
Connect repo → add env vars → deploy.

## Step 5 — Set Up Stripe Webhook (after deploy)
stripe.com → Developers → Webhooks → Add endpoint
URL: https://your-medad-url.vercel.app/api/webhook
Events: checkout.session.completed, customer.subscription.deleted
Copy webhook secret → add as STRIPE_WEBHOOK_SECRET → redeploy
