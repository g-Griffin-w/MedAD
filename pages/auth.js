import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const S = {
  page: { fontFamily: "'Georgia', serif", background: '#faf8f5', color: '#1a1a1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #e8e2d9', borderRadius: 8, padding: 40, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoText: { fontFamily: "'Georgia', serif", fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' },
  logoSpan: { color: '#b8860b' },
  tagline: { fontSize: 13, color: '#888', marginTop: 4 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 },
  inp: { width: '100%', padding: '10px 12px', fontSize: 14, background: '#faf8f5', color: '#1a1a1a', border: '1px solid #e8e2d9', borderRadius: 6, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn: { width: '100%', padding: 13, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', background: '#b8860b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  err: { fontSize: 13, color: '#c00', marginBottom: 12, padding: '8px 12px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 4 },
  switch: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' },
  switchLink: { color: '#b8860b', cursor: 'pointer', fontWeight: 500 },
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    setError(''); setLoading(true)
    if (mode === 'register') {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
    }
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('Invalid email or password'); setLoading(false); return }
    router.push('/')
  }

  return (
    <>
      <Head><title>MedAd — {mode === 'login' ? 'Sign In' : 'Create Account'}</title></Head>
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.logo}>
            <div style={S.logoText}>Med<span style={S.logoSpan}>Ad</span></div>
            <div style={S.tagline}>AI Ad Creative for Med Spas</div>
          </div>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <span style={S.lbl}>Your name</span>
              <input style={S.inp} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <span style={S.lbl}>Email</span>
            <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@medspa.com" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={S.lbl}>Password</span>
            <input style={S.inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          {error && <div style={S.err}>{error}</div>}
          <button style={S.btn} onClick={submit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </button>
          <div style={S.switch}>
            {mode === 'login' ? <>No account? <span style={S.switchLink} onClick={() => setMode('register')}>Sign up free</span></> : <>Have an account? <span style={S.switchLink} onClick={() => setMode('login')}>Sign in</span></>}
          </div>
          {mode === 'register' && <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>3 free ad generations included. No credit card required.</p>}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
