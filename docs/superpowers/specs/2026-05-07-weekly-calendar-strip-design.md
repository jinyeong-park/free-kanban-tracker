# Weekly Calendar Strip + Google Calendar Integration

**Date:** 2026-05-07  
**Status:** Approved

---

## Overview

subnav(메뉴)와 칸반 보드 사이에 이번 주 달력 스트립을 추가한다. 각 날짜 아래에 칸반 카드의 due date를 표시하고, 사용자가 Google 계정으로 로그인하면 Google Calendar 이벤트도 함께 표시한다.

---

## Layout

```
topnav
subnav (Board / Daily Log 탭, 보드 탭, Export/Import)
──────────────────────────────────────────────────────────────
[ 주간 달력 스트립                        | Google Cal 영역 ]
[  Mon  Tue  Wed  Thu  Fri  Sat  Sun     | [🔗 Connect]     ]
[   5    6    7   [8]   9   10   11      | (연결 후 이벤트)  ]
[  ●태스크  ●미팅             ●발표     |                  ]
──────────────────────────────────────────────────────────────
보드 (칸반 컬럼들)
```

---

## 주간 달력 스트립

### 스타일
- 배경: `rgba(0,0,0,0.18)` + `backdrop-filter: blur(6px)` — 기존 subnav 스타일과 통일
- 높이: 약 90px
- 좌우 패딩: 기존 subnav와 동일하게 `20px`
- 오늘 날짜: 주황색 원(`#c8601a` 계열)으로 강조

### 구조
- 왼쪽: 7개 날짜 컬럼 (월~일)
- 오른쪽: Google Calendar 연결 영역 (`flex-shrink: 0`, 너비 약 180px)
- `< 이전주` / `다음주 >` 내비게이션 버튼 (스트립 좌우 끝)

### 각 날짜 컬럼
```
[요일 (Mon)]
[날짜 숫자 (8)]  ← 오늘이면 주황 원
[칸반 dot 목록]  ← due date가 있는 카드
[Google 이벤트]  ← 연결 후 표시
```

### 칸반 카드 due date 표시
- 해당 날짜에 due date가 있는 카드를 최대 2개 미니 칩으로 표시
- 초과 시 `+N` 텍스트
- 칩 색상: 카드의 태그 색 또는 기본 파란색
- 클릭 시 아무 동작 없음 (이번 범위 외)

### Google Calendar 이벤트 표시
- 연결 후 해당 날짜의 이벤트를 최대 2개 파란 계열 칩으로 표시
- 칸반 카드 칩 아래에 구분 없이 함께 표시
- 이벤트 시간(start time)을 칩 앞에 작게 표시: `10:00 회의`

---

## Google Calendar 연동

### 인증 방식
- **Google Identity Services (GIS)** — 클라이언트 사이드 OAuth 2.0, 백엔드 없음
- **scope**: `https://www.googleapis.com/auth/calendar.readonly`
- **토큰 저장**: sessionStorage (탭 닫으면 자동 만료)

### Google Cloud 설정 (1회, 앱 소유자가 직접)
1. Google Cloud Console → 프로젝트 생성
2. Google Calendar API 활성화
3. OAuth 동의 화면: 테스트 모드, 테스트 사용자 이메일 등록 (최대 100명)
4. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션, 승인된 출처: `https://jynlab.com`)
5. `index.html`의 `GOOGLE_CLIENT_ID` 상수에 발급된 Client ID 입력

### 연결 흐름
1. 사용자가 "Connect Google Calendar" 버튼 클릭
2. Google OAuth 팝업 → 계정 선택 및 권한 승인
3. 이번 주 이벤트를 Google Calendar API v3로 fetch
4. 달력 스트립에 이벤트 표시
5. "Disconnect" 버튼으로 연결 해제 가능 (sessionStorage 토큰 제거)

### 주 변경 시 재fetch
- 이전주/다음주로 이동 시 해당 주 이벤트를 재fetch

---

## 기술 구현

### 추가할 스크립트
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 새로 추가할 JS 함수들
| 함수 | 역할 |
|------|------|
| `renderWeekStrip()` | 달력 스트립 HTML 생성 및 DOM 업데이트 |
| `getWeekDays(offset)` | offset 주 기준 Mon~Sun Date 배열 반환 |
| `getCardsForDate(dateStr)` | 해당 날짜에 due date 있는 카드 반환 |
| `initGoogleAuth()` | GIS TokenClient 초기화 |
| `connectGoogle()` | OAuth 팝업 트리거 |
| `disconnectGoogle()` | 토큰 제거 및 UI 초기화 |
| `fetchCalendarEvents(start, end)` | Google Calendar API로 이벤트 fetch |

### 새로 추가할 상수
```js
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // 사용자가 채워넣음
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
```

### 새로 추가할 상태 변수
```js
let weekOffset = 0;         // 0 = 이번주, -1 = 지난주, +1 = 다음주
let googleToken = null;     // GIS access token
let calendarEvents = [];    // 현재 주의 Google Calendar 이벤트 배열
```

### DOM 변경
- subnav 아래, `#board` 위에 `<div id="weekStrip">` 삽입
- `showPage()` 함수에서 board 표시 시 weekStrip도 함께 표시/숨김

---

## 범위 외 (이번 구현에서 제외)
- 양방향 동기화 (이벤트 생성/수정)
- 다른 캘린더 선택 UI
- 캘린더 이벤트 클릭 상세 보기
- 모바일 최적화

---

## 필요 파일 변경
- `index.html` 1개 파일만 수정 (스타일, HTML, JS 모두 포함)
