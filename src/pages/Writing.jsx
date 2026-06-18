import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card, Badge } from '../components/ui/index'
import { IconEdit, IconTarget, IconZap } from '../assets/icons/index'

const TASKS = [
  {
    id: 1, type: 'Task 1',
    prompt: 'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    minWords: 150,
    requirements: {
      overview: { label: 'Overview paragraph', pattern: /overview|overall|it is (clear|evident|noticeable)|the (most|main) (notable|striking)/i, tip: 'Add a paragraph starting with "Overall," or "In summary," that identifies the main trend.' },
      comparison: { label: 'Comparison of data', pattern: /\b(while|whereas|compared to|in contrast|however|on the other hand)\b/i, tip: 'Use contrast words like "whereas" or "while" to compare key data points.' },
      data: { label: 'Specific figures cited', pattern: /\d+(\.\d+)?(%| percent| times)/i, tip: 'Reference at least one specific percentage or figure from the chart.' },
      noTautology: { label: 'No tautology detected', pattern: null, tautology: true, tip: 'Avoid repeating the same words. Use synonyms (increased → rose, decreased → fell, showed → demonstrated).' },
    }
  },
  {
    id: 2, type: 'Task 2',
    prompt: 'Some people believe that universities should focus on providing academic knowledge and theoretical skills. Others think they should prepare students for the real world of work. Discuss both views and give your own opinion.',
    minWords: 250,
    requirements: {
      thesis: { label: 'Thesis / position stated', pattern: /\b(i (believe|think|argue|would argue)|in my (opinion|view)|this essay (will|argues)|it is (my|the) (view|contention))\b/i, tip: 'State your position clearly in the introduction: "I believe that..." or "In my opinion..."' },
      bothViews: { label: 'Both views discussed', pattern: /\b(on (one|the other) hand|some people|others|proponents|critics|those who)\b/i, tip: 'Discuss both perspectives — use "On one hand... On the other hand..."' },
      linking: { label: 'Linking words used', pattern: /\b(furthermore|moreover|in addition|consequently|therefore|nevertheless|however|firstly|secondly|finally)\b/i, tip: 'Add linking words: Furthermore, Moreover, However, Consequently, In addition.' },
      conclusion: { label: 'Conclusion present', pattern: /\b(in conclusion|to conclude|to summarise|in summary|overall, i)\b/i, tip: 'Add a conclusion paragraph starting with "In conclusion," or "To conclude,"' },
      paragraphs: { label: 'Paragraphs balanced', pattern: null, paragraphs: true, tip: 'Aim for 4-5 paragraphs: Intro, Body 1, Body 2, (Body 3), Conclusion. Each should be roughly similar length.' },
    }
  },
]

const TAUTOLOGY_PAIRS = [
  ['increased', 'rose', 'went up', 'grew', 'climbed'],
  ['decreased', 'fell', 'dropped', 'declined', 'went down'],
  ['showed', 'demonstrated', 'revealed', 'indicated', 'illustrated'],
  ['important', 'significant', 'crucial', 'vital', 'key'],
  ['because', 'since', 'as', 'due to', 'owing to'],
]

function detectTautology(text) {
  const lower = text.toLowerCase()
  const found = []
  TAUTOLOGY_PAIRS.forEach(group => {
    const usedInGroup = group.filter(w => lower.includes(w))
    if (usedInGroup.length >= 3) found.push(usedInGroup[0])
  })
  // Also detect same word repeated 3+ times
  const words = lower.match(/\b[a-z]{5,}\b/g) || []
  const freq = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  Object.entries(freq).forEach(([w, c]) => { if (c >= 4) found.push(w) })
  return found.slice(0, 3)
}

function countParagraphs(text) {
  return text.split(/\n\n+/).filter(p => p.trim().length > 20).length
}

export default function Writing() {
  const nav = useNavigate()
  const { saveScore } = useAuth()
  const [taskIdx, setTaskIdx] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const task = TASKS[taskIdx]

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const tautologyWords = detectTautology(text)
  const paraCount = countParagraphs(text)

  const checkRequirement = (key, req) => {
    if (req.tautology) return tautologyWords.length === 0
    if (req.paragraphs) return paraCount >= (taskIdx === 1 ? 4 : 3)
    return req.pattern?.test(text) || false
  }

  const reqEntries = Object.entries(task.requirements)
  const passedCount = reqEntries.filter(([k, r]) => checkRequirement(k, r)).length
  const allPassed = passedCount === reqEntries.length && wordCount >= task.minWords

  const bandEstimate = () => {
    const ratio = passedCount / reqEntries.length
    const wordBonus = wordCount >= task.minWords ? 0.5 : 0
    return Math.min(9, Math.max(4, (ratio * 4 + 4 + wordBonus))).toFixed(1)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Module</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#f9a825' }}>Writing</span> Practice
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {TASKS.map((t, i) => (
              <button key={t.id} onClick={() => { setTaskIdx(i); setText(''); setSubmitted(false) }} style={{
                padding: '6px 18px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: i === taskIdx ? 'rgba(249,168,37,0.15)' : 'var(--bg-card)',
                color: i === taskIdx ? '#f9a825' : 'var(--text-secondary)',
                border: `1px solid ${i === taskIdx ? 'rgba(249,168,37,0.3)' : 'var(--border)'}`,
              }}>
                {t.type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* Editor */}
          <div>
            <Card style={{ marginBottom: 16, borderColor: 'rgba(249,168,37,0.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f9a825', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{task.type} prompt</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{task.prompt}</p>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Minimum: {task.minWords} words</div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Your response</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: wordCount >= task.minWords ? '#1fd9a0' : 'var(--text-muted)' }}>
                    {wordCount} / {task.minWords} words
                  </span>
                  {tautologyWords.length > 0 && (
                    <Badge color="error">Tautology detected</Badge>
                  )}
                </div>
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Write your ${task.type} response here...\n\n${taskIdx === 0 ? 'Start with an introduction describing what the chart shows, then add an Overview paragraph.' : 'Start with an introduction stating your position, then discuss both views.'}`}
                style={{
                  width: '100%', minHeight: 380,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)',
                  borderRadius: 12, padding: 16, color: 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.8, fontFamily: "'Inter',sans-serif",
                  resize: 'vertical', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#f9a825'}
                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
              />

              {/* Tautology highlights */}
              {tautologyWords.length > 0 && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(247,92,92,0.08)', borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--error)', fontWeight: 600 }}>Repetition detected: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{tautologyWords.join(', ')} — try using synonyms.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <Button
                  onClick={() => {
                    setSubmitted(true)
                    saveScore({ module: 'writing', band: parseFloat(bandEstimate()), correct: passedCount, total: reqEntries.length, wordCount })
                  }}
                  disabled={wordCount < 50}
                  style={{ background: 'linear-gradient(135deg, #f9a825, #f5a014)', opacity: wordCount < 50 ? 0.5 : 1 }}
                >
                  <IconTarget size={16} color="#fff" /> Get structure feedback
                </Button>
                <button onClick={() => { setText(''); setSubmitted(false) }} style={{
                  padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border-soft)',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
                }}>
                  Clear
                </button>
              </div>
            </Card>
          </div>

          {/* Linter panel */}
          <div style={{ position: 'sticky', top: 24 }}>
            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>Structure linter</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reqEntries.map(([key, req]) => {
                  const pass = checkRequirement(key, req)
                  return (
                    <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: pass ? 'rgba(31,217,160,0.15)' : 'rgba(247,92,92,0.1)',
                        border: `1.5px solid ${pass ? '#1fd9a0' : '#f75c5c'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 1,
                      }}>
                        {pass
                          ? <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#1fd9a0" strokeWidth="2" strokeLinecap="round"/></svg>
                          : <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f75c5c' }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: pass ? '#1fd9a0' : 'var(--text-secondary)' }}>{req.label}</div>
                        {!pass && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{req.tip}</div>}
                      </div>
                    </div>
                  )
                })}

                {/* Word count check */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: wordCount >= task.minWords ? 'rgba(31,217,160,0.15)' : 'rgba(247,92,92,0.1)',
                    border: `1.5px solid ${wordCount >= task.minWords ? '#1fd9a0' : '#f75c5c'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {wordCount >= task.minWords
                      ? <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#1fd9a0" strokeWidth="2" strokeLinecap="round"/></svg>
                      : <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f75c5c' }} />
                    }
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: wordCount >= task.minWords ? '#1fd9a0' : 'var(--text-secondary)' }}>
                    {task.minWords}+ words ({wordCount} written)
                  </div>
                </div>
              </div>
            </Card>

            {/* Score estimate */}
            {submitted && wordCount >= 50 && (
              <Card style={{ textAlign: 'center', padding: '20px', borderColor: 'rgba(249,168,37,0.25)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Structure score estimate</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 52, color: '#f9a825', lineHeight: 1 }}>
                  {bandEstimate()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  {passedCount}/{reqEntries.length} criteria met
                </div>
                {allPassed && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(31,217,160,0.1)', borderRadius: 8, fontSize: 12, color: '#1fd9a0' }}>
                    All structure requirements met!
                  </div>
                )}
              </Card>
            )}

            <div style={{ marginTop: 12 }}>
              <button onClick={() => nav('/dashboard')} style={{
                width: '100%', padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
              }}>
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
