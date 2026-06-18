import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'
import SkillSphere from '../components/three/SkillSphere'
import { Button, Card, Badge } from '../components/ui/index'
import { IconHeadphones, IconBook, IconEdit, IconMic, IconZap, IconTarget, IconTrophy } from '../assets/icons/index'

function IconCalendar({ size=20, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}

const MODULES = [
  { key: 'listening', label: 'Listening', icon: <IconHeadphones size={20} color="#7c5cfc"/>, color: '#7c5cfc', path: '/listening' },
  { key: 'reading',   label: 'Reading',   icon: <IconBook size={20} color="#1fd9a0"/>,      color: '#1fd9a0', path: '/reading'   },
  { key: 'writing',   label: 'Writing',   icon: <IconEdit size={20} color="#f9a825"/>,       color: '#f9a825', path: '/writing'   },
  { key: 'speaking',  label: 'Speaking',  icon: <IconMic size={20} color="#f75c5c"/>,        color: '#f75c5c', path: '/speaking'  },
]

function ScoreBar({ value, color }) {
  const pct = value ? (value / 9) * 100 : 0
  return (
    <div style={{ height: 3, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}/>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, updateProfile } = useAuth()
  const nav = useNavigate()
  const [scores, setScores]           = useState({})
  const [recentTests, setRecentTests] = useState([])
  const [showWeekModal, setShowWeekModal] = useState(false)
  const [weeks, setWeeks]             = useState('')
  const [loadingScores, setLoadingScores] = useState(true)

  useEffect(() => {
    if (profile && !profile.weeks_to_exam) setShowWeekModal(true)
  }, [profile])

  useEffect(() => {
    if (!user) return
    fetchScores()
  }, [user])

  const fetchScores = async () => {
    setLoadingScores(true)
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) {
      // Latest score per module
      const latest = {}
      data.forEach(s => { if (!latest[s.module]) latest[s.module] = s.band })
      setScores(latest)
      setRecentTests(data.slice(0, 5))
    }
    setLoadingScores(false)
  }

  const saveWeeks = async () => {
    const w = parseInt(weeks)
    if (!w || w < 1) return
    await updateProfile({ weeks_to_exam: w })
    setShowWeekModal(false)
  }

  const overallBand = () => {
    const vals = Object.values(scores).filter(Boolean)
    if (!vals.length) return '—'
    return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1)
  }

  const nickname = profile?.nickname || profile?.username || user?.email?.split('@')[0] || '...'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dashboard</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em' }}>
              Hey, <span style={{ color: 'var(--accent)' }}>{nickname}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 5 }}>
              {profile?.weeks_to_exam ? `${profile.weeks_to_exam} weeks to exam — stay focused.` : 'Set your exam date to personalise your plan.'}
            </p>
          </div>
          <button onClick={() => setShowWeekModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            borderRadius: 10, border: '1px solid var(--border-soft)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
          >
            <IconCalendar size={14} color="var(--accent)"/>
            {profile?.weeks_to_exam ? `${profile.weeks_to_exam}w to exam` : 'Set exam date'}
          </button>
        </div>

        {/* Top grid */}
        <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 20 }}>

          {/* Sphere */}
          <Card glow style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', background: 'linear-gradient(160deg, var(--bg-card), #0f0f1e)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Skill sphere</div>
            <SkillSphere scores={scores} size={240}/>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {overallBand()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.04em' }}>OVERALL BAND</div>
            </div>
          </Card>

          {/* Module cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODULES.map(m => {
              const band = scores[m.key]
              return (
                <Card key={m.key}
                  style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', borderColor: 'var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                  onClick={() => nav(m.path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {m.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {band ? `Last: Band ${band}` : 'Not attempted'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {band && <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: m.color }}>{band}</span>}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                  <ScoreBar value={band} color={m.color}/>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { icon: <IconZap size={16} color="#7c5cfc"/>, label: 'XP earned', value: profile?.xp?.toLocaleString() || 0, color: '#7c5cfc' },
            { icon: <IconTarget size={16} color="#1fd9a0"/>, label: 'Tests done', value: recentTests.length, color: '#1fd9a0' },
            { icon: <IconTrophy size={16} color="#f9a825"/>, label: 'Day streak', value: profile?.streak || 0, color: '#f9a825' },
          ].map(s => (
            <Card key={s.label} style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        {recentTests.length > 0 && (
          <div className="fade-up-4">
            <Card>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Recent activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentTests.map(t => {
                  const m = MODULES.find(x => x.key === t.module)
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${m?.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {m?.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{t.module}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: m?.color }}>
                        {t.band}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* CTA row */}
        <div className="fade-up-4" style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card style={{ background: 'linear-gradient(135deg, rgba(31,217,160,0.1), rgba(31,217,160,0.03))', borderColor: 'rgba(31,217,160,0.25)', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => nav('/mock')}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1fd9a0'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(31,217,160,0.25)'}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1fd9a0', background: 'rgba(31,217,160,0.12)', padding: '2px 8px', borderRadius: 99, letterSpacing: '0.06em' }}>FULL TEST</div>
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Academic Mock Test 1</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>All 4 modules · Real IELTS structure</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1fd9a0" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Card>

          <Card style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.1), rgba(124,92,252,0.03))', borderColor: 'rgba(124,92,252,0.2)', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 3 }}>Listening practice</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Anti-distractor engine active</div>
            </div>
            <Button onClick={() => nav('/listening')} style={{ flexShrink: 0 }}>
              <IconHeadphones size={14} color="#fff"/> Start
            </Button>
          </Card>
        </div>
      </main>

      {/* Week modal */}
      {showWeekModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
          <div className="fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, width: 380, textAlign: 'center' }}>
            <IconCalendar size={40} color="var(--accent)"/>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, margin: '16px 0 8px' }}>How many weeks to your exam?</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Personalises your dashboard and study plan.</p>
            <input type="number" min="1" max="52" placeholder="e.g. 6"
              value={weeks} onChange={e => setWeeks(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveWeeks()}
              autoFocus
              style={{ width: '100%', padding: '14px', marginBottom: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 20, textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, outline: 'none' }}
            />
            <Button fullWidth onClick={saveWeeks}>Save & continue</Button>
            <button onClick={() => setShowWeekModal(false)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>Skip</button>
          </div>
        </div>
      )}
    </div>
  )
}
