import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui/index'
import { IconLogo, IconUser, IconLock, IconAtSign } from '../assets/icons/index'

const STEPS = [
  { key:'username', label:'Username',     type:'text',     placeholder:'e.g. nurbek_k',         icon:'@', hint:'Letters, numbers, underscores only', validate: v => !v.trim() ? 'Enter a username' : v.length < 3 ? 'Min 3 characters' : !/^[a-zA-Z0-9_]+$/.test(v) ? 'Letters, numbers, underscores only' : '' },
  { key:'password', label:'Password',     type:'password', placeholder:'••••••••',               icon:'lock', hint:'Min 6 characters', validate: v => !v ? 'Enter a password' : v.length < 6 ? 'Min 6 characters' : '' },
  { key:'nickname', label:'Display name', type:'text',     placeholder:'How others see you',     icon:'user', hint:'Shown on leaderboard', validate: v => !v.trim() ? 'Enter a nickname' : v.length < 2 ? 'Min 2 characters' : '' },
]

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState({ username:'', password:'', nickname:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]:'' })) }

  const next = async () => {
    const s = STEPS[step]
    const err = s.validate(form[s.key])
    if (err) { setErrors(e => ({ ...e, [s.key]: err })); return }

    if (step < STEPS.length - 1) { setStep(x => x+1); return }

    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.error) { setErrors({ nickname: result.error }); return }
    nav('/dashboard')
  }

  const currentStep = STEPS[step]

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg-primary)' }}>
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:40 }}>
          <IconLogo size={44}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, marginTop:12, letterSpacing:'-0.03em' }}>
            IELTS <span style={{ color:'var(--accent)' }}>AllInOne</span>
          </span>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:32 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= step ? 'var(--accent)' : 'var(--border-soft)', transition:'background 0.3s' }}/>
          ))}
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--bg-card)', color: i <= step ? '#fff' : 'var(--text-muted)', border:`1px solid ${i <= step ? 'transparent' : 'var(--border-soft)'}`, transition:'all 0.3s' }}>
                {i < step ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
              </div>
              {i < STEPS.length-1 && <div style={{ width:20, height:1, background: i < step ? 'var(--success)' : 'var(--border-soft)', transition:'background 0.3s' }}/>}
            </div>
          ))}
          <span style={{ fontSize:13, color:'var(--text-secondary)', marginLeft:4 }}>{STEPS[step].label}</span>
        </div>

        {/* Card */}
        <div className="fade-up" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:24, padding:'36px 32px' }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, marginBottom:6, letterSpacing:'-0.02em' }}>
            {step === 0 && 'Choose your username'}
            {step === 1 && 'Set a password'}
            {step === 2 && 'Pick a display name'}
          </h2>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:28 }}>{currentStep.hint}</p>

          <div style={{ marginBottom:24 }}>
            <Input
              label={currentStep.label}
              placeholder={currentStep.placeholder}
              type={currentStep.type}
              icon={currentStep.icon === '@' ? <IconAtSign size={15} color="var(--text-muted)"/> : currentStep.icon === 'lock' ? <IconLock size={15} color="var(--text-muted)"/> : <IconUser size={15} color="var(--text-muted)"/>}
              value={form[currentStep.key]}
              error={errors[currentStep.key]}
              onChange={e => set(currentStep.key, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && next()}
              autoFocus
            />
          </div>

          <Button fullWidth loading={loading} onClick={next}>
            {step < STEPS.length-1 ? 'Continue →' : 'Create account'}
          </Button>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
