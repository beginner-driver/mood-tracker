# Mood Tracker — 구현 스펙 (for coding agent)

> 이 문서는 코딩 에이전트용 구현 지시서다. 아래 요구사항과 수용 기준(AC)을
> 모두 만족하도록 구현하라. 명시되지 않은 부분은 "가장 단순하고 표준적인
> 방법"을 택하고, 임의 라이브러리 추가는 하지 마라.

## 0. 목표
지금의 기분을 색으로 기록하는 웹앱. 사용자는 이메일로 로그인해 하루에 여러 번
기분(4단계)과 선택적 한줄 메모를 남기고, 자신의 기록을 조회·수정·삭제한다.
다른 기기에서 재로그인해도 자기 기록이 그대로 보여야 한다.

## 1. 기술 스택 (고정 — 변경 금지)
- 프론트: React 18 + Vite 5 (JavaScript, TypeScript 아님)
- 백엔드: Supabase (Postgres + Supabase Auth + RLS)
- 클라이언트 SDK: `@supabase/supabase-js` v2
- 배포 타깃: GitHub Pages (정적)
- 추가 상태관리 라이브러리·CSS 프레임워크·UI 키트 사용 금지. 스타일은 순수 CSS.

## 2. 환경 / 셋업 전제
- env 변수 두 개만 사용: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- 키는 코드에 하드코딩 금지. `import.meta.env`로만 읽는다.
- `.env`는 `.gitignore`에 포함. 저장소에는 `.env.example`만 커밋.
- `service_role` key는 어디에도(코드/번들/저장소) 넣지 마라.
- `vite.config.js`의 `base`는 `/mood-tracker/` (배포 저장소명 기준, 주석으로 안내).

## 3. 파일 구조 (이 구조를 따르라)
```
mood-tracker/
├─ index.html
├─ package.json
├─ vite.config.js
├─ .env.example
├─ .gitignore
├─ README.md
├─ supabase/
│  └─ schema.sql            # DB 초기화 (테이블 + 제약 + RLS + trigger)
└─ src/
   ├─ main.jsx
   ├─ App.jsx               # 세션 상태 + 화면 전환 + 데이터삭제 액션
   ├─ styles.css
   ├─ supabaseClient.js     # env 읽어 createClient
   ├─ lib/
   │  └─ moods.js           # CRUD 함수 + MOODS 상수
   └─ components/
      ├─ Auth.jsx           # 회원가입/로그인
      ├─ MoodComposer.jsx   # 기분 선택 + 메모 → 생성
      └─ MoodList.jsx       # 목록 + 오늘필터 + 인라인수정 + 삭제
```

## 4. 데이터 모델 (schema.sql 에 그대로 반영)
`auth.users`는 Supabase 관리 테이블이므로 직접 만들지 않는다.

```sql
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

create table public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mood       int  not null check (mood between 1 and 4),
  memo       text,
  created_at timestamptz default now()
);
create index moods_user_created_idx on public.moods (user_id, created_at desc);
```
- 회원가입 시 `profiles` 행을 자동 생성하는 `after insert on auth.users` trigger를
  `security definer` 함수로 구현.

## 5. 기능 요구사항 + 수용 기준(AC)

### F1. 인증 (Auth.jsx)
이메일/비밀번호 회원가입·로그인 토글 UI.
- AC1: 회원가입 성공 시 `auth.users` + `profiles` 행이 함께 생성된다.
- AC2: 로그인 성공 시 앱 화면으로 전환된다(수동 새로고침 없이).
- AC3: 실패 시 사용자에게 읽을 수 있는 에러 메시지를 보여준다(스택트레이스 X).

### F2. 기분 기록 생성 — C (MoodComposer.jsx)
4개 색상 스와치(우울/안정/활력/격앙) 중 하나 선택 + 한줄 메모(선택).
- AC1: 기분 미선택 상태로 저장 시도 시 저장되지 않고 안내가 뜬다.
- AC2: 저장 성공 시 입력이 초기화되고 목록이 즉시 갱신된다.
- AC3: 메모가 비어 있으면 DB에 `null`로 저장된다.

### F3. 기록 조회 — R (MoodList.jsx)
내 기록을 최신순으로 표시. "오늘만" 토글 필터.
- AC1: 로그인한 사용자 본인의 기록만 보인다(타 유저 것 안 보임).
- AC2: "오늘만" 체크 시 당일 00:00 이후 기록만 표시된다.
- AC3: 기록이 없으면 빈 상태 안내를 보여준다.
- AC4: 각 행에 기분 색상·라벨·메모(있으면)·시각이 표시된다.

### F4. 기록 수정 — U (MoodList.jsx)
행 단위 인라인 수정(기분·메모 변경).
- AC1: 수정 후 저장하면 해당 행이 즉시 갱신된 값으로 보인다.
- AC2: 취소 시 원래 값이 유지된다.

### F5. 기록 삭제 — D (MoodList.jsx)
행 단위 삭제. 확인 프롬프트 후 실행.
- AC1: 삭제 확인 시 해당 행이 목록과 DB에서 사라진다.

### F6. 내 데이터 전체 삭제 + 로그아웃 (App.jsx)
계정(auth.users) 자체 삭제는 하지 않는다(클라이언트 권한 없음).
- AC1: 확인 프롬프트 후, 내 moods 전체를 hard delete 하고 로그아웃한다.
- AC2: 실행 후 로그인 화면으로 돌아간다.
- 주석/README에 "실무는 soft delete가 일반적이나 과제 시연 목적상 hard delete"를 명시.

## 6. 보안 요구사항 (필수)
- RLS를 두 테이블 모두 `enable`하고, `auth.uid()` 매칭 정책(select/insert/update/delete)을 넣는다.
- 정책 없이 배포 금지. anon key만으로 타 유저 데이터에 접근되면 안 된다.
- 검증: 서로 다른 두 계정으로 각각 기록을 만든 뒤, A로 로그인해 B의 기록이
  0건으로 나오는지 확인 가능해야 한다.

## 7. UI / 디자인 토큰 (styles.css)
색이 이 앱의 정체성이다. 아래 토큰을 CSS 변수로 정의하고 스와치·로그 점에 사용:
```
--mood-1: #3c6e8f;  /* 우울: 깊은 청록 */
--mood-2: #6fa287;  /* 안정: 세이지   */
--mood-3: #e0a53d;  /* 활력: 앰버     */
--mood-4: #e06a4b;  /* 격앙: 코랄     */
```
- 배경은 쿨 뉴트럴(예 #eceef1)로 색을 죽이지 않게.
- display 폰트/utility 폰트 각 1종(예: Space Grotesk / Inter).
- 반응형(모바일까지), `:focus-visible` 표시, `prefers-reduced-motion` 존중.
- 저장 버튼 라벨은 동작 그대로("기록하기"), 성공/실패 안내는 인터페이스 목소리로.

## 8. 하지 말 것 (Out of scope / anti-goals)
- 소셜 로그인, 비밀번호 재설정 메일, 통계/차트, 알림, 다국어.
- Realtime 구독, Edge Function(계정 삭제 포함).
- 색상 HEX를 DB에 저장하지 마라(값 1~4만 저장, 색은 프론트 매핑).
- TypeScript 전환, 라우터 도입, 전역 상태 라이브러리 도입.

## 9. 완료 정의 (Definition of Done)
- [ ] `npm install && npm run build`가 에러 없이 통과한다.
- [ ] F1~F6의 모든 AC를 만족한다.
- [ ] `schema.sql` 한 번 실행으로 테이블·RLS·trigger가 모두 세팅된다.
- [ ] `.env`가 저장소에 커밋되지 않는다.
- [ ] README에 셋업·배포·보안 체크리스트 대응표가 있다.
- [ ] 6절 RLS 격리 검증이 통과한다.
