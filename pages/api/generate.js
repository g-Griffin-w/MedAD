import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { supabaseAdmin } from '../../lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMITS = { free: 3, starter: 30, pro: -1, agency: -1 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Please sign in to generate ads' })

  const { data: user } = await supabaseAdmin
    .from('medad_users').select('*').eq('id', session.user.id).single()

  const limit = PLAN_LIMITS[user.plan] || 3
  if (limit !== -1 && user.generations_used >= limit) {
    return res.status(403).json({ error: 'limit_reached', message: `You've used all your generations. Upgrade to continue.` })
  }

  const { treatment, offer, location, audience, tone, adType, qty, spaName, notes } = req.body
  if (!spaName || !adType) return res.status(400).json({ error: 'Missing required fields' })

  const prompt = `You are an expert advertising copywriter specializing in med spa and aesthetic clinic marketing. Generate ${qty || 1} ${adType}${(qty || 1) > 1 ? 's' : ''} for the following med spa.

Business: ${spaName}
${location ? `Location: ${location}` : ''}
${treatment ? `Treatment/Service: ${treatment}` : ''}
${offer ? `Current offer: ${offer}` : ''}
${audience ? `Target audience: ${audience}` : ''}
Tone: ${tone || 'Luxurious & aspirational'}
${notes ? `Notes: ${notes}` : ''}

Format rules:
- Instagram/Facebook: Visual concept, Headline, Body copy (2-3 sentences), CTA
- Google Search: 3 Headlines (max 30 chars each), 2 Descriptions (max 90 chars each)
- TikTok Script: Hook (0-3sec), Body (3-25sec shot by shot), CTA (last 5sec)
- Static Ad Concept: Visual description, Headline, Subtext, CTA button text
- Email Campaign: Subject line, Preview text, Opening line, Body (3-4 sentences), CTA
- SMS: Under 160 characters total

${(qty || 1) > 1 ? `Label each as AD 1, AD 2 etc. with a divider line between them.` : ''}
Write ONLY the ad content. No intro, no explanation. Start directly with the ad.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    await supabaseAdmin
      .from('medad_users')
      .update({ generations_used: user.generations_used + 1 })
      .eq('id', user.id)

    const remaining = limit === -1 ? -1 : limit - (user.generations_used + 1)
    return res.status(200).json({ output: message.content[0].text, remaining, plan: user.plan })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to generate. Try again.' })
  }
}
