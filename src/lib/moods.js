import { supabase } from '../supabaseClient'

// 기분 4단계 정의 — DB에는 값(1~4)만 저장하고 색/라벨은 프론트에서 매핑한다.
export const MOODS = [
  { value: 1, label: '우울', color: 'var(--mood-1)' },
  { value: 2, label: '안정', color: 'var(--mood-2)' },
  { value: 3, label: '활력', color: 'var(--mood-3)' },
  { value: 4, label: '격앙', color: 'var(--mood-4)' },
]

export const moodMeta = (value) => MOODS.find((m) => m.value === value)

// ── C: 기분 로그 생성 ──────────────────────────────────────
export async function createMood({ mood, memo }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { data, error } = await supabase
    .from('moods')
    .insert({ mood, memo: memo?.trim() || null, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── R: 내 기분 로그 조회 (최신순). todayOnly=true 면 오늘 것만 ──
export async function listMoods({ todayOnly = false } = {}) {
  let query = supabase
    .from('moods')
    .select('*')
    .order('created_at', { ascending: false })

  if (todayOnly) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    query = query.gte('created_at', start.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── U: 기분 로그 수정 ──────────────────────────────────────
export async function updateMood(id, { mood, memo }) {
  const patch = {}
  if (mood !== undefined) patch.mood = mood
  if (memo !== undefined) patch.memo = memo?.trim() || null

  const { data, error } = await supabase
    .from('moods')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── D: 기분 로그 삭제 ──────────────────────────────────────
export async function deleteMood(id) {
  const { error } = await supabase.from('moods').delete().eq('id', id)
  if (error) throw error
}

// ── D(user 대체): 내 데이터 전체 삭제 + 로그아웃 ───────────────
// 실무에선 보통 soft delete(deleted_at) 를 쓰지만, 본 과제는 CRUD 시연
// 목적이라 hard delete 로 구현한다. anon key 로는 계정(auth.users) 자체를
// 지울 수 없어(service_role 필요) 데이터 삭제 + 로그아웃으로 처리한다.
export async function purgeMyDataAndSignOut() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const del = await supabase.from('moods').delete().eq('user_id', user.id)
  if (del.error) throw del.error

  await supabase.auth.signOut()
}
