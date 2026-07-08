'use client'
import { useState, useEffect } from 'react'
import { Check, Phone, XCircle } from 'lucide-react'
import { projectTypes } from '@/data/common'

/**
 * 무료 진단 신청 폼 (재사용).
 * - /diagnosis 페이지, 홈 우측 고정 폼 등에서 공용으로 사용
 * - compact: 우측 고정 패널처럼 좁은 공간용으로 여백/글씨를 줄임
 */
// 예시용 데모 — 문의 내역 DB 저장 중단 (제출 버튼 비활성화, 재개하려면 false 로)
const SUBMIT_DISABLED = true

export default function DiagnosisForm({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState({ name: '', phone: '', type: '', industry: '', note: '', agree: false })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  // 맞춤 플랜 위젯에서 넘어온 경우 폼 자동 채움 (제작 종류·업종·상황 메모)
  useEffect(() => {
    const raw = sessionStorage.getItem('weflow_quiz_prefill')
    if (!raw) return
    try {
      const p = JSON.parse(raw)
      setForm(f => ({
        ...f,
        type: p.type || f.type,
        industry: p.industry || f.industry,
        note: p.note || f.note,
      }))
    } catch {}
    sessionStorage.removeItem('weflow_quiz_prefill')
  }, [])

  // 작성 "중간"인 사람만 이탈 모달 대상: 뭔가 입력했지만 필수항목은 아직 미완성
  useEffect(() => {
    const touched = !!(form.name || form.phone || form.type || form.industry || form.note || form.agree)
    const complete = !!(form.name && form.phone && form.type && form.agree)
    if (touched && !complete) {
      sessionStorage.setItem('weflow_form_intent', '1')
      window.dispatchEvent(new Event('weflow-intent'))  // 뒤로가기 트랩 무장
    } else {
      sessionStorage.removeItem('weflow_form_intent')
    }
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (SUBMIT_DISABLED) return
    if (!form.name || !form.phone || !form.type || !form.agree) {
      setShowErrors(true)
      const firstId =
        !form.name ? 'dg-name'
        : !form.phone ? 'dg-phone'
        : !form.type ? 'dg-type'
        : 'dg-agree'
      const el = document.getElementById(firstId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.focus({ preventScroll: true })
      }
      return
    }
    setLoading(true)
    setSubmitError(false)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('request failed')
      setLoading(false)
      setShowErrors(false)
      setSubmitted(true)
      sessionStorage.removeItem('weflow_form_intent')
    } catch {
      setLoading(false)
      setSubmitError(true)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '0.5rem 0' : '1rem 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
        }}>
          <Check size={30} color="#16a34a" strokeWidth={2.5} />
        </div>
        <h2 className="title-2 emphasized" style={{ marginBottom: '0.75rem' }}>
          무료 진단 신청 완료!
        </h2>
        <p className="c-muted" style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>
          담당자가 확인 후 <strong style={{ color: 'var(--text)' }}>24시간 내</strong>에 연락드리겠습니다.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:010-2971-7280" style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            background: 'var(--accent)', color: '#fff', border: '1.5px solid var(--accent)',
            padding: '0.75rem 1.25rem', borderRadius: '8px',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }} className="emphasized">
            <Phone size={16} strokeWidth={2.5} /> 바로 전화하기
          </a>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', type: '', industry: '', note: '', agree: false }); setShowErrors(false); setSubmitError(false) }}
            className="semibold"
            style={{ flex: 1, background: '#fff', border: '1.5px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', padding: '0.75rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            다시 신청하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.8rem' : '1rem' }}>
      <div>
        <label className="form-label">이름 <span style={{ color: '#ef4444' }}>*</span></label>
        <input id="dg-name" className="form-input" placeholder="홍길동" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        {showErrors && !form.name && <p className="field-error">이름을 입력해 주세요</p>}
      </div>

      <div>
        <label className="form-label">연락처 <span style={{ color: '#ef4444' }}>*</span></label>
        <input id="dg-phone" className="form-input" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        {showErrors && !form.phone && <p className="field-error">연락처를 입력해 주세요</p>}
      </div>

      <div>
        <label className="form-label">제작 종류 <span style={{ color: '#ef4444' }}>*</span></label>
        <select id="dg-type" className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ cursor: 'pointer' }}>
          <option value="">선택해 주세요</option>
          {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {showErrors && !form.type && <p className="field-error">제작 종류를 선택해 주세요</p>}
      </div>

      <div>
        <label className="form-label">업종</label>
        <input className="form-input" placeholder="예: 필라테스, 법률사무소 등" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
      </div>

      <div>
        <label className="form-label">현재 고민 / 추가 요청사항</label>
        <textarea className="form-input" rows={compact ? 2 : 3}
          placeholder="예: 문의가 없어요 / 검색이 안 돼요 / 홈페이지가 없어요"
          value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          style={{ resize: 'vertical' }} />
      </div>

      <label className="c-secondary" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', cursor: 'pointer', lineHeight: 1.5, fontSize: '0.95rem' }}>
        <input id="dg-agree" type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))}
          style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: 'var(--accent)', flexShrink: 0 }} />
        개인정보 수집 및 상담 동의 <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {showErrors && !form.agree && (
        <p className="field-error" style={{ marginTop: '-0.5rem' }}>개인정보 수집에 동의해 주세요</p>
      )}

      <button type="submit" className="btn-primary" disabled={SUBMIT_DISABLED || loading}
        style={{ fontSize: '1rem', padding: '0.9rem', justifyContent: 'center', width: '100%', marginTop: '0.25rem' }}>
        {loading ? '제출 중...' : '무료 진단 신청하기 →'}
      </button>
      {submitError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.95rem', fontWeight: 500 }}>
          <XCircle size={17} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          전송에 실패했어요. 잠시 후 다시 시도해 주세요.
        </div>
      )}
    </form>
  )
}
