import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/index'
import { IconLogo, IconHeadphones, IconBook, IconEdit, IconMic, IconZap, IconTarget, IconTrophy } from '../assets/icons/index'
import { useTheme } from '../context/ThemeContext'

// ── Data ─────────────────────────────────────────────────────────────────────
const modules = [
  {
    icon: <IconHeadphones size={24} color="#7c5cfc" />,
    label: 'Listening',
    color: '#7c5cfc',
    band: '7.5+',
    desc: 'Anti-distractor engine highlights answer traps in real time as audio plays.',
    detail: '4 sections · 40 questions · adaptive difficulty',
  },
  {
    icon: <IconBook size={24} color="#1fd9a0" />,
    label: 'Reading',
    color: '#1fd9a0',
    band: '8.0+',
    desc: 'Live synonym parser with split-screen view. Never lose your place again.',
    detail: '3 passages · 40 questions · time pressure mode',
  },
  {
    icon: <IconEdit size={24} color="#f9a825" />,
    label: 'Writing',
    color: '#f9a825',
    band: '7.0+',
    desc: 'Structure linter checks Overview, Thesis, and cohesion before you submit.',
    detail: 'Task 1 & 2 · AI scoring · band predictor',
  },
  {
    icon: <IconMic size={24} color="#f75c5c" />,
    label: 'Speaking',
    color: '#f75c5c',
    band: '7.5+',
    desc: 'AI fluency coach detects pauses over 2.2s and scores all 4 IELTS criteria.',
    detail: 'Parts 1–3 · real-time transcript · Gemini AI',
  },
]

const testimonials = [
  { name: 'Aisha K.', score: '8.0', from: '6.5', flag: '🇰🇿', quote: 'The pause detector in Speaking completely changed my approach. I had no idea how often I was hesitating.' },
  { name: 'Temur B.', score: '7.5', from: '6.0', flag: '🇺🇿', quote: 'Writing feedback showed me my Task Achievement was killing my score. Fixed it in 2 weeks.' },
  { name: 'Sara M.', score: '8.5', from: '7.0', flag: '🇰🇬', quote: 'Mock test mode under real time pressure was the only thing that actually prepared me.' },
]

const stats = [
  { value: '7.5→8.5', label: 'avg band improvement', icon: '📈' },
  { value: '64', label: 'students surveyed', icon: '👥' },
  { value: 'Band 9.0', label: 'expert verified', icon: '✅' },
  { value: '4', label: 'full modules', icon: '🎯' },
]

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className="theme-toggle" onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

// ── Score counter animation ───────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 40
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCurrent(target); clearInterval(timer) }
      else setCurrent(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [target])
  return <>{current}{suffix}</>
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const nav = useNavigate()
  const { theme } = useTheme()
  const [hoveredModule, setHoveredModule] = useState(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconLogo size={32} />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>
            IELTS <span style={{ color: 'var(--accent)' }}>AllInOne</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <Button variant="ghost" onClick={() => nav('/login')}>Sign in</Button>
          <Button onClick={() => nav('/register')}>Get started free →</Button>
        </div>
      </nav>

      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: '100px 24px 80px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {/* Background orbs */}
          <div style={{
            position: 'absolute', top: '-10%', left: '20%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,92,252,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '20%', right: '10%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,217,160,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
            {/* Badge */}
            <div className="fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 99,
              border: '1px solid rgba(124,92,252,0.35)',
              background: 'rgba(124,92,252,0.08)',
              marginBottom: 32,
            }}>
              <IconZap size={13} color="#7c5cfc" />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                AI-powered IELTS prep · Built for Central Asia
              </span>
            </div>

            {/* Headline */}
            <h1 className="fade-up-2" style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 'clamp(38px, 6vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              marginBottom: 24,
            }}>
              Your examiner is watching.<br />
              <span style={{
                background: 'linear-gradient(135deg, #7c5cfc, #1fd9a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Train smarter.
              </span>
            </h1>

            <p className="fade-up-3" style={{
              fontSize: 19, color: 'var(--text-secondary)',
              maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7,
            }}>
              The only IELTS platform that tracks <em>exactly</em> which mistakes you repeat — then eliminates them. Built with 64 students and a Band 9.0 examiner.
            </p>

            <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
              <Button onClick={() => nav('/register')} style={{ padding: '15px 40px', fontSize: 16, fontWeight: 600 }}>
                Start for free
              </Button>
              <Button variant="ghost" onClick={() => nav('/login')} style={{ padding: '15px 36px', fontSize: 16 }}>
                Sign in
              </Button>
            </div>

            {/* Stats bar */}
            <div style={{
              display: 'inline-grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              background: 'var(--bg-card)',
              borderRadius: 20, border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  padding: '20px 28px', textAlign: 'center',
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Modules ── */}
        <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
              Four modules
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Every part of IELTS. One platform.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              Each module has a dedicated AI coach — not generic feedback, but examiner-level analysis.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {modules.map((m, i) => (
              <div key={m.label}
                onMouseEnter={() => setHoveredModule(i)}
                onMouseLeave={() => setHoveredModule(null)}
                style={{
                  background: 'var(--bg-card)', border: `1px solid ${hoveredModule === i ? m.color : 'var(--border)'}`,
                  borderRadius: 20, padding: '28px 24px',
                  transition: 'all 0.2s',
                  transform: hoveredModule === i ? 'translateY(-4px)' : 'none',
                  cursor: 'default',
                  boxShadow: hoveredModule === i ? `0 12px 40px ${m.color}22` : 'none',
                }}
              >
                {/* Icon + band badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.icon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: m.color, background: `${m.color}15`, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.04em' }}>
                    avg {m.band}
                  </div>
                </div>

                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{m.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>{m.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: 10 }}>
              How it works
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 52 }}>
              Study smarter, not longer
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {[
                { step: '1', title: 'Diagnose', desc: 'Take a quick diagnostic test. The system maps your exact weak zones in each module.', color: '#7c5cfc' },
                { step: '2', title: 'Target', desc: 'Dashboard shows only what needs work. No wasted time on skills you already have.', color: '#1fd9a0' },
                { step: '3', title: 'Score', desc: 'AI feedback after every session. Watch your band score climb on the live leaderboard.', color: '#f9a825' },
              ].map(s => (
                <div key={s.step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `${s.color}20`, border: `2px solid ${s.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: s.color,
                  }}>
                    {s.step}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warning)', marginBottom: 10 }}>
              Student results
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40 }}>
              Real scores, real students
            </h2>

            <div style={{
              background: 'var(--bg-card)', borderRadius: 24, padding: '36px 40px',
              border: '1px solid var(--border)',
              minHeight: 180,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{
                  position: i === 0 ? 'relative' : 'absolute',
                  top: i === 0 ? 'auto' : 0, left: i === 0 ? 'auto' : 0,
                  width: '100%', padding: '36px 40px',
                  opacity: testimonialIdx === i ? 1 : 0,
                  transform: testimonialIdx === i ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  pointerEvents: testimonialIdx === i ? 'auto' : 'none',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 16, lineHeight: 1 }}>"</div>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                    {t.quote}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{t.flag}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Band {t.from} →</span>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--success)' }}>
                      {t.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {testimonials.map((_, i) => (
                <div key={i} onClick={() => setTestimonialIdx(i)} style={{
                  width: testimonialIdx === i ? 24 : 8, height: 8, borderRadius: 99,
                  background: testimonialIdx === i ? 'var(--accent)' : 'var(--border-soft)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          padding: '80px 24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(31,217,160,0.05) 100%)',
          borderTop: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Your exam date is coming.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Every day you wait is a day your weak zones stay weak. Start now — it's free.
          </p>
          <Button onClick={() => nav('/register')} style={{ padding: '16px 48px', fontSize: 17, fontWeight: 700 }}>
            Start for free →
          </Button>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            No credit card · No subscription · Just practice
          </div>
        </section>
      </main>

      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconLogo size={20} />
          <span>IELTS AllInOne — Future Code 2026</span>
        </div>
        <span>Қайырбек Нұрбек · NIS IB Astana</span>
      </footer>
    </div>
  )
}
