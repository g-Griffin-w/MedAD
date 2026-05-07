import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]" { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const gold = '#b8860b'
const FREE_LIMIT = 3

const TREATMENTS = ['Botox / Neuromodulators', 'Dermal Fillers', 'Laser Hair Removal', 'Chemical Peels', 'Microneedling', 'CoolSculpting / Body Contouring', 'HydraFacial', 'PRP / Hair Restoration', 'IV Therapy', 'Skin Tightening', 'Permanent Makeup', 'Custom / Other']
const AD_TYPES = ['Instagram / Facebook ad', 'Google search ad', 'TikTok video script', 'Static ad concept', 'Email campaign', 'SMS / text message ad']
const TONES = ['Luxurious & aspirational', 'Warm & welcoming', 'Clinical & trustworthy', 'Urgent & promotional', 'Playful & friendly']
const QUANTITIES = [1, 3, 5]

const S = {
  page: { fontFamily: "'Georgia', serif", background: '#faf8f5', color: '#1a1a1a', minHeight: '100vh' },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '0 20px 80px' },
  header: { padding: '28px 0 24px', borderBottom: '1px solid #e8e2d9', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontFamily: "'Georgia', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' },
  logoSpan: { color: gold },
  lbl: { fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 },
  inp: { width: '100%', padding: '10px 12px', fontSize: 14, background: '#fff', color: '#1a1a1a', border: '1px solid #e8e2d9', borderRadius: 6, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  secTag: { fontSize: 11, fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 },
  pill: (on) => ({ padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: on ? `1.5px solid ${gold}` : '1px solid #e8e2d9', background: on ? gold : '#fff', color: on ? '#fff' : '#555', fontFamily: 'inherit', fontWeight: on ? 600 : 400 }),
  qty: (on) => ({ padding: '7px 18px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: on ? `1.5px solid ${gold}` : '1px solid #e8e2d9', background: on ? gold : '#fff', color: on ? '#fff' : '#555', fontFamily: 'inherit', fontWeight: on ? 600 : 400 }),
  genBtn: (loading) => ({ width: '100%', padding: 14, fontSize: 16, fontWeight: 700, fontFamily: "'Georgia', serif", background: loading ? '#d4b85a' : gold, color: '#fff', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }),
  outBox: { marginTop: 28, background: '#fff', border: '1px solid #e8e2d9', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  outHead: { padding: '14px 20px', borderBottom: '1px solid #e8e2d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf9f2', borderRadius: '8px 8px 0 0' },
  outBody: { padding: '24px 20px', fontSize: 14, lineHeight: 1.85, color: '#1a1a1a', whiteSpace: 'pre-wrap' },
  outFoot: { padding: '14px 20px', borderTop: '1px solid #e8e2d9', display: 'flex', gap: 10 },
  actBtn: (active) => ({ padding: '8px 18px', fontSize: 13, borderRadius: 6, border: '1px solid #e8e2d9', background: active ? gold : '#fff', color: active ? '#fff' : '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 600 : 400 }),
  navBtn: { fontSize: 13, color: '#888', background: 'transparent', border: '1px solid #e8e2d9', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' },
  upgradeBtn: { fontSize: 13, color: '#fff', background: gold, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 },
  err: { marginTop: 16, padding: '12px 14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 6, fontSize: 14, color: '#c00' },
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spaName, setSpaName] = useState('')
  const [treatment, setTreatment] = useState(TREATMENTS[0])
  const [offer, setOffer] = useState('')
  const [location, setLocation] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const [notes, setNotes] = useState('')
  const [adType, setAdType] = useState(AD_TYPES[0])
  const [qty, setQty] = useState(1)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState(null)

  const plan = session?.user?.plan || 'free'
  const isPaid = plan !== 'free'
  const usedGens = session?.user?.generationsUsed || 0
  const freeLeft = remaining !== null ? remaining : Math.max(0, FREE_LIMIT - usedGens)

  async function generate() {
    if (!session) { router.push('/auth'); return }
    setLoading(true); setOutput(''); setError(''); setCopied(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaName, treatment, offer, location, audience, tone, notes, adType, qty })
      })
      const data = await res.json()
      if (res.status === 403) { router.push('/pricing'); setLoading(false); return }
      if (!res.ok) throw new Error(data.error)
      setOutput(data.output)
      if (data.remaining !== undefined) setRemaining(data.remaining)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <>
      <Head>
        <title>MedAd — AI Ad Creative for Med Spas</title>
        <meta name="description" content="Generate high-converting ad creatives for your med spa in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={S.page}>
        <div style={S.wrap}>
          <header style={S.header}>
            <div>
              <span style={S.logo}>Med<span style={S.logoSpan}>Ad</span></span>
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 10 }}>AI Ad Creative for Med Spas</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {session ? (
                <>
                  {!isPaid && <span style={{ fontSize: 13, color: '#888' }}>{freeLeft} free left</span>}
                  {!isPaid && <button style={S.upgradeBtn} onClick={() => router.push('/pricing')}>Upgrade</button>}
                  {isPaid && <span style={{ fontSize: 13, color: gold, fontWeight: 600 }}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>}
                  <button style={S.navBtn} onClick={() => signOut()}>Sign out</button>
                </>
              ) : (
                <button style={S.upgradeBtn} onClick={() => router.push('/auth')}>Sign in</button>
              )}
            </div>
          </header>

          {router.query.success && (
            <div style={{ marginBottom: 24, padding: '14px 16px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 6, fontSize: 14, color: '#166534' }}>
              🎉 Welcome to {plan}! Your plan is now active.
            </div>
          )}

          {/* Spa Info */}
          <div style={{ marginBottom: 20 }}>
            <span style={S.secTag}>Your med spa</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <span style={S.lbl}>Spa / Clinic name *</span>
                <input style={S.inp} value={spaName} onChange={e => setSpaName(e.target.value)} placeholder="e.g. Glow Aesthetics" />
              </div>
              <div>
                <span style={S.lbl}>Location</span>
                <input style={S.inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Scottsdale, AZ" />
              </div>
              <div>
                <span style={S.lbl}>Treatment / Service</span>
                <select style={S.inp} value={treatment} onChange={e => setTreatment(e.target.value)}>
                  {TREATMENTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <span style={S.lbl}>Current offer / promo</span>
                <input style={S.inp} value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. $199 first Botox treatment" />
              </div>
              <div>
                <span style={S.lbl}>Target audience</span>
                <input style={S.inp} value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Women 30-55, professionals" />
              </div>
              <div>
                <span style={S.lbl}>Tone</span>
                <select style={S.inp} value={tone} onChange={e => setTone(e.target.value)}>
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={S.lbl}>Additional notes (optional)</span>
                <textarea style={{ ...S.inp, minHeight: 68, resize: 'vertical' }} value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Mention FDA-approved, no downtime, results last 3-4 months, summer special..." />
              </div>
            </div>
          </div>

          {/* Ad Type */}
          <div style={{ marginBottom: 16 }}>
            <span style={S.secTag}>Ad type</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AD_TYPES.map(t => <button key={t} onClick={() => setAdType(t)} style={S.pill(adType === t)}>{t}</button>)}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 24 }}>
            <span style={S.secTag}>Quantity</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {QUANTITIES.map(q => <button key={q} onClick={() => setQty(q)} style={S.qty(qty === q)}>{q} ad{q > 1 ? 's' : ''}</button>)}
            </div>
          </div>

          <button onClick={generate} disabled={loading} style={S.genBtn(loading)}>
            {loading ? 'Generating your ad...' : `Generate ${qty} ${adType}${qty > 1 ? 's' : ''} →`}
          </button>

          {!session && (
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#aaa' }}>
              <span onClick={() => router.push('/auth')} style={{ color: gold, cursor: 'pointer' }}>Sign up free</span> — 3 ad generations included, no credit card needed
            </p>
          )}

          {error && <div style={S.err}>{error}</div>}

          {output && !loading && (
            <div style={S.outBox}>
              <div style={S.outHead}>
                <span style={{ fontSize: 12, fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {qty} {adType}{qty > 1 ? 's' : ''} — {spaName}
                </span>
                <span style={{ fontSize: 12, color: '#aaa' }}>{tone}</span>
              </div>
              <div style={S.outBody}>{output}</div>
              <div style={S.outFoot}>
                <button onClick={copy} style={S.actBtn(copied)}>{copied ? 'Copied!' : 'Copy'}</button>
                <button onClick={() => { setOutput(''); setNotes('') }} style={S.actBtn(false)}>Clear</button>
                <button onClick={generate} style={S.actBtn(false)}>Regenerate ↺</button>
                {!isPaid && freeLeft <= 1 && (
                  <button onClick={() => router.push('/pricing')} style={{ ...S.actBtn(false), marginLeft: 'auto', background: gold, color: '#fff', border: 'none', fontWeight: 600 }}>
                    Upgrade for unlimited →
                  </button>
                )}
              </div>
            </div>
          )}

          <footer style={{ marginTop: 56, paddingTop: 20, borderTop: '1px solid #e8e2d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#ccc', fontFamily: "'Georgia', serif" }}>Med<span style={{ color: gold }}>Ad</span></span>
            <span onClick={() => router.push('/pricing')} style={{ fontSize: 13, color: '#ccc', cursor: 'pointer' }}>Pricing</span>
          </footer>
        </div>
      </div>
    </>
  )
}
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  return {
    props: {
      session: session || null,
    }
  }
}}
