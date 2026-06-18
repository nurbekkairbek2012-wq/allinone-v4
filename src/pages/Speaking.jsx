import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card, Badge } from '../components/ui/index'
import { IconMic, IconTarget, IconZap } from '../assets/icons/index'

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const PARTS = [
  {
    part: 1,
    label: 'Part 1 — Introduction',
    questions: [
      'Can you describe your typical morning routine?',
      'Do you enjoy cooking? Why or why not?',
      'What kind of music do you like to listen to?',
    ],
  },
  {
    part: 2,
    label: 'Part 2 — Long turn',
    questions: [
      'Describe a person who has had a big influence on your life. You should say: who this person is, how you know them, what they have done, and explain why they have influenced you so much.',
    ],
    prepTime: 60,
  },
  {
    part: 3,
    label: 'Part 3 — Discussion',
    questions: [
      "Do you think schools should focus more on developing students' communication skills?",
      'How has technology changed the way people communicate in your country?',
      'Some people say social media has made people less able to hold real conversations. Do you agree?',
    ],
  },
]

const PAUSE_THRESHOLD = 2200

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function PauseTimeline({ pauses, duration }) {
  if (!duration) return null
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Pause timeline</div>
      <div style={{ position: 'relative', height: 8, background: 'var(--bg-secondary)', borderRadius: 99 }}>
        {pauses.map((p, i) => {
          const left = (p.start / duration) * 100
          const width = Math.max(1, ((p.end - p.start) / duration) * 100)
          return (
            <div key={i} title={`${(p.duration / 1000).toFixed(1)}s pause`} style={{
              position: 'absolute', top: 0, left: `${left}%`, width: `${width}%`,
              height: '100%', background: 'var(--error)', borderRadius: 99, opacity: 0.8,
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>0s</span>
        <span>{(duration / 1000).toFixed(0)}s</span>
      </div>
    </div>
  )
}

function RecordingWave({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {[0.4, 0.7, 1, 0.7, 0.4, 0.6, 0.9, 0.6, 0.4].map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 99,
          height: active ? `${h * 28}px` : '4px',
          background: active ? 'var(--accent)' : 'var(--border-soft)',
          transition: 'height 0.15s ease',
          animation: active ? `wave ${0.6 + i * 0.07}s ease-in-out infinite alternate` : 'none',
        }} />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Speaking() {
  const nav = useNavigate()
  const { saveScore } = useAuth()
  const [partIdx, setPartIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [phase, setPhase] = useState('intro')
  const [prepLeft, setPrepLeft] = useState(0)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [pauses, setPauses] = useState([])
  const [recordDuration, setRecordDuration] = useState(0)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [error, setError] = useState('')
  const [micPermission, setMicPermission] = useState('unknown') // unknown | granted | denied

  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const lastSpeechRef = useRef(null)
  const pauseStartRef = useRef(null)
  const recordStartRef = useRef(null)
  const durationTimerRef = useRef(null)
  const pausesRef = useRef([])
  const fullTranscriptRef = useRef('')
  const isStoppingRef = useRef(false)

  const currentPart = PARTS[partIdx]
  const currentQ = currentPart.questions[qIdx]

  // ── Check mic permission ──
  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' }).then(p => {
      setMicPermission(p.state)
      p.onchange = () => setMicPermission(p.state)
    }).catch(() => {})
  }, [])

  // ── Init speech recognition with auto-restart ──
  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onresult = (e) => {
      const now = Date.now()

      if (pauseStartRef.current) {
        const pauseDuration = now - pauseStartRef.current
        if (pauseDuration >= PAUSE_THRESHOLD) {
          pausesRef.current.push({
            start: pauseStartRef.current - recordStartRef.current,
            end: now - recordStartRef.current,
            duration: pauseDuration,
          })
        }
        pauseStartRef.current = null
      }
      lastSpeechRef.current = now

      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        pauseStartRef.current = Date.now()
      }, 400)

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          fullTranscriptRef.current += e.results[i][0].transcript + ' '
        }
      }

      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) interim = e.results[i][0].transcript
      }
      setTranscript(fullTranscriptRef.current + interim)
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        setError('Microphone access denied. Please allow microphone in browser settings.')
        setMicPermission('denied')
        isStoppingRef.current = true
        setRecording(false)
        return
      }
      if (e.error === 'no-speech') return // normal, don't show error
      if (e.error === 'aborted') return    // we triggered stop, ignore
      // For network errors etc — show briefly
      console.warn('Speech recognition error:', e.error)
    }

    // ── Auto-restart on unexpected end (Chrome stops after ~60s of silence) ──
    recognition.onend = () => {
      if (isStoppingRef.current) return // we stopped on purpose
      // restart to keep continuous recording
      try {
        recognitionRef.current?.start()
      } catch (err) {
        // already started, ignore
      }
    }

    recognition.onstart = () => {
      setError('')
    }

    try {
      recognition.start()
    } catch (err) {
      setError('Could not start microphone. Try refreshing the page.')
    }
  }, [])

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.')
      return
    }

    isStoppingRef.current = false
    pausesRef.current = []
    fullTranscriptRef.current = ''
    recordStartRef.current = Date.now()
    lastSpeechRef.current = Date.now()
    pauseStartRef.current = null

    setRecording(true)
    setPhase('recording')
    setTranscript('')
    setPauses([])

    startRecognition()

    durationTimerRef.current = setInterval(() => {
      setRecordDuration(Date.now() - recordStartRef.current)
    }, 200)
  }, [startRecognition])

  const stopRecording = useCallback(() => {
    isStoppingRef.current = true
    recognitionRef.current?.stop()
    clearTimeout(silenceTimerRef.current)
    clearInterval(durationTimerRef.current)
    setRecording(false)
    setPauses([...pausesRef.current])
    const dur = Date.now() - recordStartRef.current
    setRecordDuration(dur)
    setPhase('feedback')
    // Use a small delay to get final transcript chunks
    setTimeout(() => getFeedback(fullTranscriptRef.current, dur), 300)
  }, [])

  // ── OpenRouter API feedback ──
  const getFeedback = async (finalTranscript, dur) => {
    setLoadingFeedback(true)
    setAiFeedback(null)

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

    if (!apiKey) {
      setAiFeedback({
        fluency: 6.5, coherence: 6.0, lexical: 6.0, grammar: 6.5, overall: 6.0,
        strengths: ['Good attempt! Add your OpenRouter API key to enable real AI feedback.'],
        improvements: ['Add VITE_OPENROUTER_API_KEY to Vercel Environment Variables.'],
        tip: 'In Vercel: Settings → Environment Variables → add VITE_OPENROUTER_API_KEY',
      })
      setLoadingFeedback(false)
      return
    }

    const spokenText = finalTranscript?.trim() || transcript?.trim() || ''

    if (!spokenText) {
      setAiFeedback({
        fluency: 0, coherence: 0, lexical: 0, grammar: 0, overall: 0,
        strengths: [],
        improvements: ['No speech was detected. Make sure your microphone is working and you speak clearly.'],
        tip: 'Try speaking louder or check that the correct microphone is selected in your browser.',
      })
      setLoadingFeedback(false)
      return
    }

    try {
      const prompt = `You are an expert IELTS Speaking examiner. Evaluate this candidate response.

Question: "${currentQ}"
Transcript: "${spokenText}"
Pauses longer than 2.2 seconds: ${pausesRef.current.length}
Total speaking time: ${((dur || recordDuration) / 1000).toFixed(0)} seconds

Score each criterion from 0–9 and give specific actionable feedback.
Reply ONLY with valid JSON, no markdown, no extra text:
{
  "fluency": 7.0,
  "coherence": 6.5,
  "lexical": 6.0,
  "grammar": 7.0,
  "overall": 6.5,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "tip": "one concrete tip to improve fluency score immediately"
}`

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://allinone-v2.vercel.app',
          'X-Title': 'IELTS AllInOne',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-27b-it:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const rawText = data.choices?.[0]?.message?.content || ''
      const clean = rawText.replace(/```json|```/g, '').trim()

      if (!clean) throw new Error('Empty response')

      const parsed = JSON.parse(clean)
      setAiFeedback(parsed)
      saveScore({ module: 'speaking', band: parsed.overall, pauses: pausesRef.current.length })

    } catch (err) {
      console.error('OpenRouter API error:', err)
      setAiFeedback({
        fluency: 0, coherence: 0, lexical: 0, grammar: 0, overall: 0,
        strengths: [],
        improvements: [`AI connection error: ${err.message}`],
        tip: 'Check your VITE_OPENROUTER_API_KEY in Vercel Environment Variables.',
      })
    }
    setLoadingFeedback(false)
  }

  // ── Prep timer ──
  useEffect(() => {
    if (phase !== 'prep') return
    let t = currentPart.prepTime || 0
    setPrepLeft(t)
    const interval = setInterval(() => {
      t--
      setPrepLeft(t)
      if (t <= 0) { clearInterval(interval); startRecording() }
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  const nextQuestion = () => {
    setAllResults(prev => [...prev, { part: partIdx + 1, question: currentQ, transcript, pauses, feedback: aiFeedback, duration: recordDuration }])
    setAiFeedback(null)
    setTranscript('')
    setPauses([])
    setRecordDuration(0)
    fullTranscriptRef.current = ''

    const nextQIdx = qIdx + 1
    if (nextQIdx < currentPart.questions.length) {
      setQIdx(nextQIdx)
      setPhase('intro')
    } else {
      const nextPartIdx = partIdx + 1
      if (nextPartIdx < PARTS.length) {
        setPartIdx(nextPartIdx)
        setQIdx(0)
        setPhase('intro')
      } else {
        setPhase('done')
      }
    }
  }

  const CriterionBar = ({ label, value, color }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value?.toFixed(1) || '—'}</span>
      </div>
      <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${((value || 0) / 9) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Module</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#f75c5c' }}>Speaking</span> Practice
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {PARTS.map((p, i) => (
              <div key={i} style={{
                padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                background: i === partIdx ? 'rgba(247,92,92,0.15)' : 'var(--bg-card)',
                color: i === partIdx ? '#f75c5c' : i < partIdx ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${i === partIdx ? 'rgba(247,92,92,0.3)' : 'var(--border)'}`,
              }}>
                {i < partIdx ? '✓ ' : ''}{p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mic permission warning */}
        {micPermission === 'denied' && (
          <div style={{ padding: '12px 16px', background: 'rgba(249,168,37,0.1)', border: '1px solid rgba(249,168,37,0.3)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--warning)' }}>
            ⚠️ Microphone access is blocked. Click the lock icon in your browser's address bar and allow microphone access, then refresh the page.
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(247,92,92,0.1)', border: '1px solid rgba(247,92,92,0.3)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--error)' }}>
            {error}
          </div>
        )}

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <div style={{ maxWidth: 600 }} className="fade-up">
            <Card style={{ marginBottom: 20, borderColor: 'rgba(247,92,92,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                {currentPart.label} — Question {qIdx + 1} of {currentPart.questions.length}
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                "{currentQ}"
              </p>
            </Card>

            {currentPart.prepTime && (
              <Card style={{ marginBottom: 20, padding: '16px 20px', background: 'rgba(249,168,37,0.05)', borderColor: 'rgba(249,168,37,0.2)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  You will have <strong style={{ color: '#f9a825' }}>{currentPart.prepTime} seconds</strong> to prepare before recording starts automatically.
                </div>
              </Card>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-soft)', marginBottom: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 16 }}>🎤</span>
              Chrome/Edge recommended for best speech recognition. Make sure your microphone is not muted.
            </div>

            <Button
              onClick={() => currentPart.prepTime ? setPhase('prep') : startRecording()}
              style={{ background: 'linear-gradient(135deg, #f75c5c, #ff8c8c)' }}
            >
              <IconMic size={16} color="#fff" />
              {currentPart.prepTime ? 'Start preparation' : 'Start recording'}
            </Button>
          </div>
        )}

        {/* ── PREP ── */}
        {phase === 'prep' && (
          <div style={{ maxWidth: 500, textAlign: 'center' }} className="fade-up">
            <Card>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Preparation time</div>
              <div style={{
                fontFamily: "'Space Grotesk',sans-serif", fontSize: 80, fontWeight: 700,
                color: prepLeft <= 10 ? 'var(--error)' : '#f9a825',
                lineHeight: 1, marginBottom: 16,
              }}>
                {prepLeft}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Recording starts automatically when timer ends.<br />Make notes if needed.
              </p>
            </Card>
          </div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'recording' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }} className="fade-up">
            <div>
              <Card style={{ marginBottom: 16, borderColor: 'rgba(247,92,92,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)' }}>Recording</span>
                    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                    {Math.floor(recordDuration / 60000)}:{String(Math.floor((recordDuration % 60000) / 1000)).padStart(2, '0')}
                  </span>
                </div>
                <RecordingWave active={recording} />
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Question</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: 'italic' }}>"{currentQ}"</p>
              </Card>

              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Live transcript
                  {transcript && <span style={{ fontWeight: 400, marginLeft: 8, color: 'var(--success)' }}>● capturing</span>}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, minHeight: 60 }}>
                  {transcript || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Start speaking — transcript appears here...</span>}
                </p>
                {!transcript && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    💡 If nothing appears after speaking for 3+ seconds, your browser may be blocking the microphone. Check the address bar for a blocked mic icon.
                  </div>
                )}
              </Card>

              <div style={{ marginTop: 20 }}>
                <Button onClick={stopRecording} variant="danger">
                  Stop recording
                </Button>
              </div>
            </div>

            <Card style={{ position: 'sticky', top: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>Pause detector</div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 48, color: pausesRef.current.length > 2 ? 'var(--error)' : 'var(--success)' }}>
                  {pausesRef.current.length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>pauses &gt; 2.2s detected</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                Long pauses hurt your <strong>Fluency</strong> score. Keep speaking, even if you use fillers like "Well..." or "That's a good question...".
              </div>
            </Card>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {phase === 'feedback' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }} className="fade-up">
            <div>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Your response</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {transcript || <em style={{ color: 'var(--text-muted)' }}>No speech detected. Try using Chrome and allowing microphone access.</em>}
                </p>
                <PauseTimeline pauses={pauses} duration={recordDuration} />
                <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                  <Badge color={pauses.length <= 1 ? 'success' : 'error'}>
                    {pauses.length} long pause{pauses.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge>
                    {(recordDuration / 1000).toFixed(0)}s total
                  </Badge>
                </div>
              </Card>

              {loadingFeedback ? (
                <Card style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 14 }}>Analysing with AI...</div>
                  <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spinSlow 0.7s linear infinite', margin: '0 auto' }} />
                </Card>
              ) : aiFeedback && (
                <Card>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 20 }}>AI Examiner Feedback</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <CriterionBar label="Fluency & Coherence" value={aiFeedback.fluency}  color="#7c5cfc" />
                    <CriterionBar label="Lexical Resource"    value={aiFeedback.lexical}   color="#1fd9a0" />
                    <CriterionBar label="Grammatical Range"   value={aiFeedback.grammar}   color="#f9a825" />
                    <CriterionBar label="Overall estimate"    value={aiFeedback.overall}   color="#f75c5c" />
                  </div>

                  {aiFeedback.strengths?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>Strengths</div>
                      {aiFeedback.strengths.map((s, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 10px', background: 'rgba(31,217,160,0.05)', borderRadius: 8, marginBottom: 4 }}>{s}</div>
                      ))}
                    </div>
                  )}

                  {aiFeedback.improvements?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--error)', marginBottom: 8 }}>To improve</div>
                      {aiFeedback.improvements.map((s, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 10px', background: 'rgba(247,92,92,0.05)', borderRadius: 8, marginBottom: 4 }}>{s}</div>
                      ))}
                    </div>
                  )}

                  {aiFeedback.tip && (
                    <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', borderRadius: 10, border: '1px solid rgba(124,92,252,0.2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4, letterSpacing: '0.06em' }}>EXAMINER TIP</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{aiFeedback.tip}</div>
                    </div>
                  )}
                </Card>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <Button variant="ghost" onClick={() => { setPhase('intro'); setAiFeedback(null); setTranscript(''); setPauses([]); setRecordDuration(0); fullTranscriptRef.current = '' }}>
                  Retry this question
                </Button>
                <Button onClick={nextQuestion}>
                  {qIdx < currentPart.questions.length - 1 || partIdx < PARTS.length - 1 ? 'Next question' : 'See final results'}
                </Button>
              </div>
            </div>

            {aiFeedback && (
              <Card style={{ position: 'sticky', top: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Band estimate</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 64, color: '#f75c5c', lineHeight: 1 }}>
                  {aiFeedback.overall?.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>this response</div>
              </Card>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div style={{ maxWidth: 560 }} className="fade-up">
            <Card glow style={{ textAlign: 'center', padding: '48px 32px', marginBottom: 20 }}>
              <IconTarget size={48} color="#f75c5c" />
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, marginTop: 20, marginBottom: 8 }}>Speaking session complete</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                {allResults.length} questions answered across 3 parts
              </div>
            </Card>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="ghost" onClick={() => { setPartIdx(0); setQIdx(0); setPhase('intro'); setAllResults([]); setAiFeedback(null); fullTranscriptRef.current = '' }}>
                Start again
              </Button>
              <Button onClick={() => nav('/dashboard')}>Back to dashboard</Button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
