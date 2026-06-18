import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'
import { Card, Badge } from '../components/ui/index'
import { IconTrophy, IconZap, IconTarget } from '../assets/icons/index'

function RankBadge({ rank }) {
  const styles = {
    1: { bg: 'rgba(255,215,0,0.15)',   color: '#FFD700', border: 'rgba(255,215,0,0.4)' },
    2: { bg: 'rgba(192,192,192,0.15)', color: '#C0C0C0', border: 'rgba(192,192,192,0.4)' },
    3: { bg: 'rgba(205,127,50,0.15)',  color: '#CD7F32', border: 'rgba(205,127,50,0.4)' },
  }
  const s = styles[rank] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)', border: 'var(--border)' }
  return (
    <div style={{ width:32, height:32, borderRadius:'50%', background:s.bg, border:`1px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:s.color, flexShrink:0 }}>
      {rank <= 3 ? <IconTrophy size={14} color={s.color}/> : rank}
    </div>
  )
}

export default function Leaderboard() {
  const { user, profile } = useAuth()
  const [filter, setFilter]   = useState('xp')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBoard() }, [filter])

  const fetchBoard = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order(filter === 'xp' ? 'xp' : filter === 'overall' ? 'overall_band' : 'streak', { ascending: false })
      .limit(50)
    if (data) setPlayers(data)
    setLoading(false)
  }

  const myRank = players.findIndex(p => p.id === user?.id) + 1

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'36px 40px', overflowY:'auto' }}>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>Community</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:30, letterSpacing:'-0.03em' }}>
            <span style={{ color:'#f9a825' }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginTop:4 }}>
            {myRank > 0 ? `You are ranked #${myRank} globally.` : 'Complete a test to appear on the board.'}
          </p>
        </div>

        {/* My rank */}
        {myRank > 0 && (
          <Card style={{ marginBottom:20, borderColor:'rgba(124,92,252,0.25)', background:'rgba(124,92,252,0.04)', padding:'16px 20px' }} className="fade-up">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:36, color:'var(--accent)' }}>#{myRank}</div>
              <div>
                <div style={{ fontWeight:600 }}>{profile?.nickname}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{profile?.xp || 0} XP · {profile?.streak || 0} day streak</div>
              </div>
              {myRank > 1 && (
                <div style={{ marginLeft:'auto', fontSize:13, color:'var(--text-secondary)' }}>
                  {((players[myRank-2]?.xp || 0) - (profile?.xp || 0))} XP behind #{myRank-1}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Filter */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[['xp','XP Points',<IconZap size={13} color="currentColor"/>],['overall','Band Score',<IconTarget size={13} color="currentColor"/>],['streak','Streak',<IconTrophy size={13} color="currentColor"/>]].map(([val,label,icon]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
              background: filter===val ? 'rgba(249,168,37,0.15)' : 'var(--bg-card)',
              color: filter===val ? '#f9a825' : 'var(--text-secondary)',
              border: `1px solid ${filter===val ? 'rgba(249,168,37,0.3)' : 'var(--border)'}`,
            }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 90px 90px 90px', padding:'12px 20px', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
            <div/><div>Player</div><div style={{textAlign:'center'}}>XP</div><div style={{textAlign:'center'}}>Band</div><div style={{textAlign:'center'}}>Streak</div>
          </div>

          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>Loading...</div>
          ) : players.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>No players yet — complete a test to appear here!</div>
          ) : players.map((p, i) => {
            const isMe = p.id === user?.id
            return (
              <div key={p.id} style={{
                display:'grid', gridTemplateColumns:'48px 1fr 90px 90px 90px',
                padding:'13px 20px', borderBottom:'1px solid var(--border)',
                background: isMe ? 'rgba(124,92,252,0.06)' : 'transparent',
                transition:'background 0.15s',
              }}
                onMouseEnter={e => { if(!isMe) e.currentTarget.style.background='var(--bg-hover)' }}
                onMouseLeave={e => { if(!isMe) e.currentTarget.style.background='transparent' }}
              >
                <div style={{ display:'flex', alignItems:'center' }}><RankBadge rank={i+1}/></div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background: isMe ? 'var(--accent-dim)' : 'var(--bg-hover)', border:`1px solid ${isMe ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color: isMe ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {(p.nickname||'?')[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: isMe ? 600 : 400, fontSize:14, color: isMe ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {p.nickname} {isMe && <span style={{ fontSize:11 }}>(you)</span>}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color: filter==='xp' ? '#f9a825' : 'var(--text-primary)' }}>{p.xp?.toLocaleString()||0}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color: filter==='overall' ? '#1fd9a0' : 'var(--text-primary)' }}>{p.overall_band||'—'}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color: filter==='streak' ? '#f75c5c' : 'var(--text-primary)' }}>{p.streak||0}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>d</span>
                </div>
              </div>
            )
          })}
        </Card>

        <div style={{ marginTop:14, fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>
          {players.length} players · Real-time via Supabase
        </div>
      </main>
    </div>
  )
}
