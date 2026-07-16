import { useState } from 'react'
import { MOODS, createMood } from '../lib/moods'

// 지금의 기분을 색으로 고르고 한줄 메모(optional)를 남긴다.
export default function MoodComposer({ onCreated }) {
  const [selected, setSelected] = useState(null)
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function save() {
    setErr(null)
    if (selected == null) {
      setErr('먼저 기분을 골라주세요.')
      return
    }
    setBusy(true)
    try {
      await createMood({ mood: selected, memo })
      setSelected(null)
      setMemo('')
      onCreated?.()
    } catch (e) {
      setErr(e.message ?? '저장에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="composer">
      <h2 className="composer-q">지금 기분은 어떤가요?</h2>

      <div className="swatches" role="radiogroup" aria-label="기분 선택">
        {MOODS.map((m) => (
          <button
            key={m.value}
            role="radio"
            aria-checked={selected === m.value}
            className={'swatch' + (selected === m.value ? ' is-selected' : '')}
            style={{ '--swatch': m.color }}
            onClick={() => setSelected(m.value)}
          >
            <span className="swatch-fill" />
            <span className="swatch-label">{m.label}</span>
          </button>
        ))}
      </div>

      <input
        className="memo"
        type="text"
        maxLength={120}
        placeholder="한 줄 메모 (선택)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />

      {err && <p className="notice">{err}</p>}

      <button className="primary" onClick={save} disabled={busy}>
        {busy ? '저장 중…' : '기록하기'}
      </button>
    </section>
  )
}
