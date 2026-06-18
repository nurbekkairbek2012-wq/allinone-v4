import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Загружаем юзера из localStorage при старте
  useEffect(() => {
    const stored = localStorage.getItem('aio_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const register = async ({ username, password, nickname }) => {
    // Проверяем уникальность
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (existing) return { error: 'Этот логин уже занят' }

    // Вставляем нового юзера
    const { data, error } = await supabase
      .from('users')
      .insert({ username, nickname, password })
      .select()
      .single()

    if (error) return { error: error.message }

    localStorage.setItem('aio_user', JSON.stringify(data))
    setUser(data)
    return { success: true }
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async ({ username, password }) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle()

    if (error || !data) return { error: 'Неверный логин или пароль' }

    localStorage.setItem('aio_user', JSON.stringify(data))
    setUser(data)
    return { success: true }
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('aio_user')
    setUser(null)
  }

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  const updateProfile = async (patch) => {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      localStorage.setItem('aio_user', JSON.stringify(data))
      setUser(data)
    }
  }

  // ── SAVE SCORE ────────────────────────────────────────────────────────────
  const saveScore = async ({ module, band, correct = 0, total = 0, pauses = 0, wordCount = 0 }) => {
    if (!user) return
    await supabase.from('scores').insert({
      user_id: user.id, module, band, correct, total,
      pauses, word_count: wordCount,
    })
    const xpGain = Math.round((band || 0) * 10)
    await updateProfile({ xp: (user.xp || 0) + xpGain })
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile: user, // алиас для совместимости
      loading,
      register,
      login,
      logout,
      updateProfile,
      updateUser: updateProfile,
      saveScore,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
