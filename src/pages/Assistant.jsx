import { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card } from '../components/ui/index'
import { IconMic, IconZap } from '../assets/icons/index'

function IconSend({ size=18, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}
function IconBot({ size=18, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="15" x2="8" y2="17"/><line x1="16" y1="15" x2="16" y2="17"/></svg>
}

const QUICK_PROMPTS = [
  { label: 'Band 7 tips', text: 'What are the top 3 things I need to do to reach Band 7 overall?' },
  { label: 'Speaking Fluency', text: 'How can I improve my Fluency score in IELTS Speaking? Give me specific techniques.' },
  { label: 'Task 2 structure', text: 'Explain the perfect paragraph structure for IELTS Writing Task 2.' },
  { label: 'Reading traps', text: 'What are the most common traps in IELTS Reading True/False/Not Given questions?' },
  { label: 'Listening distractors', text: 'How do IELTS examiners use distractors in the Listening test? Give examples.' },
  { label: 'Vocabulary boost', text: 'Give me 10 high-scoring academic phrases I can use in IELTS Writing Task 2.' },
]

const SYSTEM_PROMPT = `You are an expert IELTS tutor with 15+ years of experience. You help students prepare for the IELTS exam.

Your expertise:
- All 4 modules: Listening, Reading, Writing, Speaking
- Band descriptors and scoring criteria
- Common student mistakes and how to fix them
- Exam strategies and time management

Rules:
- Be specific and actionable — no vague advice
- Use IELTS terminology correctly (band scores, criteria names, task types)
- Give examples when explaining concepts
- Keep responses concise but complete
- Format with clear structure when listing tips or steps
- If asked about scores, reference the official IELTS band descriptors`

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hey! I'm your IELTS AI tutor. Ask me anything about the exam — strategies, grammar, vocabulary, how to improve your band score, or practice questions. What do you want to work on today?",
    }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Build conversation history for OpenRouter (OpenAI format)
    const history = messages.slice(1).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text
    }))

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
      if (!apiKey) throw new Error('NO_KEY')

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://allinone-v2.vercel.app',
          'X-Title': 'IELTS AllInOne',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: msg }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || `API error ${res.status}`)
      }

      const reply = data.choices?.[0]?.message?.content
        || "Sorry, I couldn't generate a response. Please try again."
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      const errMsg = err.message === 'NO_KEY'
        ? "Add your OpenRouter API key to Vercel as VITE_OPENROUTER_API_KEY."
        : `Error: ${err.message}`
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px 32px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>AI TUTOR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBot size={22} color="var(--accent)" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>
                IELTS <span style={{ color: 'var(--accent)' }}>Assistant</span>
              </h1>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Llama 3.3 · Expert IELTS tutor</div>
            </div>
          </div>

          {/* Quick prompts */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p.label} onClick={() => send(p.text)} style={{
                padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, marginBottom: 20,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <IconBot size={16} color="var(--accent)" />
                </div>
              )}
              <div style={{
                maxWidth: '72%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: 14, lineHeight: 1.7, color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconBot size={16} color="var(--accent)" />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 32px 24px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about IELTS... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 14,
                border: '1px solid var(--border-soft)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 14, resize: 'none',
                fontFamily: 'var(--font-body)', lineHeight: 1.5, outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{
              width: 44, height: 44, borderRadius: 12, border: 'none',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border-soft)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}>
              <IconSend size={16} color="#fff" />
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
            AI can make mistakes — always verify band descriptors with official IELTS materials
          </div>
        </div>
      </main>
    </div>
  )
}
      </main>
    </div>
  )
}
