import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { purgeMyDataAndSignOut } from './lib/moods'
import Auth from './components/Auth'
import MoodComposer from './components/MoodComposer'
import MoodList from './components/MoodList'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    // 로그인/로그아웃 실시간 반영
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return <div className="boot">불러오는 중…</div>

  if (!session) {
    return <main className="shell centered"><Auth /></main>
  }

  async function purge() {
    if (!confirm('내 기분 기록을 모두 삭제하고 로그아웃합니다. 되돌릴 수 없어요. 계속할까요?')) return
    await purgeMyDataAndSignOut()
  }

  return (
    <main className="shell">
      <header className="topbar">
        <span className="brand small">기분<span className="brand-dot" />트래커</span>
        <div className="topbar-actions">
          <span className="who">{session.user.email}</span>
          <button className="ghost" onClick={() => supabase.auth.signOut()}>로그아웃</button>
          <button className="ghost danger" onClick={purge}>데이터 삭제</button>
        </div>
      </header>

      <MoodComposer onCreated={() => setRefreshKey((k) => k + 1)} />
      <MoodList refreshKey={refreshKey} />
    </main>
  )
}
