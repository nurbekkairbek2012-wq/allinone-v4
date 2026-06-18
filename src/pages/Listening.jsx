import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card, Badge } from '../components/ui/index'
import { IconHeadphones, IconTarget, IconChevronRight } from '../assets/icons/index'

// ─── MOCK TEST DATA ──────────────────────────────────────────────────────────
// Replace AUDIO_SRC with your actual MP4/MP3 path after recording
const AUDIO_SRC = null // e.g. '/audio/listening_test_1.mp4'

const TRANSCRIPT = [
  { id: 0, text: "Good morning and welcome to the Riverside Community Centre. My name is Sandra and I'll be taking your details today.", distractor: false },
  { id: 1, text: "Could I take your name first please? And could you spell that for me?", distractor: false },
  { id: 2, text: "The membership fee is currently forty-five pounds per month —", distractor: true, trap: "forty-five" },
  { id: 3, text: "— sorry, I should say thirty-five pounds. We updated our pricing last week.", distractor: false, correction: "thirty-five" },
  { id: 4, text: "Sessions run Monday to Friday, from six AM to nine PM.", distractor: false },
  { id: 5, text: "We also open on Saturdays — well, actually that's changed. We're closed Saturdays now due to renovation.", distractor: true, trap: "open on Saturdays", correction: "closed Saturdays" },
  { id: 6, text: "The swimming pool is on the ground floor, next to the café.", distractor: false },
  { id: 7, text: "The gym is on the second floor — no wait, they've moved it to the third floor since the refurbishment.", distractor: true, trap: "second floor", correction: "third floor" },
  { id: 8, text: "To register, you'll need to bring two forms of ID and a recent utility bill.", distractor: false },
  { id: 9, text: "Classes start on the fifteenth — actually it's the seventeenth, I apologise.", distractor: true, trap: "fifteenth", correction: "seventeenth" },
]

const QUESTIONS = [
  {
    id: 1, type: 'form',
    instruction: 'Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
    fields: [
      { label: 'Monthly membership fee', answer: '35', hint: 'Listen for a correction — the speaker changes their mind.' },
      { label: 'Opening hours (Mon–Fri)', answer: '6 AM to 9 PM', hint: null },
      { label: 'Weekend availability', answer: 'closed', hint: 'The speaker initially says open — listen for the update.' },
      { label: 'Gym location (floor)', answer: 'third', hint: 'Watch for a self-correction from the speaker.' },
      { label: 'Classes start on (date)', answer: '17th / seventeenth', hint: 'Another correction — the first date is a distractor.' },
    ]
  },
  {
    id: 2, type: 'map',
    instruction: 'Label the map. Choose from the options below.',
    mapItems: [
      { id: 'A', correct: 'Swimming pool', options: ['Gym', 'Swimming pool', 'Café', 'Reception'] },
      { id: 'B', correct: 'Café', options: ['Gym', 'Swimming pool', 'Café', 'Reception'] },
      { id: 'C', correct: 'Gym', options: ['Gym', 'Swimming pool', 'Café', 'Reception'] },
    ]
  }
]

const SECTION_LABELS = ['Form completion', 'Map labeling']

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Listening() {
  const nav = useNavigate()
  const { saveScore } = useAuth()
  const audioRef = useRef(null)

  const [phase, setPhase] = useState('intro') // intro | test | results
  const [activeSection, setActiveSection] = useState(0)
  const [formAnswers, setFormAnswers] = useState({})
  const [mapAnswers, setMapAnswers] = useState({})
  const [revealedDistractors, setRevealedDistractors] = useState([])
  const [showHints, setShowHints] = useState(false)
  const [score, setScore] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioTime, setAudioTime] = useState(0)

  // Toggle distractor highlight
  const toggleDistractor = (id) => {
    setRevealedDistractors(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Calculate score
  const submit = () => {
    let correct = 0, total = 0
    // Form
    QUESTIONS[0].fields.forEach((f, i) => {
      total++
      const ans = (formAnswers[i] || '').toLowerCase().trim()
      if (f.answer.toLowerCase().includes(ans) && ans.length > 0) correct++
    })
    // Map
    QUESTIONS[1].mapItems.forEach(item => {
      total++
      if (mapAnswers[item.id] === item.correct) correct++
    })
    const band = Math.min(9, Math.max(1, ((correct / total) * 8 + 1))).toFixed(1)
    setScore({ correct, total, band })
    setPhase('results')
    saveScore({ module: 'listening', band: parseFloat(band), correct, total })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <div className="fade-up" style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Module</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8 }}>
              <span style={{ color: '#7c5cfc' }}>Listening</span> Mock Test 1
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 36 }}>
              Riverside Community Centre — Form completion &amp; Map labeling
            </p>

            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 24 }}>
                {[['2', 'sections'], ['8', 'questions'], ['~30', 'minutes']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: '#7c5cfc' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ marginBottom: 20, borderColor: 'rgba(124,92,252,0.25)', background: 'rgba(124,92,252,0.04)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTarget size={16} color="#7c5cfc" />
                Anti-distractor engine active
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                While you listen, click on any transcript segment you think is a <strong>distractor</strong> (speaker corrects themselves). Highlighted segments will be reviewed after the test.
              </p>
            </Card>

            {/* Audio player */}
            <Card style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Audio</div>
              {AUDIO_SRC ? (
                <audio
                  ref={audioRef}
                  src={AUDIO_SRC}
                  controls
                  style={{ width: '100%', borderRadius: 8 }}
                  onPlay={() => setAudioPlaying(true)}
                  onPause={() => setAudioPlaying(false)}
                  onTimeUpdate={e => setAudioTime(e.target.currentTime)}
                />
              ) : (
                <div style={{
                  padding: '24px', borderRadius: 12, background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border-soft)', textAlign: 'center',
                }}>
                  <IconHeadphones size={32} color="var(--text-muted)" />
                  <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Audio file not attached yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Place your MP4/MP3 in <code style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4 }}>/public/audio/</code> and set <code style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4 }}>AUDIO_SRC</code></div>
                </div>
              )}
            </Card>

            <Button onClick={() => setPhase('test')}>
              <IconHeadphones size={16} color="#fff" />
              Begin test
            </Button>
          </div>
        )}

        {/* ── TEST ── */}
        {phase === 'test' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            {/* Questions */}
            <div>
              {/* Section tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {SECTION_LABELS.map((s, i) => (
                  <button key={s} onClick={() => setActiveSection(i)} style={{
                    padding: '8px 18px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: activeSection === i ? 'var(--accent)' : 'var(--bg-card)',
                    color: activeSection === i ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 500, fontSize: 13, transition: 'all 0.15s',
                  }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Section 1 — Form */}
              {activeSection === 0 && (
                <Card>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 6 }}>Section 1 — Form completion</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>{QUESTIONS[0].instruction}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {QUESTIONS[0].fields.map((f, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                            Q{i + 1}. {f.label}
                          </label>
                          {f.hint && showHints && (
                            <span style={{ fontSize: 11, color: '#7c5cfc', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 99 }}>{f.hint}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Your answer..."
                          value={formAnswers[i] || ''}
                          onChange={e => setFormAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                          style={{
                            width: '100%', padding: '11px 14px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)',
                            borderRadius: 10, color: 'var(--text-primary)', fontSize: 14,
                            outline: 'none', transition: 'border-color 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = '#7c5cfc'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                    <button onClick={() => setShowHints(h => !h)} style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-soft)',
                      background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
                    }}>
                      {showHints ? 'Hide hints' : 'Show hints'}
                    </button>
                    <Button onClick={() => setActiveSection(1)}>
                      Next section <IconChevronRight size={16} color="#fff" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Section 2 — Map */}
              {activeSection === 1 && (
                <Card>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 6 }}>Section 2 — Map labeling</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>{QUESTIONS[1].instruction}</p>

                  {/* Simple map SVG */}
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 24, position: 'relative' }}>
                    <svg width="100%" viewBox="0 0 400 260" style={{ borderRadius: 8 }}>
                      {/* Building outline */}
                      <rect x="40" y="30" width="320" height="200" rx="8" fill="none" stroke="var(--border-soft)" strokeWidth="2"/>
                      {/* Room A — ground floor left */}
                      <rect x="60" y="160" width="120" height="55" rx="4" fill="rgba(124,92,252,0.08)" stroke="#7c5cfc" strokeWidth="1.5"/>
                      <text x="120" y="192" textAnchor="middle" style={{ fill: '#7c5cfc', fontSize: 13, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>A</text>
                      {/* Room B — ground floor right */}
                      <rect x="220" y="160" width="120" height="55" rx="4" fill="rgba(31,217,160,0.08)" stroke="#1fd9a0" strokeWidth="1.5"/>
                      <text x="280" y="192" textAnchor="middle" style={{ fill: '#1fd9a0', fontSize: 13, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>B</text>
                      {/* Room C — upper */}
                      <rect x="140" y="60" width="120" height="70" rx="4" fill="rgba(249,168,37,0.08)" stroke="#f9a825" strokeWidth="1.5"/>
                      <text x="200" y="100" textAnchor="middle" style={{ fill: '#f9a825', fontSize: 13, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>C</text>
                      {/* Labels */}
                      <text x="200" y="22" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter,sans-serif' }}>RIVERSIDE COMMUNITY CENTRE — FLOOR PLAN</text>
                      <text x="120" y="230" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Inter,sans-serif' }}>Ground floor</text>
                      <text x="280" y="230" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Inter,sans-serif' }}>Ground floor</text>
                      <text x="200" y="145" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Inter,sans-serif' }}>3rd floor</text>
                    </svg>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                    {QUESTIONS[1].mapItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: 13, flexShrink: 0 }}>
                          {item.id}
                        </div>
                        <select
                          value={mapAnswers[item.id] || ''}
                          onChange={e => setMapAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                          style={{
                            flex: 1, padding: '10px 14px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)',
                            borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select a label...</option>
                          {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <Button onClick={submit}>
                    Submit test <IconChevronRight size={16} color="#fff" />
                  </Button>
                </Card>
              )}
            </div>

            {/* Transcript panel */}
            <div style={{ position: 'sticky', top: 24 }}>
              <Card style={{ padding: '20px' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Audio transcript</div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Click segments you think are distractors
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TRANSCRIPT.map(seg => {
                    const revealed = revealedDistractors.includes(seg.id)
                    return (
                      <div
                        key={seg.id}
                        onClick={() => seg.distractor && toggleDistractor(seg.id)}
                        style={{
                          padding: '8px 10px', borderRadius: 8, fontSize: 12, lineHeight: 1.6,
                          cursor: seg.distractor ? 'pointer' : 'default',
                          background: revealed ? 'rgba(247,92,92,0.1)' : seg.distractor ? 'rgba(249,168,37,0.06)' : 'transparent',
                          border: `1px solid ${revealed ? 'rgba(247,92,92,0.3)' : seg.distractor ? 'rgba(249,168,37,0.15)' : 'transparent'}`,
                          color: revealed ? 'var(--error)' : 'var(--text-secondary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {seg.text}
                        {revealed && seg.correction && (
                          <div style={{ fontSize: 11, marginTop: 4, color: '#1fd9a0', fontWeight: 500 }}>
                            Correction: "{seg.correction}"
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                  {revealedDistractors.length} distractor(s) marked
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && score && (
          <div className="fade-up" style={{ maxWidth: 580 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Results</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 28 }}>Test complete</h1>

            <Card glow style={{ textAlign: 'center', padding: '40px 32px', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 72, color: '#7c5cfc', letterSpacing: '-0.04em', lineHeight: 1 }}>{score.band}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>estimated band score</div>
              <div style={{ marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
                {score.correct} / {score.total} correct answers
              </div>
            </Card>

            {/* Distractor performance */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Anti-distractor performance</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: '#1fd9a0' }}>
                    {TRANSCRIPT.filter(s => s.distractor && revealedDistractors.includes(s.id)).length}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>distractors caught</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: '#f75c5c' }}>
                    {TRANSCRIPT.filter(s => s.distractor && !revealedDistractors.includes(s.id)).length}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>missed</div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => { setPhase('intro'); setFormAnswers({}); setMapAnswers({}); setRevealedDistractors([]); setScore(null) }} variant="ghost">
                Retry test
              </Button>
              <Button onClick={() => nav('/dashboard')}>
                Back to dashboard
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
