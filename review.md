# AIFFEL Campus Code Peer Review Templete

- 코더: 박시민
- 리뷰어: 정석호

---

# PRT(Peer Review Template)

## [O] 1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요? (완성도)

**평가: ✅ 만족**

### 근거
- CRUD 완성도 (루브릭 3개 중 3개 완성)
  - ✅ Create: 회원가입, 기분 로그 생성
  - ✅ Read: 로그인, 목록 조회 + 오늘 필터
  - ✅ Update: 인라인 수정
  - ✅ Delete: 로그 삭제 / 전체 삭제 + 로그아웃

- 기술 스택 구현
  - React + Vite 프론트엔드 완성
  - Supabase (Postgres + Auth + RLS) 백엔드 구현
  - GitHub Pages 배포 완료 (https://chictimin.github.io/mood-tracker/)

### 결과물
프로젝트가 실제 운영 중인 웹앱 형태로 배포되어 있으며, 모든 CRUD 기능이 정상 작동함.

---

## [O] 2. 체크리스트에 해당하는 항목들을 모두 수행하였나요? (문제 해결)

**평가: ✅ 만족 (5/5)**

### 체크리스트 확인

- [x] **비밀값(키·비밀번호)을 코드에 직접 안 적고 환경변수로 뺐는가?**
  - `.env.example` → `.env` 복사 가이드 제공
  - `.gitignore`에 `.env` 포함
  - anon key는 환경변수 분리, service_role은 미사용
  
- [x] **가격·수량·권한 같은 검증을 백엔드에서 하는가?**
  - DB 레벨에서 `check (mood between 1 and 4)` 제약 적용
  - RLS 정책으로 DB 레벨 강제

- [x] **(Supabase를 쓴다면) RLS를 켜고 정책을 넣었는가?**
  - `schema.sql`에서 두 테이블 모두 `enable row level security` 설정
  - `auth.uid()` 매칭 정책으로 사용자 간 데이터 격리

- [x] **로그인이 필요한 데이터에 권한 확인(인가)이 들어가는가?**
  - 모든 `moods` 접근이 RLS로 본인 `user_id`로 제한
  - 다른 계정 로그인 시 데이터 격리 확인 항목 명시

- [x] **사용하는 무료 티어의 한도와 요금 알림을 아는가?**
  - Free: 500MB DB / 5GB egress / MAU 5만 / 2 프로젝트 인지
  - 7일 미사용 시 자동 일시정지 인식
  - 카드 미등록 시 과금 없음 명시

### 보안 구현 현황
README의 보안 체크리스트 5개 항목 모두 문제없이 대응됨.

---

## 종합 평가

| 항목 | 평가 | 비고 |
|------|------|------|
| 완성도 | ✅ 만족 | CRUD 완성, 보안 적용, 배포 완료 |
| 문제 해결 | ✅ 만족 | 5/5 체크리스트 완성 |

**최종 결론:** **2/2 만족** — 코드 완성도와 보안 구현이 우수합니다.

---

## 참고 링크 및 코드 개선

### 참고 링크
- Supabase RLS 정책: https://supabase.com/docs/guides/auth/row-level-security
- React + Vite 환경변수: https://vitejs.dev/guide/env-and-mode.html
- GitHub Pages 배포: https://pages.github.com/

### 개선 제안
현재 코드는 CRUD 완성도와 보안 대응이 매우 우수합니다. 다음 단계로 고려할 사항:
- 데이터 백업 및 복구 기능 (soft delete 구현)
- 기분 통계/차트 시각화
- 모바일 반응형 UI 개선
