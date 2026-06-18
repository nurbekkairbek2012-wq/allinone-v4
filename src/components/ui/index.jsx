// Button
export function Button({ children, variant = 'primary', fullWidth, loading, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '12px 24px', borderRadius: 12, fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.2s', width: fullWidth ? '100%' : undefined,
    opacity: loading ? 0.7 : 1,
  }
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #7c5cfc, #9d7dff)',
      color: '#fff',
      boxShadow: '0 0 20px rgba(124,92,252,0.3)',
    },
    ghost: {
      background: 'rgba(124,92,252,0.08)',
      color: '#7c5cfc',
      border: '1px solid rgba(124,92,252,0.2)',
    },
    danger: {
      background: 'rgba(247,92,92,0.1)',
      color: '#f75c5c',
      border: '1px solid rgba(247,92,92,0.2)',
    },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} {...props}>
      {loading ? <Spinner size={16} /> : children}
    </button>
  )
}

// Input
export function Input({ label, error, icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.03em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: icon ? '13px 16px 13px 42px' : '13px 16px',
            background: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border-soft)'}`,
            borderRadius: 12,
            color: 'var(--text-primary)',
            fontSize: 15,
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = error ? 'var(--error)' : 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-soft)'}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>}
    </div>
  )
}

// Spinner
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid transparent`,
      borderTopColor: color,
      borderRightColor: color,
      borderRadius: '50%',
      animation: 'spinSlow 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// Card
export function Card({ children, style, glow, ...props }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: 24,
      boxShadow: glow ? '0 0 40px rgba(124,92,252,0.08)' : 'none',
      ...style,
    }} {...props}>
      {children}
    </div>
  )
}

// Badge
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent:  { bg: 'rgba(124,92,252,0.12)', text: '#9d7dff' },
    success: { bg: 'rgba(31,217,160,0.12)', text: '#1fd9a0' },
    error:   { bg: 'rgba(247,92,92,0.12)',  text: '#f75c5c' },
  }
  const c = colors[color] || colors.accent
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      letterSpacing: '0.04em',
    }}>
      {children}
    </span>
  )
}
