import { useEffect, useState, useCallback } from 'react'
import { MOODS, moodMeta, listMoods, updateMood, deleteMood } from '../lib/moods'

// 내 기분 로그 목록. 오늘만 보기 필터 + 각 행의 수정/삭제.
export default function MoodList({ refreshKey }) {
  const [rows, setRows] = useState([])
  const [todayOnly, setTodayOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [editing, setEditing] = useState(null) // 수정 중인 row id

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      setRows(await listMoods({ todayOnly }))
    } catch (e) {
      setErr(e.message ?? '불러오기에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [todayOnly])

  useEffect(() => { load() }, [load, refreshKey])

  async function remove(id) {
    if (!confirm('이 기록을 삭제할까요?')) return
    await deleteMood(id)
    load()
  }

  return (
    <section className="log">
      <div className="log-head">
        <h2>기록</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={todayOnly}
            onChange={(e) => setTodayOnly(e.target.checked)}
          />
          오늘만
        </label>
      </div>

      {loading && <p className="dim">불러오는 중…</p>}
      {err && <p className="notice">{err}</p>}
      {!loading && rows.length === 0 && (
        <p className="empty">아직 기록이 없어요. 위에서 첫 기분을 남겨보세요.</p>
      )}

      <ul className="log-list">
        {rows.map((r) =>
          editing === r.id ? (
            <EditRow
              key={r.id}
              row={r}
              onDone={() => { setEditing(null); load() }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <li key={r.id} className="log-row" style={{ '--dot': moodMeta(r.mood)?.color }}>
              <span className="log-dot" />
              <div className="log-body">
                <span className="log-label">{moodMeta(r.mood)?.label}</span>
                {r.memo && <span className="log-memo">{r.memo}</span>}
                <time className="log-time">{fmt(r.created_at)}</time>
              </div>
              <div className="log-actions">
                <button className="ghost" onClick={() => setEditing(r.id)}>수정</button>
                <button className="ghost danger" onClick={() => remove(r.id)}>삭제</button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}

// 인라인 수정 행 (U)
function EditRow({ row, onDone, onCancel }) {
  const [mood, setMood] = useState(row.mood)
  const [memo, setMemo] = useState(row.memo ?? '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await updateMood(row.id, { mood, memo })
      onDone()
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="log-row editing">
      <div className="edit-swatches">
        {MOODS.map((m) => (
          <button
            key={m.value}
            className={'mini-swatch' + (mood === m.value ? ' is-selected' : '')}
            style={{ '--swatch': m.color }}
            onClick={() => setMood(m.value)}
            aria-label={m.label}
          />
        ))}
      </div>
      <input
        className="memo"
        value={memo}
        maxLength={120}
        placeholder="한 줄 메모 (선택)"
        onChange={(e) => setMemo(e.target.value)}
      />
      <div className="log-actions">
        <button className="ghost" onClick={save} disabled={busy}>저장</button>
        <button className="ghost" onClick={onCancel}>취소</button>
      </div>
    </li>
  )
}

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
