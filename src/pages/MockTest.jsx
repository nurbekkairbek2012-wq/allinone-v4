import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Button, Card, Badge } from '../components/ui/index'
import { IconHeadphones, IconBook, IconEdit, IconMic, IconTarget, IconZap, IconChevronRight } from '../assets/icons/index'

// ─── REAL IELTS STRUCTURE ─────────────────────────────────────────────────────
// Listening: 4 sections, 40 questions, ~30 min
// Reading:   3 passages, 40 questions, 60 min
// Writing:   Task 1 (150w, 20min) + Task 2 (250w, 40min)
// Speaking:  Part 1 (4-5min) + Part 2 (3-4min) + Part 3 (4-5min)

const MOCK_TEST = {
  id: 'mock_1',
  title: 'Academic IELTS — Full Mock Test 1',

  // ── LISTENING ──────────────────────────────────────────────────────────────
  listening: {
    totalQuestions: 10, // shortened for demo; real = 40
    timeLimit: 30 * 60,
    audioSrc: null, // set to '/audio/listening_test_1.mp4' after recording
    sections: [
      {
        id: 1,
        title: 'Section 1 — Social context',
        context: 'A conversation between a student (Daniel) and a receptionist at Riverside Community Centre.',
        type: 'form',
        instruction: 'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        questions: [
          { id: 1,  label: 'Monthly membership fee (£)',  answer: '35',           distractor: true,  trap: '45'  },
          { id: 2,  label: 'Opening hours Monday–Friday', answer: '6 AM to 9 PM', distractor: false              },
          { id: 3,  label: 'Weekend status',              answer: 'closed',        distractor: true,  trap: 'open' },
          { id: 4,  label: 'Gym floor',                   answer: 'third',         distractor: true,  trap: 'second' },
          { id: 5,  label: 'Induction date',              answer: '17th',          distractor: true,  trap: '15th' },
        ]
      },
      {
        id: 2,
        title: 'Section 2 — Map labeling',
        context: 'Sandra gives Daniel a tour of the community centre layout.',
        type: 'map',
        instruction: 'Label the map. Choose from the box: Swimming pool / Café / Gym / Reception / Studio',
        questions: [
          { id: 6,  label: 'Room A (ground floor, left)',  answer: 'Swimming pool', options: ['Swimming pool','Café','Gym','Reception','Studio'] },
          { id: 7,  label: 'Room B (ground floor, right)', answer: 'Café',          options: ['Swimming pool','Café','Gym','Reception','Studio'] },
          { id: 8,  label: 'Room C (third floor)',         answer: 'Gym',           options: ['Swimming pool','Café','Gym','Reception','Studio'] },
        ]
      },
      {
        id: 3,
        title: 'Section 3 — Academic discussion',
        context: 'Two students, Emma and James, discussing their research project on renewable energy.',
        type: 'mcq',
        instruction: 'Choose the correct letter A, B or C.',
        questions: [
          {
            id: 9,
            text: 'What does Emma say about solar panel efficiency?',
            options: ['A. It has doubled in the last decade', 'B. It depends mainly on the climate', 'C. It has improved but remains costly'],
            answer: 'C',
          },
          {
            id: 10,
            text: 'James suggests their report should focus on:',
            options: ['A. cost comparisons between energy types', 'B. the environmental impact of manufacturing', 'C. government policies on renewable subsidies'],
            answer: 'A',
          },
        ]
      },
    ]
  },

  // ── READING ────────────────────────────────────────────────────────────────
  reading: {
    totalQuestions: 13,
    timeLimit: 60 * 60,
    passages: [
      {
        id: 1,
        title: 'The Economics of Urban Vertical Farming',
        text: `Vertical farming — the practice of cultivating crops in stacked, climate-controlled layers — has rapidly transitioned from an experimental concept to a commercially viable enterprise in less than two decades. Proponents argue that the technology offers a compelling solution to food security challenges exacerbated by rapid urbanisation and increasingly volatile climate patterns.

The economic model underpinning vertical farming depends heavily on energy expenditure. Unlike conventional agriculture, which relies on solar radiation, vertical farms require artificial lighting for photosynthesis — a cost that can account for up to sixty percent of total operational expenses. Consequently, farms located in regions with subsidised electricity or renewable energy infrastructure demonstrate considerably stronger profit margins.

Water consumption represents a secondary but equally significant factor. Hydroponic and aeroponic systems consume approximately ninety percent less water than traditional field cultivation. This efficiency gain translates directly into reduced overheads in water-scarce regions, conferring a distinct competitive advantage.

Critics contend that the capital expenditure required to establish a vertical farm remains prohibitively high. Initial infrastructure costs frequently exceed those of traditional greenhouse construction by a factor of three to five. Proponents counter that accelerating technological innovation continues to compress these costs, and that urban proximity eliminates substantial transportation and cold-chain logistics expenses.`,
        synonymMap: {
          'cultivating': ['growing','farming','producing'],
          'viable': ['feasible','workable','sustainable'],
          'exacerbated': ['worsened','intensified','aggravated'],
          'expenditure': ['spending','cost','expense'],
          'consequently': ['therefore','hence','as a result'],
          'considerably': ['significantly','substantially','markedly'],
          'utilised': ['used','employed','applied'],
          'approximately': ['about','roughly','nearly'],
          'conferring': ['giving','providing','granting'],
          'contend': ['argue','claim','maintain'],
          'prohibitively': ['excessively','unreasonably'],
          'compress': ['reduce','lower','decrease'],
        },
        questionSets: [
          {
            type: 'tfng',
            instruction: 'Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.',
            questions: [
              { id: 1,  statement: 'Vertical farming has been commercially viable for more than twenty years.',               answer: 'FALSE',     explanation: 'The passage says less than two decades.' },
              { id: 2,  statement: 'Energy costs can represent the majority of a vertical farm\'s operational expenses.',     answer: 'TRUE',      explanation: 'Up to sixty percent — a majority.' },
              { id: 3,  statement: 'All vertical farms show strong profit margins regardless of location.',                   answer: 'FALSE',     explanation: 'Only those with subsidised or renewable energy.' },
              { id: 4,  statement: 'Vertical farming uses significantly less water than conventional farming.',               answer: 'TRUE',      explanation: 'Approximately ninety percent less.' },
              { id: 5,  statement: 'The writer predicts vertical farm costs will soon be lower than greenhouse costs.',       answer: 'NOT GIVEN', explanation: 'Costs are compressing but no prediction made.' },
            ]
          },
          {
            type: 'match',
            instruction: 'Choose the correct letter A, B, C or D.',
            questions: [
              {
                id: 6,
                stem: 'The phrase "cold-chain logistics" (paragraph 4) refers to:',
                options: ['A. refrigerated transport of perishable produce', 'B. the freezing process used in vertical farms', 'C. energy costs for climate control systems', 'D. water cooling in hydroponic systems'],
                answer: 'A',
                explanation: 'Cold-chain logistics = refrigerated supply chain for fresh produce.',
              },
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'The Neuroscience of Decision-Making',
        text: `For decades, economists operated under the assumption that human beings are rational agents who consistently make decisions that maximise their personal utility. This model, known as homo economicus, has been progressively dismantled by research in behavioural economics and cognitive neuroscience.

Studies using functional magnetic resonance imaging have revealed that financial decisions activate the limbic system — the brain's emotional centre — before engaging the prefrontal cortex, which governs logical reasoning. This neurological sequencing suggests that emotional responses precede and often override rational analysis.

The concept of loss aversion, first described by Kahneman and Tversky, illustrates this phenomenon clearly. Research consistently demonstrates that the psychological pain of losing a given sum of money is approximately twice as powerful as the pleasure derived from gaining an equivalent amount. This asymmetry profoundly influences investment behaviour, risk assessment, and everyday consumer choices.

Organisations have begun applying these insights through nudge theory — the practice of designing choice architectures that guide individuals toward beneficial decisions without restricting their freedom of choice. Governments in the United Kingdom, the United States, and Australia have established dedicated behavioural insight units to incorporate these principles into public policy.`,
        synonymMap: {
          'assumption': ['belief','premise','presupposition'],
          'consistently': ['regularly','repeatedly','reliably'],
          'progressively': ['gradually','incrementally','steadily'],
          'dismantled': ['overturned','destroyed','taken apart'],
          'sequencing': ['ordering','arrangement','progression'],
          'asymmetry': ['imbalance','disproportion','unevenness'],
          'profoundly': ['deeply','significantly','greatly'],
          'incorporates': ['includes','integrates','embeds'],
        },
        questionSets: [
          {
            type: 'tfng',
            instruction: 'Do the following statements agree with the information in the passage?',
            questions: [
              { id: 7,  statement: 'Homo economicus assumes people always act to maximise personal gain.',           answer: 'TRUE',      explanation: 'Directly stated in paragraph 1.' },
              { id: 8,  statement: 'Brain scans show emotional responses occur after rational analysis.',            answer: 'FALSE',     explanation: 'Emotional responses precede rational analysis.' },
              { id: 9,  statement: 'Kahneman and Tversky were the first to study financial decision-making.',       answer: 'NOT GIVEN', explanation: 'They described loss aversion; no claim about being first to study financial decisions.' },
              { id: 10, statement: 'Losing money causes greater psychological distress than gaining the same amount brings pleasure.', answer: 'TRUE', explanation: 'Loss aversion — pain approximately twice as powerful.' },
            ]
          },
          {
            type: 'match',
            instruction: 'Choose the correct letter A, B, C or D.',
            questions: [
              {
                id: 11,
                stem: 'According to the passage, nudge theory involves:',
                options: ['A. forcing people to make better decisions', 'B. restricting harmful consumer choices through legislation', 'C. designing environments that encourage positive choices while preserving freedom', 'D. educating individuals about cognitive biases'],
                answer: 'C',
                explanation: 'Nudge theory = guiding decisions without restricting freedom of choice.',
              },
              {
                id: 12,
                stem: 'The writer\'s main purpose in this passage is to:',
                options: ['A. argue that economics is an unreliable science', 'B. explain how brain science has challenged traditional economic theory', 'C. promote the use of nudge theory in government', 'D. describe Kahneman and Tversky\'s research in detail'],
                answer: 'B',
                explanation: 'The passage traces how neuroscience has overturned the rational agent model.',
              },
              {
                id: 13,
                stem: 'The word "dismantled" in paragraph 1 is closest in meaning to:',
                options: ['A. confirmed', 'B. expanded', 'C. gradually destroyed', 'D. questioned'],
                answer: 'C',
                explanation: 'Dismantled = progressively taken apart/overturned.',
              },
            ]
          }
        ]
      }
    ]
  },

  // ── WRITING ────────────────────────────────────────────────────────────────
  writing: {
    timeLimit: 60 * 60,
    tasks: [
      {
        id: 1,
        type: 'Task 1 — Academic',
        timeRecommended: 20,
        minWords: 150,
        prompt: 'The graph below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        chartDescription: 'Line graph: Owner-occupied housing rose from ~23% (1918) to a peak of ~69% (2001), then fell to ~64% (2011). Private rental fell from ~76% (1918) to ~9% (2001), then rose to ~15% (2011). Social rental grew from ~1% (1918) to ~20% (1981), then fell to ~17% (2011).',
        requirements: {
          overview:    { label: 'Overview paragraph', pattern: /overall|in summary|it is (clear|evident|notable)|the (most|main)/i, tip: 'Add a paragraph starting "Overall," identifying the main trend.' },
          comparison:  { label: 'Comparison language', pattern: /\b(while|whereas|compared to|in contrast|however|by contrast)\b/i, tip: 'Use "whereas", "while", or "in contrast" to compare trends.' },
          data:        { label: 'Specific figures cited', pattern: /\d+(\.\d+)?(%| percent)/i, tip: 'Reference at least one specific percentage from the chart.' },
          trendWords:  { label: 'Trend vocabulary', pattern: /\b(rose|fell|increased|decreased|declined|grew|dropped|peaked|remained|fluctuated)\b/i, tip: 'Use trend verbs: rose, fell, peaked, declined, fluctuated.' },
        }
      },
      {
        id: 2,
        type: 'Task 2 — Essay',
        timeRecommended: 40,
        minWords: 250,
        prompt: 'Some people believe that universities should focus on providing academic knowledge and theoretical skills. Others think they should prepare students for the real world of work.\n\nDiscuss both views and give your own opinion.',
        requirements: {
          thesis:      { label: 'Position stated in introduction', pattern: /\b(i (believe|think|argue|would argue)|in my (opinion|view)|this essay (will|argues))\b/i, tip: 'State your position in the introduction: "I believe that..."' },
          bothViews:   { label: 'Both views discussed', pattern: /\b(on (one|the other) hand|some people|others believe|proponents|critics)\b/i, tip: 'Discuss both perspectives — "On one hand... On the other hand..."' },
          linking:     { label: 'Linking words used', pattern: /\b(furthermore|moreover|in addition|consequently|therefore|nevertheless|however|firstly|secondly|finally|in conclusion)\b/i, tip: 'Add: Furthermore, Moreover, However, Consequently, In addition.' },
          conclusion:  { label: 'Conclusion paragraph', pattern: /\b(in conclusion|to conclude|to summarise|in summary)\b/i, tip: 'Add a conclusion starting "In conclusion," or "To conclude,"' },
          examples:    { label: 'Examples or evidence', pattern: /\b(for example|for instance|such as|to illustrate|evidence suggests|research shows)\b/i, tip: 'Add examples: "For example," or "For instance,"' },
        }
      }
    ]
  },

  // ── SPEAKING ───────────────────────────────────────────────────────────────
  speaking: {
    parts: [
      {
        part: 1,
        label: 'Part 1 — Introduction & Interview',
        duration: '4–5 minutes',
        instruction: 'The examiner will ask you general questions about yourself and familiar topics.',
        questions: [
          'Can you tell me about where you grew up?',
          'Do you prefer studying alone or with others? Why?',
          'What do you like to do in your free time?',
          'Have your hobbies changed since you were a child?',
        ]
      },
      {
        part: 2,
        label: 'Part 2 — Individual Long Turn',
        duration: '3–4 minutes',
        instruction: 'You will have 1 minute to prepare, then speak for 1–2 minutes on the topic below.',
        prepTime: 60,
        questions: [
          `Describe a time when you had to make an important decision.\n\nYou should say:\n• what the decision was\n• what options you had\n• how you made the decision\n\nAnd explain how you felt about the decision afterwards.`
        ]
      },
      {
        part: 3,
        label: 'Part 3 — Two-way Discussion',
        duration: '4–5 minutes',
        instruction: 'The examiner will ask you more abstract questions related to the topic in Part 2.',
        questions: [
          'Do you think young people today find it harder to make decisions than previous generations? Why?',
          'How has technology changed the way people make decisions?',
          'Some people say that too much choice makes decision-making more difficult. To what extent do you agree?',
        ]
      }
    ]
  }
}

// ─── TIMER COMPONENT ─────────────────────────────────────────────────────────
function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(t); onExpire?.(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const m = Math.floor(left / 60)
  const s = left % 60
  const urgent = left < 300
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: urgent ? 'rgba(247,92,92,0.12)' : 'var(--bg-card)', border: `1px solid ${urgent ? 'rgba(247,92,92,0.3)' : 'var(--border)'}` }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={urgent ? '#f75c5c' : 'var(--text-muted)'} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: urgent ? '#f75c5c' : 'var(--text-primary)', letterSpacing: '0.04em' }}>
        {m}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
function ScoreRow({ label, correct, total, color }) {
  const pct = total ? (correct / total) * 100 : 0
  const band = total ? Math.min(9, Math.max(1, (correct / total) * 8 + 1)).toFixed(1) : '—'
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{correct}/{total}</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color }}>{band}</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }}/>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MockTest() {
  const nav = useNavigate()
  const { saveScore } = useAuth()

  // phase: intro | listening | reading | writing | speaking | results
  const [phase, setPhase]           = useState('intro')
  const [section, setSection]       = useState(0)
  const [listeningAnswers, setLA]   = useState({})
  const [readingAnswers, setRA]     = useState({})
  const [writingTexts, setWT]       = useState({ 1: '', 2: '' })
  const [speakingIdx, setSpeakingIdx] = useState(0)
  const [speakingPart, setSpeakingPart] = useState(0)
  const [results, setResults]       = useState(null)
  const [showSynonym, setShowSynonym] = useState({ visible: false, word: '', synonyms: [], x: 0, y: 0 })
  const passageRef = useRef(null)

  // ── LISTENING SCORE ──────────────────────────────────────────────────────
  const calcListeningScore = () => {
    let correct = 0, total = 0
    MOCK_TEST.listening.sections.forEach(sec => {
      sec.questions.forEach(q => {
        total++
        const ans = (listeningAnswers[q.id] || '').toLowerCase().trim()
        if (q.answer.toLowerCase().split('/').some(a => ans.includes(a.trim()) && ans.length > 0)) correct++
      })
    })
    return { correct, total, band: Math.min(9, Math.max(1, (correct/total)*8+1)).toFixed(1) }
  }

  // ── READING SCORE ────────────────────────────────────────────────────────
  const calcReadingScore = () => {
    let correct = 0, total = 0
    MOCK_TEST.reading.passages.forEach(p => {
      p.questionSets.forEach(qs => {
        qs.questions.forEach(q => {
          total++
          if (readingAnswers[q.id] === q.answer) correct++
        })
      })
    })
    return { correct, total, band: Math.min(9, Math.max(1, (correct/total)*8+1)).toFixed(1) }
  }

  // ── WRITING SCORE ────────────────────────────────────────────────────────
  const calcWritingScore = () => {
    let totalPassed = 0, totalReqs = 0
    MOCK_TEST.writing.tasks.forEach(task => {
      const text = writingTexts[task.id] || ''
      Object.values(task.requirements).forEach(req => {
        totalReqs++
        if (req.pattern?.test(text)) totalPassed++
      })
    })
    const band = Math.min(9, Math.max(4, (totalPassed/totalReqs)*5+4)).toFixed(1)
    return { correct: totalPassed, total: totalReqs, band }
  }

  const finishTest = () => {
    const ls = calcListeningScore()
    const rs = calcReadingScore()
    const ws = calcWritingScore()
    const overall = ((parseFloat(ls.band) + parseFloat(rs.band) + parseFloat(ws.band)) / 3).toFixed(1)
    setResults({ listening: ls, reading: rs, writing: ws, overall })
    saveScore({ module: 'listening', band: parseFloat(ls.band), correct: ls.correct, total: ls.total })
    saveScore({ module: 'reading',   band: parseFloat(rs.band), correct: rs.correct, total: rs.total })
    saveScore({ module: 'writing',   band: parseFloat(ws.band), correct: ws.correct, total: ws.total })
    setPhase('results')
  }

  // ── SYNONYM CLICK ────────────────────────────────────────────────────────
  const handleWordClick = (e, word, synonymMap) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '')
    const syns = synonymMap[clean]
    if (!syns) return
    const rect = e.target.getBoundingClientRect()
    setShowSynonym({ visible: true, word: clean, synonyms: syns, x: rect.left, y: rect.bottom + 6 })
  }

  const renderPassage = (text, synonymMap) =>
    text.split(' ').map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '')
      const hasSyn = !!synonymMap[clean]
      return (
        <span key={i}>
          <span onClick={hasSyn ? e => handleWordClick(e, word, synonymMap) : undefined}
            style={{ cursor: hasSyn ? 'pointer' : 'text', background: hasSyn ? 'rgba(124,92,252,0.12)' : 'transparent', color: hasSyn ? '#9d7dff' : 'inherit', borderRadius: 3, padding: hasSyn ? '1px 2px' : 0 }}
            onMouseEnter={e => { if(hasSyn) e.target.style.background='rgba(124,92,252,0.22)' }}
            onMouseLeave={e => { if(hasSyn) e.target.style.background='rgba(124,92,252,0.12)' }}
          >{word}</span>{' '}
        </span>
      )
    })

  const MODULE_ORDER = ['listening','reading','writing','speaking']
  const phaseIdx = MODULE_ORDER.indexOf(phase)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} onClick={() => setShowSynonym(s => ({ ...s, visible: false }))}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', position: 'relative' }}>

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <div style={{ maxWidth: 680 }} className="fade-up">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Full mock test</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Academic IELTS — <span style={{ color: 'var(--accent)' }}>Full Mock Test 1</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
              This mock follows the real IELTS Academic format. Complete all four modules in order. Results are saved to your profile.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}>
              {[
                { icon: <IconHeadphones size={18} color="#7c5cfc"/>, label: 'Listening', detail: '3 sections · 10 questions · 30 min', color: '#7c5cfc' },
                { icon: <IconBook size={18} color="#1fd9a0"/>,       label: 'Reading',   detail: '2 passages · 13 questions · 60 min', color: '#1fd9a0' },
                { icon: <IconEdit size={18} color="#f9a825"/>,        label: 'Writing',   detail: 'Task 1 + Task 2 · 60 min',           color: '#f9a825' },
                { icon: <IconMic size={18} color="#f75c5c"/>,         label: 'Speaking',  detail: 'Parts 1–3 · AI analysis',            color: '#f75c5c' },
              ].map(m => (
                <Card key={m.label} style={{ padding: '18px 20px', borderColor: `${m.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15 }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.detail}</div>
                </Card>
              ))}
            </div>

            <Card style={{ padding: '16px 20px', marginBottom: 28, background: 'rgba(124,92,252,0.04)', borderColor: 'rgba(124,92,252,0.2)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> Complete modules in order. You cannot go back to a previous module once submitted. Speaking uses your microphone via Web Speech API.
              </div>
            </Card>

            <Button onClick={() => setPhase('listening')} style={{ fontSize: 15, padding: '13px 32px' }}>
              <IconHeadphones size={16} color="#fff"/> Begin Listening
            </Button>
          </div>
        )}

        {/* ── LISTENING ── */}
        {phase === 'listening' && (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: '#7c5cfc', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Module 1 of 4</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>Listening</h2>
              </div>
              <Timer seconds={MOCK_TEST.listening.timeLimit} onExpire={() => setPhase('reading')}/>
            </div>

            {/* Audio player slot */}
            <Card style={{ marginBottom: 20 }}>
              {MOCK_TEST.listening.audioSrc ? (
                <audio src={MOCK_TEST.listening.audioSrc} controls style={{ width: '100%', borderRadius: 8 }}/>
              ) : (
                <div style={{ padding: '20px', borderRadius: 10, background: 'var(--bg-secondary)', border: '2px dashed var(--border-soft)', textAlign: 'center' }}>
                  <IconHeadphones size={28} color="var(--text-muted)"/>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Audio file not attached — set <code style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4 }}>audioSrc</code> in MockTest.jsx</div>
                </div>
              )}
            </Card>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {MOCK_TEST.listening.sections.map((s, i) => (
                <button key={i} onClick={() => setSection(i)} style={{
                  padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: section === i ? 'rgba(124,92,252,0.15)' : 'var(--bg-card)',
                  color: section === i ? '#7c5cfc' : 'var(--text-secondary)',
                  border: `1px solid ${section === i ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`,
                }}>
                  Section {i + 1}
                </button>
              ))}
            </div>

            {/* Current section */}
            {MOCK_TEST.listening.sections.map((sec, si) => si === section && (
              <Card key={sec.id}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{sec.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{sec.context}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, fontStyle: 'italic' }}>{sec.instruction}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {sec.questions.map(q => (
                    <div key={q.id}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                        Q{q.id}. {q.label || q.text}
                      </label>
                      {sec.type === 'form' && (
                        <input type="text" placeholder="Your answer..." value={listeningAnswers[q.id] || ''}
                          onChange={e => setLA(a => ({ ...a, [q.id]: e.target.value }))}
                          style={{ width: '100%', maxWidth: 320, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#7c5cfc'} onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                        />
                      )}
                      {sec.type === 'map' && (
                        <select value={listeningAnswers[q.id] || ''} onChange={e => setLA(a => ({ ...a, [q.id]: e.target.value }))}
                          style={{ width: '100%', maxWidth: 320, padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                          <option value="">Select...</option>
                          {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                      {sec.type === 'mcq' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {q.options.map(opt => (
                            <button key={opt} onClick={() => setLA(a => ({ ...a, [q.id]: opt[0] }))} style={{
                              padding: '9px 14px', borderRadius: 9, border: `1px solid ${listeningAnswers[q.id] === opt[0] ? '#7c5cfc' : 'var(--border)'}`,
                              background: listeningAnswers[q.id] === opt[0] ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                              color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: 13, transition: 'all 0.15s',
                            }}>{opt}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {si === MOCK_TEST.listening.sections.length - 1 && (
                  <div style={{ marginTop: 24 }}>
                    <Button onClick={() => setPhase('reading')} style={{ background: 'linear-gradient(135deg, #7c5cfc, #9d7dff)' }}>
                      Submit Listening → Reading <IconChevronRight size={15} color="#fff"/>
                    </Button>
                  </div>
                )}
                {si < MOCK_TEST.listening.sections.length - 1 && (
                  <button onClick={() => setSection(si + 1)} style={{ marginTop: 20, padding: '9px 20px', borderRadius: 9, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                    Next section →
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* ── READING ── */}
        {phase === 'reading' && (
          <div className="fade-up" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: '#1fd9a0', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Module 2 of 4</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>Reading</h2>
              </div>
              <Timer seconds={MOCK_TEST.reading.timeLimit} onExpire={() => setPhase('writing')}/>
            </div>

            {/* Passage tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {MOCK_TEST.reading.passages.map((p, i) => (
                <button key={i} onClick={() => setSection(i)} style={{
                  padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: section === i ? 'rgba(31,217,160,0.15)' : 'var(--bg-card)',
                  color: section === i ? '#1fd9a0' : 'var(--text-secondary)',
                  border: `1px solid ${section === i ? 'rgba(31,217,160,0.3)' : 'var(--border)'}`,
                }}>
                  Passage {i + 1}
                </button>
              ))}
            </div>

            {MOCK_TEST.reading.passages.map((passage, pi) => pi === section && (
              <div key={passage.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Passage text */}
                <div ref={passageRef} style={{ position: 'relative' }}>
                  <Card style={{ position: 'sticky', top: 20, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Passage {pi + 1}</div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{passage.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.95, color: 'var(--text-secondary)' }}>
                      {renderPassage(passage.text, passage.synonymMap)}
                    </div>
                    <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(124,92,252,0.06)', borderRadius: 8, fontSize: 11, color: '#9d7dff' }}>
                      Purple words have synonyms — click to reveal
                    </div>
                  </Card>

                  {/* Synonym popup */}
                  {showSynonym.visible && (
                    <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', left: showSynonym.x, top: showSynonym.y, background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 16px', zIndex: 50, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>"{showSynonym.word}"</div>
                      {showSynonym.synonyms.map(s => <div key={s} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>{s}</div>)}
                    </div>
                  )}
                </div>

                {/* Questions */}
                <div>
                  {passage.questionSets.map((qs, qsi) => (
                    <Card key={qsi} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{qs.type === 'tfng' ? 'True / False / Not Given' : 'Multiple Choice'}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>{qs.instruction}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {qs.questions.map(q => (
                          <div key={q.id}>
                            <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Q{q.id}. </span>
                              {q.statement || q.stem}
                            </div>
                            {qs.type === 'tfng' ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                {['TRUE','FALSE','NOT GIVEN'].map(opt => (
                                  <button key={opt} onClick={() => setRA(a => ({ ...a, [q.id]: opt }))} style={{
                                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                    background: readingAnswers[q.id] === opt ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                                    color: readingAnswers[q.id] === opt ? 'var(--accent)' : 'var(--text-secondary)',
                                    transition: 'all 0.15s',
                                  }}>{opt}</button>
                                ))}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {q.options.map(opt => (
                                  <button key={opt} onClick={() => setRA(a => ({ ...a, [q.id]: opt[0] }))} style={{
                                    padding: '8px 12px', borderRadius: 8, border: `1px solid ${readingAnswers[q.id] === opt[0] ? 'var(--accent)' : 'var(--border)'}`,
                                    background: readingAnswers[q.id] === opt[0] ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: 12, transition: 'all 0.15s',
                                  }}>{opt}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}

                  {pi === MOCK_TEST.reading.passages.length - 1 ? (
                    <Button onClick={() => setPhase('writing')} style={{ background: 'linear-gradient(135deg, #1fd9a0, #16b888)', width: '100%' }}>
                      Submit Reading → Writing <IconChevronRight size={15} color="#fff"/>
                    </Button>
                  ) : (
                    <button onClick={() => setSection(pi + 1)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                      Next passage →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── WRITING ── */}
        {phase === 'writing' && (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: '#f9a825', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Module 3 of 4</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>Writing</h2>
              </div>
              <Timer seconds={MOCK_TEST.writing.timeLimit} onExpire={() => setPhase('speaking')}/>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {MOCK_TEST.writing.tasks.map((t, i) => (
                <button key={i} onClick={() => setSection(i)} style={{
                  padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: section === i ? 'rgba(249,168,37,0.15)' : 'var(--bg-card)',
                  color: section === i ? '#f9a825' : 'var(--text-secondary)',
                  border: `1px solid ${section === i ? 'rgba(249,168,37,0.3)' : 'var(--border)'}`,
                }}>
                  {t.type.split('—')[0].trim()}
                </button>
              ))}
            </div>

            {MOCK_TEST.writing.tasks.map((task, ti) => ti === section && (
              <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
                <div>
                  <Card style={{ marginBottom: 16, borderColor: 'rgba(249,168,37,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f9a825', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{task.type}</div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{task.prompt}</p>
                    {task.chartDescription && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {task.chartDescription}
                      </div>
                    )}
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      Min {task.minWords} words · Recommended: {task.timeRecommended} minutes
                    </div>
                  </Card>

                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Your response</span>
                      <span style={{ fontSize: 12, color: (writingTexts[task.id]||'').trim().split(/\s+/).filter(Boolean).length >= task.minWords ? '#1fd9a0' : 'var(--text-muted)' }}>
                        {(writingTexts[task.id]||'').trim().split(/\s+/).filter(Boolean).length} / {task.minWords} words
                      </span>
                    </div>
                    <textarea value={writingTexts[task.id] || ''} onChange={e => setWT(t => ({ ...t, [task.id]: e.target.value }))}
                      placeholder={`Write your ${task.type} response here...`} rows={14}
                      style={{ width: '100%', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.8, fontFamily: "'Inter',sans-serif", resize: 'vertical', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#f9a825'} onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                    />

                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                      {ti < MOCK_TEST.writing.tasks.length - 1 ? (
                        <button onClick={() => setSection(ti + 1)} style={{ padding: '10px 20px', borderRadius: 9, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                          Next task →
                        </button>
                      ) : (
                        <Button onClick={() => setPhase('speaking')} style={{ background: 'linear-gradient(135deg, #f9a825, #f5a014)' }}>
                          Submit Writing → Speaking <IconChevronRight size={15} color="#fff"/>
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Linter */}
                <Card style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Structure linter</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(task.requirements).map(([key, req]) => {
                      const pass = req.pattern?.test(writingTexts[task.id] || '')
                      return (
                        <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: pass ? 'rgba(31,217,160,0.15)' : 'rgba(247,92,92,0.1)', border: `1.5px solid ${pass ? '#1fd9a0' : '#f75c5c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {pass ? <svg width="8" height="8" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="#1fd9a0" strokeWidth="2" strokeLinecap="round"/></svg>
                                  : <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#f75c5c' }}/>}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: pass ? '#1fd9a0' : 'var(--text-secondary)' }}>{req.label}</div>
                            {!pass && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.5 }}>{req.tip}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* ── SPEAKING ── */}
        {phase === 'speaking' && (
          <div className="fade-up" style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#f75c5c', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Module 4 of 4</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>Speaking</h2>
            </div>

            <Card style={{ marginBottom: 16, borderColor: 'rgba(247,92,92,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f75c5c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {MOCK_TEST.speaking.parts[speakingPart].label}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
                {MOCK_TEST.speaking.parts[speakingPart].instruction}
              </p>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '16px', marginBottom: 16, whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                "{MOCK_TEST.speaking.parts[speakingPart].questions[speakingIdx]}"
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Q{speakingIdx + 1} of {MOCK_TEST.speaking.parts[speakingPart].questions.length}
                </div>
                <div style={{ flex: 1 }}/>
                {speakingIdx < MOCK_TEST.speaking.parts[speakingPart].questions.length - 1 ? (
                  <button onClick={() => setSpeakingIdx(i => i + 1)} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                    Next question →
                  </button>
                ) : speakingPart < MOCK_TEST.speaking.parts.length - 1 ? (
                  <Button onClick={() => { setSpeakingPart(p => p + 1); setSpeakingIdx(0) }} style={{ background: 'rgba(247,92,92,0.15)', color: '#f75c5c' }}>
                    Next Part →
                  </Button>
                ) : (
                  <Button onClick={finishTest} style={{ background: 'linear-gradient(135deg, #f75c5c, #ff8c8c)' }}>
                    Finish test → Results
                  </Button>
                )}
              </div>
            </Card>

            <Card style={{ padding: '14px 18px', background: 'rgba(247,92,92,0.04)', borderColor: 'rgba(247,92,92,0.15)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Speaking is self-assessed in this mock. For AI-powered fluency analysis, use the dedicated <button onClick={() => nav('/speaking')} style={{ background: 'none', border: 'none', color: '#f75c5c', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600 }}>Speaking module</button> which records your microphone and detects pauses.
              </div>
            </Card>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && results && (
          <div className="fade-up" style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Results</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 24 }}>Mock Test Complete</h1>

            <Card glow style={{ textAlign: 'center', padding: '40px 32px', marginBottom: 20, background: 'linear-gradient(160deg, var(--bg-card), #0f0f1e)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>OVERALL BAND ESTIMATE</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 80, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {results.overall}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>Results saved to your profile</div>
            </Card>

            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Module breakdown</div>
              <ScoreRow label="Listening" correct={results.listening.correct} total={results.listening.total} color="#7c5cfc"/>
              <ScoreRow label="Reading"   correct={results.reading.correct}   total={results.reading.total}   color="#1fd9a0"/>
              <ScoreRow label="Writing"   correct={results.writing.correct}   total={results.writing.total}   color="#f9a825"/>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Speaking — use the Speaking module for AI analysis</div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="ghost" onClick={() => { setPhase('intro'); setLA({}); setRA({}); setWT({ 1:'', 2:'' }); setSpeakingPart(0); setSpeakingIdx(0); setSection(0); setResults(null) }}>
                Retake test
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
