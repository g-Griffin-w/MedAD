import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const gold = '#b8860b'
const S = {
  page: { fontFamily: "'Georgia', serif", background: '#faf8f5', color: '#1a1a1a', minHeight: '100vh', padding: '48px 20px 80px' },
  wrap: { maxWidth: 900, margin: '0 auto' },
  logo: { fontFamily: "'Georgia', serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, textAlign: 'center' },
  logoSpan: { color: gold },
  sub: { textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 48 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 },
  card: (featured) => ({ background: featured ? '#fff' : '#faf8f5', border: featured ? `2px solid ${gold}` : '1px solid #e8e2d9', borderRadius: 8, padding: 32, position: 'relative', boxShadow: featured ? '0 4px 24px rgba(184,134,11,0.1)' : 'none' }),
  badge: { position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: gold, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' },
  planName: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  planDesc: { fontSize: 13, color: '#888', marginBottom: 20 },
  price: { fontSize: 48, fontWeight: 700, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em' },
  period: { fontSize: 13, color: '#888', marginBottom: 24 },
  features: { listStyle: 'none', marginBottom: 28 },
  feature: { fontSize: 14, color: '#555', padding: '8px 0', borderBottom: '1px solid #f0ebe2', display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5 },
  check: { color: gold, fontWeight: 700, flexShrink: 0 },
  btn: (featured) => ({ width: '100%', padding: 13, fontSize: 14, fontWeight: 600, fontFamily: "'Georgia', serif", background: featured ? gold : 'transparent', color: featured ? '#fff' : '#1a1a1a', border: featured ? 'none' : `1px solid #e8e2d9`, borderRadius: 6, cursor: 'pointer' }),
  note: { textAlign: 'center', fontSize: 13, color: '#aaa' },
}

const plans = [
  { id: 'starter', name: 'Starter', desc: 'For individual med spas', price: 49, gens: '30 generations/mo', features: ['30 ad generations per month', 'All ad types', 'All tones & styles', 'Google Drive export', 'Email support'] },
  { id: 'pro', name: 'Pro', desc: 'For growing med spas', price: 149, featured: true, gens: 'Unlimited', features: ['Unlimited ad generations', 'All ad types', 'All tones & styles', 'Priority support', 'Early access to new features'] },
  { id: 'agency', name: 'Agency', desc: 'For multi-location & agencies', price: 299, gens: 'Unlimited + 5 seats', features: ['Unlimited ad generations', 'Up to 5 user seats', 'All ad types & tones', 'White label options', 'Priority support', 'Dedicated account manager'] },
]

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState('')

  async function subscribe(plan) {
    if (!session) { router.push('/auth'); return }
    setLoading(plan)
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading('')
  }

  return (
    <>
      <Head><title>MedAd — Pricing</title></Head>
      <div style={S.page}>
        <div style={S.wrap}>
          <div style={S.logo}>Med<span style={S.logoSpan}>Ad</span></div>
          <p style={S.sub}>Simple pricing. One new client pays for months of service.</p>
          <div style={S.grid}>
            {plans.map(p => (
              <div key={p.id} style={S.card(p.featured)}>
                {p.featured && <div style={S.badge}>Most Popular</div>}
                <div style={S.planName}>{p.name}</div>
                <div style={S.planDesc}>{p.desc}</div>
                <div style={S.price}>${p.price}<span style={{ fontSize: 16, fontWeight: 400, color: '#888' }}>/mo</span></div>
                <div style={S.period}>{p.gens}</div>
                <ul style={S.features}>
                  {p.features.map(f => <li key={f} style={S.feature}><span style={S.check}>✓</span>{f}</li>)}
                </ul>
                <button style={S.btn(p.featured)} onClick={() => subscribe(p.id)} disabled={loading === p.id}>
                  {loading === p.id ? 'Loading...' : `Start ${p.name} →`}
                </button>
              </div>
            ))}
          </div>
          <p style={S.note}>Cancel anytime · No contracts · Payments secured by Stripe</p>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span onClick={() => router.push('/')} style={{ fontSize: 14, color: gold, cursor: 'pointer' }}>← Back to generator</span>
          </div>
        </div>
      </div>
    </>
  )
}
