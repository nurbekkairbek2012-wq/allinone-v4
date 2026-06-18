import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { IconLogo, IconHeadphones, IconBook, IconEdit, IconMic, IconTrophy, IconLogout, IconZap } from '../../assets/icons/index'

function IconBot({ size=18, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="15" x2="8" y2="17"/><line x1="16" y1="15" x2="16" y2="17"/></svg>
}

function IconClipboard({ size=18, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
}

const NAVITEMS = [
  { path: '/dashboard',   label: 'Dashboard',   icon: (c) => <IconLogo size={17}/> },
  { path: '/mock',        label: 'Mock Test',   icon: (c) => <IconClipboard size={17} color={c}/>, highlight: true },
  { path: '/listening',   label: 'Listening',   icon: (c) => <IconHeadphones size={17} color={c}/> },
  { path: '/reading',     label: 'Reading',     icon: (c) => <IconBook size={17} color={c}/> },
  { path: '/writing',     label: 'Writing',     icon: (c) => <IconEdit size={17} color={c}/> },
  { path: '/speaking',    label: 'Speaking',    icon: (c) => <IconMic size={17} color={c}/> },
  { path: '/leaderboard', label: 'Leaderboard', icon: (c) => <IconTrophy size={17} color={c}/> },
  { path: '/assistant',   label: 'AI Tutor',    icon: (c) => <IconBot size={17} color={c}/>, accent: true },
]

export default function Sidebar() {
  const { user, profile, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside style={{ width:220, minHeight:'100vh', background:'var(--bg-secondary)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'24px 0', flexShrink:0 }}>

      {/* Logo */}
      <div style={{ padding:'0 20px 28px', display:'flex', alignItems:'center', gap:10 }}>
        <IconLogo size={28}/>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, letterSpacing:'-0.02em' }}>
          All<span style={{ color:'var(--accent)' }}>In</span>One
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2, padding:'0 12px' }}>
        {NAVITEMS.map((item, i) => {
          const active = location.pathname === item.path
          const color = active ? 'var(--accent)' : item.accent ? '#9d7dff' : item.highlight ? '#1fd9a0' : 'var(--text-secondary)'

          // Divider before AI Tutor
          const showDivider = item.path === '/assistant'

          return (
            <div key={item.path}>
              {showDivider && <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}/>}
              <button onClick={() => navigate(item.path)} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 12px', borderRadius:10, border:'none',
                background: active ? 'var(--accent-dim)' : item.highlight && !active ? 'rgba(31,217,160,0.06)' : 'transparent',
                color, cursor:'pointer',
                fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight: active ? 500 : 400,
                transition:'all 0.15s', width:'100%', textAlign:'left',
                borderLeft: item.highlight && !active ? '2px solid rgba(31,217,160,0.3)' : '2px solid transparent',
              }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background = item.highlight ? 'rgba(31,217,160,0.1)' : 'var(--bg-hover)' }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background = item.highlight ? 'rgba(31,217,160,0.06)' : 'transparent' }}
              >
                {item.icon(color)}
                <span>{item.label}</span>
                {item.accent && !active && (
                  <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:'var(--accent)', background:'var(--accent-dim)', padding:'2px 6px', borderRadius:99, letterSpacing:'0.06em' }}>AI</span>
                )}
                {item.highlight && !active && (
                  <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:'#1fd9a0', background:'rgba(31,217,160,0.12)', padding:'2px 6px', borderRadius:99, letterSpacing:'0.06em' }}>NEW</span>
                )}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div style={{ padding:'4px 12px' }}>
        <button onClick={toggle} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', borderRadius:10, border:'none', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent' }}
        >
          <span style={{ fontSize:15 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* User */}
      <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent-dim)', border:'1px solid rgba(124,92,252,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--accent)' }}>
            {(profile?.nickname || profile?.username || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:500, lineHeight:1.3, color:'var(--text-primary)' }}>{profile?.nickname || profile?.username || '...'}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
              <IconZap size={10} color="#7c5cfc"/> {profile?.xp || 0} XP
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', borderRadius:8, border:'none', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:13, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--error)'; e.currentTarget.style.background='rgba(247,92,92,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent' }}
        >
          <IconLogout size={15} color="currentColor"/> Sign out
        </button>
      </div>
    </aside>
  )
}
