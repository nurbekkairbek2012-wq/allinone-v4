import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui/index'
import { IconLogo, IconUser, IconLock } from '../assets/icons/index'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const submit = async () => {
    if (!form.username || !form.password) { setError('Fill in both fields'); return }
    setLoading(true)
    const result = await login(form)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    nav('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg-primary)' }}>
      {/* Left panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        {/* Glow */}
        <div style={{ position:'fixed', top:'30%', left:'30%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:44 }}>
            <IconLogo size={44}/>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, marginTop:12, letterSpacing:'-0.03em' }}>
              IELTS <span style={{ color:'var(--accent)' }}>AllInOne</span>
            </span>
            <span style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Smart prep platform</span>
          </div>

          <div className="fade-up" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:24, padding:'36px 32px' }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, marginBottom:6, letterSpacing:'-0.02em' }}>Welcome back</h2>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:28 }}>Sign in to continue your prep.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
              <Input label="Username" placeholder="your_username" type="text"
                icon={<IconUser size={15} color="var(--text-muted)"/>}
                value={form.username} onChange={e => set('username', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
              />
              <Input label="Password" placeholder="••••••••" type="password"
                icon={<IconLock size={15} color="var(--text-muted)"/>}
                value={form.password} onChange={e => set('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {error && (
              <div style={{ background:'rgba(247,92,92,0.08)', border:'1px solid rgba(247,92,92,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--error)' }}>
                {error}
              </div>
            )}

            <Button fullWidth loading={loading} onClick={submit}>Sign in</Button>
          </div>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-secondary)' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Create one</Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div style={{ width:420, background:'var(--bg-secondary)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', gap:20 }}>
        {[
          { color:'#7c5cfc', label:'Listening', desc:'Anti-distractor engine' },
          { color:'#1fd9a0', label:'Reading',   desc:'Live synonym parser' },
          { color:'#f9a825', label:'Writing',   desc:'Structure linter' },
          { color:'#f75c5c', label:'Speaking',  desc:'AI fluency coach' },
        ].map(m => (
          <div key={m.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'var(--bg-card)', borderRadius:14, border:'1px solid var(--border)' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${m.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:m.color }}/>
            </div>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14 }}>{m.label}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{m.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop:8, padding:'16px 18px', background:'var(--accent-dim)', borderRadius:14, border:'1px solid rgba(124,92,252,0.2)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--accent)', marginBottom:4, letterSpacing:'0.06em' }}>FUTURE CODE 2026</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>Built by Қайырбек Нұрбек · NIS IB Astana</div>
        </div>
      </div>
    </div>
  )
}
