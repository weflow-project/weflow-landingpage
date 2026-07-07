import { redirect } from 'next/navigation'

// 무료 진단 폼은 홈 화면 오른쪽 고정 폼(및 모바일 하단 섹션)으로 통합됨.
// 기존 /diagnosis 링크는 홈의 진단 폼 위치로 보낸다.
export default function DiagnosisPage() {
  redirect('/#diagnosis')
}
