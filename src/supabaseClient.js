import { createClient } from '@supabase/supabase-js'

// env 에서 읽는다. 하드코딩 금지 (체크리스트 1번).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 셋업 안 된 상태를 조용히 넘기지 말고 바로 알려준다.
  throw new Error(
    '.env 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다. .env.example 참고.',
  )
}

export const supabase = createClient(url, anonKey)
