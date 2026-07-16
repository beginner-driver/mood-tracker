# 기분 트래커 (Mood Tracker)

지금의 기분을 색으로 기록하는 과제용 웹앱. React + Vite 프론트, Supabase 백엔드(Postgres + Auth + RLS), GitHub Pages 배포.

## 기능 (CRUD)
- **C**: 회원가입(이메일), 기분 로그 생성
- **R**: 로그인, 내 로그 목록 조회 + 오늘 필터
- **U**: 로그 인라인 수정
- **D**: 로그 삭제 / 내 데이터 전체 삭제 + 로그아웃

> 참고: 실무에선 삭제는 보통 soft delete(`deleted_at`)로 처리하지만, 본 과제는 CRUD 완결성 시연 목적이라 hard delete로 구현했다. 계정(auth.users) 자체 삭제는 service_role 키가 필요해 클라이언트에서 불가하므로 "데이터 전체 삭제 + 로그아웃"으로 대체했다.

## 셋업
1. [supabase.com](https://supabase.com)에서 프로젝트 생성.
2. 대시보드 > SQL Editor에 `supabase/schema.sql` 전체를 붙여넣고 실행.
3. `.env.example`을 `.env`로 복사하고 값 채우기 (URL/anon key는 Project Settings > API):
   ```
   cp .env.example .env
   ```
4. 의존성 설치 및 실행:
   ```
   npm install
   npm run dev
   ```

## 배포 (GitHub Pages)
1. `vite.config.js`의 `base`를 실제 저장소 이름으로 수정 (`/repo-name/`).
2. `npm run build` → `dist/`를 GitHub Pages에 배포 (Actions 권장).
3. 빌드 env는 GitHub Actions Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`로 등록.

## 보안 체크리스트 대응
| 항목 | 대응 |
|------|------|
| 비밀값 환경변수 분리 | anon key는 `.env`(+`.gitignore`). service_role은 미사용. `.env` 분리는 "git에 하드코딩 안 하기"이며, anon key는 원래 공개돼도 안전한 값(RLS가 방어) |
| 백엔드 검증 | `check (mood between 1 and 4)` + RLS 정책이 DB 레벨에서 강제 |
| RLS 활성화 및 정책 | `schema.sql` — 두 테이블 모두 `enable row level security` + `auth.uid()` 매칭 |
| 로그인 데이터 인가 | 모든 moods 접근이 RLS로 본인 `user_id`로 제한 |
| 무료 티어 한도·요금 | Free: 500MB DB / 5GB egress / MAU 5만 / 2 프로젝트. **7일 미사용 시 자동 일시정지** → 제출~채점 사이 한 번 접속해 깨워둘 것. 카드 미등록 시 과금 없음 |

## 제출 전 확인
- [ ] 다른 계정으로 로그인해 남의 데이터가 안 보이는지 (RLS 실동작)
- [ ] `.env`가 git에 안 올라갔는지 (`git status`)
- [ ] 배포 URL이 실제로 열리는지 (일시정지 상태 아닌지)
