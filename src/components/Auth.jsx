import { useState } from 'react'
import { supabase } from '../supabaseClient'

// 이메일/비밀번호 인증. 회원가입·로그인 토글.
export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit() {
    setMsg(null)
    if (!email || !password) {
      setMsg('이메일과 비밀번호를 모두 입력하세요.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('가입 완료. 이제 로그인하세요.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // 성공하면 App 의 onAuthStateChange 가 화면을 전환한다.
      }
    } catch (e) {
      setMsg(e.message ?? '문제가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <h1 className="brand">기분<span className="brand-dot" />트래커</h1>
      <p className="auth-sub">오늘의 마음을 색으로 남겨두세요.</p>

      <div className="field">
        <label htmlFor="email">이메일</label>
        <input
          id="email" type="email" value={email} autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <div className="field">
        <label htmlFor="pw">비밀번호</label>
        <input
          id="pw" type="password" value={password} autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>

      {msg && <p className="notice">{msg}</p>}

      <button className="primary" onClick={submit} disabled={busy}>
        {busy ? '처리 중…' : mode === 'signup' ? '가입하기' : '로그인'}
      </button>

      <button
        className="linkish"
        onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMsg(null) }}
      >
        {mode === 'signup' ? '이미 계정이 있어요 — 로그인' : '처음이에요 — 가입하기'}
      </button>
    </div>
  )
}
