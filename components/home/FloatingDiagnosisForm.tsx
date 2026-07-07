'use client'
import { useEffect, useRef, useState } from 'react'
import { X, ClipboardCheck } from 'lucide-react'
import DiagnosisForm from '@/components/DiagnosisForm'

/**
 * 홈 화면 전용 · 무료 진단 폼.
 * - 데스크톱(≥1200px): 기본 펼침. 오른쪽에서 스크롤을 부드럽게 따라오며, ✕로 접으면 가장자리 탭만 남음.
 * - 모바일(<1200px): 기본 접힘. "무료 진단 신청하기" 버튼을 누르면 하단 섹션이 펼쳐짐.
 * - 사이트 내 "무료 진단" CTA(/#diagnosis)를 누르면 자동으로 펼쳐짐.
 */
export default function FloatingDiagnosisForm() {
  const [collapsed, setCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const followRef = useRef<HTMLDivElement>(null)

  const isDesktop = () => window.matchMedia('(min-width: 1200px)').matches

  // 마운트 시 기기별 초기 상태 결정 (데스크톱=펼침, 모바일=접힘)
  useEffect(() => {
    const wantOpen = window.location.hash === '#diagnosis'
    setCollapsed(isDesktop() ? false : !wantOpen)
    setMounted(true)
  }, [])

  // 사이트 내 "무료 진단"(/#diagnosis) 클릭 시 펼치고 스크롤
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash !== '#diagnosis') return
      setCollapsed(false)
      if (!isDesktop()) {
        setTimeout(() => {
          document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 60)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // 데스크톱: 스크롤 위치를 easing으로 따라가며 이동
  useEffect(() => {
    if (!mounted) return
    const mq = window.matchMedia('(min-width: 1200px)')
    const rail = railRef.current
    const follow = followRef.current
    if (!rail || !follow) return

    let cur = 0
    let raf = 0
    let running = false
    let started = false

    const restOffset = () => {
      const h = follow.offsetHeight
      return Math.max(88, (window.innerHeight - h) / 2)
    }
    const targetTop = () => {
      const shellTop = rail.getBoundingClientRect().top + window.scrollY
      return window.scrollY + restOffset() - shellTop
    }
    const tick = () => {
      if (!mq.matches) { follow.style.top = ''; running = false; return }
      const t = targetTop()
      if (!started) { cur = t; started = true }
      cur += (t - cur) * 0.1
      follow.style.top = `${cur}px`
      if (Math.abs(t - cur) > 0.3) {
        raf = requestAnimationFrame(tick)
      } else {
        follow.style.top = `${t}px`
        running = false
      }
    }
    const kick = () => {
      if (!mq.matches) { follow.style.top = ''; return }
      if (!running) { running = true; raf = requestAnimationFrame(tick) }
    }

    kick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    mq.addEventListener('change', kick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      mq.removeEventListener('change', kick)
    }
  }, [collapsed, mounted])

  return (
    <div
      ref={railRef}
      id="diagnosis"
      className={`floating-diag${collapsed ? ' is-collapsed' : ''}${mounted ? '' : ' not-ready'}`}
    >
      <div ref={followRef} className="diag-follow">
        {/* 접힘 상태 트리거 (모바일: 전체폭 버튼 / 데스크톱: 가장자리 세로 탭) */}
        <button
          type="button"
          className="diag-reopen"
          onClick={() => setCollapsed(false)}
          aria-label="무료 진단 폼 열기"
        >
          <ClipboardCheck size={18} strokeWidth={2.2} />
          무료 진단 신청하기
        </button>

        {/* 폼 카드 */}
        <div className="diag-card">
          <button
            type="button"
            className="diag-collapse"
            onClick={() => setCollapsed(true)}
            aria-label="폼 접기"
          >
            <X size={18} />
          </button>

          <div style={{ marginBottom: '1.2rem' }}>
            <p className="caption-2 emphasized c-accent" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>FREE · 무료</p>
            <h2 className="title-2 emphasized" style={{ margin: '0 0 0.35rem' }}>
              무료 진단 신청
            </h2>
            <p className="c-muted" style={{ margin: 0, fontSize: '0.9rem' }}>2분이면 충분합니다. 부담 없이 신청하세요.</p>
          </div>

          <DiagnosisForm compact />
        </div>
      </div>

      <style>{`
        .floating-diag.not-ready { visibility: hidden; }
        .diag-reopen { display: none; }

        /* ── 모바일/태블릿: 하단 섹션 ── */
        .floating-diag {
          background: var(--bg-secondary);
          padding: 2.5rem 1.25rem 3rem;
        }
        .floating-diag.is-collapsed { padding: 1.75rem 1.25rem; }

        .floating-diag .diag-card {
          position: relative;
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 1.75rem;
          max-width: 420px;
          margin: 0 auto;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }
        .floating-diag.is-collapsed .diag-card { display: none; }

        /* 모바일 접힘 트리거: 전체폭 버튼 */
        .floating-diag.is-collapsed .diag-follow {
          display: flex;
          justify-content: center;
        }
        .floating-diag.is-collapsed .diag-reopen {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          max-width: 420px;
          padding: 1rem 1.25rem;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(23,96,201,0.25);
        }

        /* 폼 접기 버튼 (카드 우상단 ✕) */
        .diag-collapse {
          display: flex;
          position: absolute;
          top: 12px;
          right: 12px;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.15s;
          z-index: 2;
        }
        .diag-collapse:hover { background: rgba(0,0,0,0.05); }

        /* ── 데스크톱: 오른쪽에서 스크롤 따라 이동 ── */
        @media (min-width: 1200px) {
          .floating-diag {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: 400px;
            padding: 0 !important;
            background: transparent;
            z-index: 40;
            pointer-events: none;   /* 빈 영역 클릭 통과, 카드만 조작 */
          }
          .floating-diag .diag-follow {
            position: absolute;
            top: 0;
            right: 20px;
            width: 360px;
            will-change: top;
          }
          .floating-diag .diag-card {
            pointer-events: auto;
            margin: 0;
            max-width: none;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            box-shadow: 0 12px 40px rgba(0,0,0,0.14);
          }

          /* 접힘: 카드 숨기고 가장자리 세로 탭 (탭도 함께 따라 이동) */
          .floating-diag.is-collapsed .diag-follow {
            right: 0;
            width: auto;
            display: block;
          }
          .floating-diag.is-collapsed .diag-reopen {
            display: inline-flex;
            pointer-events: auto;
            width: auto;
            max-width: none;
            writing-mode: vertical-rl;
            padding: 1.1rem 0.6rem;
            border-radius: 10px 0 0 10px;
            font-size: 0.9rem;
            box-shadow: 0 6px 20px rgba(0,0,0,0.18);
          }
          .floating-diag.is-collapsed .diag-reopen svg { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  )
}
