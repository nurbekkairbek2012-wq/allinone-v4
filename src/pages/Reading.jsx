import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card, Badge } from '../components/ui/index'
import { IconBook, IconTarget, IconChevronRight } from '../assets/icons/index'

// ─── PASSAGE ──────────────────────────────────────────────────────────────────
const PASSAGE = {
  title: 'The Economics of Urban Vertical Farming',
  text: `Vertical farming — the practice of cultivating crops in stacked, climate-controlled layers — has rapidly transitioned from an experimental concept to a commercially viable enterprise in less than two decades. Proponents argue that the technology offers a compelling solution to food security challenges exacerbated by rapid urbanisation and increasingly volatile climate patterns.

The economic model underpinning vertical farming depends heavily on energy expenditure. Unlike conventional agriculture, which relies on solar radiation, vertical farms require artificial lighting for photosynthesis — a cost that can account for up to sixty percent of total operational expenses. Consequently, farms located in regions with subsidised electricity or renewable energy infrastructure demonstrate considerably stronger profit margins than those dependent on conventional power grids.

Water consumption represents a secondary but equally significant factor. Hydroponic and aeroponic systems utilised in vertical farms consume approximately ninety percent less water than traditional field cultivation. This efficiency gain translates directly into reduced overheads in water-scarce regions, conferring a distinct competitive advantage over conventional agricultural methods.

Critics, however, contend that the capital expenditure required to establish a vertical farm remains prohibitively high. Initial infrastructure costs — encompassing lighting arrays, climate control systems, and proprietary growing platforms — frequently exceed those of traditional greenhouse construction by a factor of three to five. Proponents counter that accelerating technological innovation continues to compress these costs year on year, and that urban proximity eliminates substantial transportation and cold-chain logistics expenses.`,
  synonymMap: {
    'cultivating': ['growing', 'farming', 'producing'],
    'viable': ['feasible', 'workable', 'sustainable', 'profitable'],
    'exacerbated': ['worsened', 'intensified', 'aggravated'],
    'expenditure': ['spending', 'cost', 'expense', 'outlay'],
    'consequently': ['as a result', 'therefore', 'hence', 'thus'],
    'considerably': ['significantly', 'substantially', 'markedly'],
    'utilised': ['used', 'employed', 'applied'],
    'approximately': ['about', 'roughly', 'nearly', 'around'],
    'conferring': ['giving', 'providing', 'granting'],
    'contend': ['argue', 'claim', 'maintain', 'assert'],
    'prohibitively': ['excessively', 'unreasonably', 'extremely'],
    'encompassing': ['including', 'covering', 'comprising'],
    'eliminate': ['remove', 'eradicate', 'get rid of'],
    'accelerating': ['speeding up', 'increasing', 'quickening'],
    'compress': ['reduce', 'lower', 'decrease', 'cut'],
  }
}

const QUESTIONS = [
  { id: 1, type: 'tfng', statement: 'Vertical farming has been commercially viable for more than twenty years.', answer: 'FALSE', explanation: 'The passage says it transitioned to commercially viable in less than two decades.' },
  { id: 2, type: 'tfng', statement: 'Energy costs can represent the majority of a vertical farm\'s operational expenses.', answer: 'TRUE', explanation: 'The passage states artificial lighting can account for up to sixty percent of total operational expenses.' },
  { id: 3, type: 'tfng', statement: 'All vertical farms demonstrate strong profit margins regardless of location.', answer: 'FALSE', explanation: 'Only farms in regions with subsidised or renewable energy show stronger margins.' },
  { id: 4, type: 'tfng', statement: 'Vertical farming uses significantly less water than conventional farming.', answer: 'TRUE', explanation: 'The passage states approximately ninety percent less water than traditional field cultivation.' },
  { id: 5, type: 'tfng', statement: 'The writer states that capital costs for vertical farms will soon be lower than greenhouse costs.', answer: 'NOT GIVEN', explanation: 'The passage says costs are compressing but does not claim they will become lower than greenhouses.' },
  { id: 6, type: 'match', stem: 'The writer uses the phrase "cold-chain logistics" to refer to...', options: ['A. refrigerated transport of perishable produce', 'B. the freezing process used in vertical farms', 'C. energy costs associated with climate control', 'D. water cooling in hydroponic systems'], answer: 'A', explanation: 'Cold-chain logistics refers to the refrigerated supply chain for fresh produce transport.' },
]

export default function Reading() {
  const nav = useNavigate()
  const { saveScore } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null) // synonym popup word
  const [synonymBox, setSynonymBox] = useState({ visible: false, word: '', synonyms: [], x: 0, y: 0 })
  const [submitted, setSubmitted] = useState(false)
  const passageRef = useRef(null)

  const handleWordClick = (e, word) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '')
    const syns = PASSAGE.synonymMap[clean]
    if (!syns) return
    const rect = e.target.getBoundingClientRect()
    const containerRect = passageRef.current.getBoundingClientRect()
    setSynonymBox({
      visible: true,
      word: clean,
      synonyms: syns,
      x: rect.left - containerRect.left,
      y: rect.bottom - containerRect.top + 6,
    })
  }

  const closePopup = () => setSynonymBox(s => ({ ...s, visible: false }))

  const renderPassage = () => {
    return PASSAGE.text.split(' ').map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '')
      const hasSyn = !!PASSAGE.synonymMap[clean]
      return (
        <span key={i}>
          <span
            onClick={hasSyn ? (e) => handleWordClick(e, word) : undefined}
            style={{
              cursor: hasSyn ? 'pointer' : 'text',
              background: hasSyn ? 'rgba(124,92,252,0.12)' : 'transparent',
              color: hasSyn ? '#9d7dff' : 'inherit',
              borderRadius: 3,
              padding: hasSyn ? '1px 2px' : 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (hasSyn) e.target.style.background = 'rgba(124,92,252,0.22)' }}
            onMouseLeave={e => { if (hasSyn) e.target.style.background = 'rgba(124,92,252,0.12)' }}
          >
            {word}
          </span>
          {' '}
        </span>
      )
    })
  }

  const getScore = () => {
    let correct = 0
    QUESTIONS.forEach(q => {
      if (answers[q.id] === q.answer) correct++
    })
    return { correct, total: QUESTIONS.length, band: Math.min(9, Math.max(1, correct / QUESTIONS.length * 8 + 1)).toFixed(1) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Module</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1fd9a0' }}>Reading</span> Mock Test 1
          </h1>
        </div>

        {phase === 'intro' && (
          <div style={{ maxWidth: 600 }} className="fade-up">
            <Card style={{ marginBottom: 16, borderColor: 'rgba(31,217,160,0.2)' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{PASSAGE.title}</div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[['6', 'questions'], ['1', 'passage'], ['TRUE / FALSE / NOT GIVEN + matching', 'types']].map(([v, l]) => (
                  <div key={l}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: '#1fd9a0' }}>{v}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</div></div>
                ))}
              </div>
            </Card>
            <Card style={{ marginBottom: 20, background: 'rgba(31,217,160,0.04)', borderColor: 'rgba(31,217,160,0.2)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <IconBook size={18} color="#1fd9a0" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Live synonym parser active</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Purple-highlighted words have academic synonyms. Click any highlighted word to see its synonyms — this helps you spot paraphrase traps in questions.
                  </div>
                </div>
              </div>
            </Card>
            <Button onClick={() => setPhase('test')} style={{ background: 'linear-gradient(135deg, #1fd9a0, #16b888)' }}>
              <IconBook size={16} color="#fff" /> Begin reading
            </Button>
          </div>
        )}

        {phase === 'test' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }} onClick={closePopup}>
            {/* Passage */}
            <div ref={passageRef} style={{ position: 'relative' }}>
              <Card style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Passage</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>{PASSAGE.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-secondary)' }}>
                  {renderPassage()}
                </div>
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(124,92,252,0.06)', borderRadius: 10, fontSize: 12, color: '#9d7dff' }}>
                  <strong>Tip:</strong> Purple words have synonyms — click to reveal them
                </div>

                {/* Synonym popup */}
                {synonymBox.visible && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute',
                    left: Math.min(synonymBox.x, 260),
                    top: synonymBox.y,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    zIndex: 10,
                    minWidth: 180,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Synonyms for "{synonymBox.word}"
                    </div>
                    {synonymBox.synonyms.map(s => (
                      <div key={s} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>{s}</div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Questions */}
            <div>
              <Card>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Questions 1–6</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {QUESTIONS.map(q => (
                    <div key={q.id}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Q{q.id}. </span>
                        {q.statement || q.stem}
                      </div>
                      {q.type === 'tfng' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                            <button key={opt} onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))} style={{
                              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: submitted ? 'default' : 'pointer',
                              fontSize: 12, fontWeight: 600,
                              background: answers[q.id] === opt
                                ? (submitted ? (opt === q.answer ? 'rgba(31,217,160,0.2)' : 'rgba(247,92,92,0.2)') : 'var(--accent-dim)')
                                : 'var(--bg-secondary)',
                              color: answers[q.id] === opt
                                ? (submitted ? (opt === q.answer ? '#1fd9a0' : '#f75c5c') : 'var(--accent)')
                                : 'var(--text-secondary)',
                              transition: 'all 0.15s',
                            }}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {q.options.map(opt => (
                            <button key={opt} onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt[0] }))} style={{
                              padding: '8px 14px', borderRadius: 8, border: `1px solid ${answers[q.id] === opt[0] ? 'var(--accent)' : 'var(--border)'}`,
                              cursor: submitted ? 'default' : 'pointer', textAlign: 'left', fontSize: 13,
                              background: answers[q.id] === opt[0]
                                ? (submitted ? (opt[0] === q.answer ? 'rgba(31,217,160,0.1)' : 'rgba(247,92,92,0.1)') : 'var(--accent-dim)')
                                : 'var(--bg-secondary)',
                              color: 'var(--text-secondary)', transition: 'all 0.15s',
                            }}>{opt}</button>
                          ))}
                        </div>
                      )}
                      {submitted && (
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                          <strong style={{ color: answers[q.id] === q.answer ? '#1fd9a0' : '#f75c5c' }}>
                            {answers[q.id] === q.answer ? 'Correct' : `Incorrect — answer: ${q.answer}`}
                          </strong> — {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                  {!submitted ? (
                    <Button onClick={() => {
                    setSubmitted(true)
                    const s = getScore()
                    saveScore({ module: 'reading', band: parseFloat(s.band), correct: s.correct, total: s.total })
                  }} style={{ background: 'linear-gradient(135deg, #1fd9a0, #16b888)' }}>
                      Submit answers
                    </Button>
                  ) : (
                    <>
                      <Card style={{ padding: '12px 20px', background: 'rgba(31,217,160,0.08)', borderColor: 'rgba(31,217,160,0.2)', flex: 1, textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, color: '#1fd9a0' }}>{getScore().band}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getScore().correct}/{getScore().total} correct</div>
                      </Card>
                      <Button onClick={() => nav('/dashboard')}>Dashboard</Button>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
