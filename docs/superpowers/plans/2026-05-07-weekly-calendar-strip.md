# Weekly Calendar Strip + Google Calendar Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** subnav와 칸반 보드 사이에 이번 주 달력 스트립을 추가하고, 칸반 카드 due date 및 Google Calendar 이벤트를 표시한다.

**Architecture:** 단일 `index.html` 파일에 CSS/HTML/JS를 순서대로 추가한다. 달력 스트립은 `#weekStrip` div로, 보드 뷰에서만 표시된다. Google Calendar 연동은 GIS(Google Identity Services) 클라이언트 사이드 OAuth를 사용하며, 토큰은 sessionStorage에만 저장한다.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Identity Services (GIS), Google Calendar API v3

---

## File Structure

- **Modify:** `index.html` (CSS 섹션, HTML 바디, JS 섹션 모두 이 파일 하나)

---

### Task 1: CSS 추가

**Files:**
- Modify: `index.html` — `<style>` 블록 맨 끝 (`</style>` 직전)

- [ ] **Step 1: week strip CSS를 `</style>` 직전에 삽입**

아래 코드를 `index.html`의 `</style>` 바로 앞에 추가한다.

```css
  /* WEEK STRIP */
  .week-strip {
    background: rgba(0,0,0,0.18);
    backdrop-filter: blur(6px);
    padding: 8px 20px;
    display: flex;
    align-items: stretch;
    gap: 0;
  }
  .week-nav-btn {
    background: rgba(255,255,255,0.12);
    border: none;
    border-radius: 4px;
    color: rgba(255,255,255,0.7);
    font-size: 18px;
    cursor: pointer;
    padding: 0 10px;
    align-self: center;
    line-height: 1;
    flex-shrink: 0;
  }
  .week-nav-btn:hover { background: rgba(255,255,255,0.22); color: #fff; }
  .week-days {
    display: flex;
    flex: 1;
    align-items: stretch;
    gap: 4px;
  }
  .week-day-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 4px;
    border-radius: 6px;
    min-width: 0;
  }
  .week-day-col.today { background: rgba(200,96,26,0.22); }
  .week-day-name {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .week-day-num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
  }
  .week-day-col.today .week-day-num {
    background: #c8601a;
    color: #fff;
  }
  .week-chips {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    align-items: stretch;
  }
  .week-chip {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    text-align: center;
  }
  .week-chip.kanban { background: rgba(0,82,204,0.75); color: #fff; }
  .week-chip.gcal   { background: rgba(0,135,90,0.75); color: #fff; }
  .week-chip.more   { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); }
  .week-gcal-section {
    flex: 0 0 160px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 5px;
    border-left: 1px solid rgba(255,255,255,0.1);
    padding-left: 14px;
    margin-left: 10px;
  }
  .gcal-connect-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    border-radius: 6px;
    padding: 6px 11px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .gcal-connect-btn:hover { background: rgba(255,255,255,0.25); }
  .gcal-status { font-size: 10px; color: rgba(255,255,255,0.6); }
```

- [ ] **Step 2: 브라우저에서 확인**

`index.html`을 브라우저로 열어 에러 없이 로드되는지 콘솔 확인. 아직 변경된 UI 없음.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style: add week strip CSS"
```

---

### Task 2: HTML 삽입

**Files:**
- Modify: `index.html` — `<!-- BOARD -->` 주석 바로 위

- [ ] **Step 1: week strip HTML을 `<!-- BOARD -->` 주석 바로 앞에 삽입**

아래 HTML을 `index.html`에서 `<!-- BOARD -->` 바로 앞 줄에 추가한다.

```html
<!-- WEEK STRIP -->
<div class="week-strip" id="weekStrip" style="display:none">
  <button class="week-nav-btn" onclick="changeWeek(-1)" title="이전 주">‹</button>
  <div class="week-days" id="weekDays"></div>
  <button class="week-nav-btn" onclick="changeWeek(1)" title="다음 주">›</button>
  <div class="week-gcal-section">
    <div id="gcalStatus" class="gcal-status"></div>
    <button class="gcal-connect-btn" id="gcalConnectBtn" onclick="connectGoogle()">🔗 Connect Google Calendar</button>
  </div>
</div>

```

- [ ] **Step 2: 브라우저에서 확인**

`index.html`을 열고, Elements 탭에서 `#weekStrip`이 존재하는지 확인. `display:none`이라 화면에 보이지 않음 — 정상.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add week strip HTML scaffold"
```

---

### Task 3: GIS 스크립트 태그 및 상수/상태 변수 추가

**Files:**
- Modify: `index.html` — `<head>` 안, `<script>` 블록 상단

- [ ] **Step 1: GIS 스크립트 태그를 `</head>` 직전에 추가**

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

- [ ] **Step 2: `<script>` 블록 맨 위 (`// ── DATA ──` 주석 바로 위)에 상수와 상태 변수 추가**

```js
// ── WEEK STRIP ────────────────────────────────────────
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Google Cloud Console에서 발급한 OAuth Client ID로 교체
const GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/calendar.readonly';

let weekOffset     = 0;   // 0 = 이번주, -1 = 지난주, +1 = 다음주
let googleToken    = null;
let calendarEvents = [];
let tokenClient    = null;
```

- [ ] **Step 3: 브라우저 콘솔에서 확인**

브라우저 콘솔에서 `weekOffset` 입력 → `0` 출력 확인.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add GIS script and week strip state variables"
```

---

### Task 4: 헬퍼 함수 구현 (`getWeekDays`, `getCardsForDate`)

**Files:**
- Modify: `index.html` — `// ── WEEK STRIP ──` 섹션 안

- [ ] **Step 1: `// ── RENDER ──` 주석 바로 위에 아래 두 함수를 추가**

```js
function getWeekDays(offset) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일, 1=월...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getCardsForDate(isoDateStr) {
  // card.date는 ISO 형식 (YYYY-MM-DD)이어야 매칭됨. 레거시 텍스트 형식은 무시.
  return cards.filter(c => c.date === isoDateStr && c.col !== 'done');
}
```

- [ ] **Step 2: 브라우저 콘솔에서 검증**

콘솔에서 다음을 실행하여 정상 작동 확인:

```js
// 이번 주 7일 배열 출력 — 첫 번째가 월요일이어야 함
getWeekDays(0).map(d => d.toLocaleDateString('ko-KR', {weekday:'short', month:'2-digit', day:'2-digit'}))
```

결과: `['월 05. 05.', '화 05. 06.', ...]` 형태로 월요일부터 7개 출력.

```js
// 카드 due date 매칭 확인 (due date가 있는 카드가 있다면)
getCardsForDate('2026-09-20') // 기본 데이터의 카드 확인
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add getWeekDays and getCardsForDate helpers"
```

---

### Task 5: `renderWeekStrip()` 구현

**Files:**
- Modify: `index.html` — `getCardsForDate` 바로 아래

- [ ] **Step 1: `renderWeekStrip` 함수 추가**

```js
function renderWeekStrip() {
  const el = document.getElementById('weekDays');
  if (!el) return;

  const days     = getWeekDays(weekOffset);
  const todayStr = todayISO(); // 기존 함수 재사용
  const names    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  el.innerHTML = days.map((d, i) => {
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isToday = iso === todayStr;

    const dayCards = getCardsForDate(iso);
    const dayEvents = calendarEvents.filter(e => {
      const start = e.start.dateTime || e.start.date || '';
      return start.startsWith(iso);
    });

    const chips = [];

    dayCards.slice(0, 2).forEach(c => {
      chips.push(`<div class="week-chip kanban" title="${c.title}">${c.title}</div>`);
    });

    dayEvents.slice(0, 2).forEach(e => {
      let label = e.summary || '(no title)';
      if (e.start.dateTime) {
        const t = new Date(e.start.dateTime);
        const hh = String(t.getHours()).padStart(2,'0');
        const mm = String(t.getMinutes()).padStart(2,'0');
        label = `${hh}:${mm} ${label}`;
      }
      chips.push(`<div class="week-chip gcal" title="${e.summary || ''}">${label}</div>`);
    });

    const total = dayCards.length + dayEvents.length;
    const shown = Math.min(dayCards.length, 2) + Math.min(dayEvents.length, 2);
    if (total > shown) {
      chips.push(`<div class="week-chip more">+${total - shown}</div>`);
    }

    return `
      <div class="week-day-col${isToday ? ' today' : ''}">
        <div class="week-day-name">${names[i]}</div>
        <div class="week-day-num">${d.getDate()}</div>
        <div class="week-chips">${chips.join('')}</div>
      </div>`;
  }).join('');
}
```

- [ ] **Step 2: `#weekStrip`을 임시로 표시해서 렌더 확인**

브라우저 콘솔에서:

```js
document.getElementById('weekStrip').style.display = '';
renderWeekStrip();
```

결과: subnav 아래에 월~일 7칸 달력 스트립이 나타나고, 오늘 날짜 칸이 주황색으로 강조되어야 함.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: implement renderWeekStrip"
```

---

### Task 6: 주 이동 (`changeWeek`) 구현

**Files:**
- Modify: `index.html` — `renderWeekStrip` 바로 아래

- [ ] **Step 1: `changeWeek` 함수 추가**

```js
function changeWeek(delta) {
  weekOffset += delta;
  if (googleToken) {
    fetchCalendarEvents().then(() => renderWeekStrip());
  } else {
    renderWeekStrip();
  }
}
```

- [ ] **Step 2: 브라우저에서 ‹ › 버튼 클릭 테스트**

콘솔에서 `document.getElementById('weekStrip').style.display = '';` 후 renderWeekStrip() 실행,
이후 ‹ 버튼 클릭 → 지난주 날짜로 변경, › 버튼 클릭 → 원복 확인.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add week navigation (changeWeek)"
```

---

### Task 7: `showPage()` 수정 및 초기화 코드 추가

**Files:**
- Modify: `index.html` — 기존 `showPage` 함수, 파일 맨 아래 init 코드

- [ ] **Step 1: 기존 `showPage` 함수를 아래로 교체**

```js
function showPage(page) {
  const board    = document.getElementById('board');
  const logPage  = document.getElementById('logPage');
  const strip    = document.getElementById('weekStrip');
  const btnBoard = document.getElementById('btnBoard');
  const btnLog   = document.getElementById('btnLog');
  if (page === 'log') {
    board.style.display   = 'none';
    strip.style.display   = 'none';
    logPage.classList.add('open');
    btnBoard.classList.remove('active');
    btnLog.classList.add('active');
    renderLog();
  } else {
    board.style.display   = '';
    strip.style.display   = '';
    logPage.classList.remove('open');
    btnBoard.classList.add('active');
    btnLog.classList.remove('active');
    renderWeekStrip();
  }
}
```

- [ ] **Step 2: 파일 맨 아래 init 코드 (`renderBoardTabs(); renderAll();`) 뒤에 아래 추가**

```js
// week strip 초기화
document.getElementById('weekStrip').style.display = '';
renderWeekStrip();

// 세션 토큰 복원 (탭을 닫지 않고 새로고침한 경우)
const _savedToken = sessionStorage.getItem('gcal_token');
if (_savedToken) {
  googleToken = _savedToken;
  updateGcalUI(true);
  fetchCalendarEvents().then(() => renderWeekStrip());
}
```

- [ ] **Step 3: 브라우저에서 검증**

1. 페이지 새로고침 → 주간 스트립이 보드 위에 보여야 함
2. "Daily Log & Analytics" 탭 클릭 → 스트립 숨겨짐
3. "Board" 탭 클릭 → 스트립 다시 나타남

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: wire week strip to showPage and init"
```

---

### Task 8: Google 인증 함수 구현

**Files:**
- Modify: `index.html` — `changeWeek` 함수 아래

- [ ] **Step 1: Google 인증 관련 함수 4개 추가**

```js
function updateGcalUI(connected) {
  const btn    = document.getElementById('gcalConnectBtn');
  const status = document.getElementById('gcalStatus');
  if (!btn || !status) return;
  if (connected) {
    btn.textContent = '✕ Disconnect';
    btn.onclick     = disconnectGoogle;
    status.textContent = '✅ Connected';
  } else {
    btn.textContent = '🔗 Connect Google Calendar';
    btn.onclick     = connectGoogle;
    status.textContent = '';
  }
}

function handleGoogleToken(response) {
  if (response.error) {
    console.error('Google auth error:', response.error);
    return;
  }
  googleToken = response.access_token;
  sessionStorage.setItem('gcal_token', googleToken);
  updateGcalUI(true);
  fetchCalendarEvents().then(() => renderWeekStrip());
}

function connectGoogle() {
  if (GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
    alert('Google Client ID가 설정되지 않았습니다.\nindex.html의 GOOGLE_CLIENT_ID 상수를 채워주세요.');
    return;
  }
  if (!tokenClient) {
    if (typeof google === 'undefined') {
      alert('Google SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     GOOGLE_SCOPES,
      callback:  handleGoogleToken,
    });
  }
  tokenClient.requestAccessToken();
}

function disconnectGoogle() {
  if (googleToken && typeof google !== 'undefined') {
    google.accounts.oauth2.revoke(googleToken, () => {});
  }
  googleToken    = null;
  calendarEvents = [];
  tokenClient    = null;
  sessionStorage.removeItem('gcal_token');
  updateGcalUI(false);
  renderWeekStrip();
}
```

- [ ] **Step 2: `GOOGLE_CLIENT_ID` 플레이스홀더 상태에서 Connect 버튼 클릭 테스트**

"Connect Google Calendar" 클릭 →
`"Google Client ID가 설정되지 않았습니다..."` 알림이 뜨면 정상.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: implement Google OAuth connect/disconnect"
```

---

### Task 9: `fetchCalendarEvents()` 구현 및 연동

**Files:**
- Modify: `index.html` — `disconnectGoogle` 함수 바로 아래

- [ ] **Step 1: `fetchCalendarEvents` 함수 추가**

```js
async function fetchCalendarEvents() {
  if (!googleToken) return;
  const days  = getWeekDays(weekOffset);
  const start = days[0].toISOString();
  const end   = new Date(days[6]);
  end.setHours(23, 59, 59, 999);

  try {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
      `timeMin=${encodeURIComponent(start)}` +
      `&timeMax=${encodeURIComponent(end.toISOString())}` +
      `&singleEvents=true&orderBy=startTime&maxResults=50`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    if (res.status === 401) {
      // 토큰 만료
      disconnectGoogle();
      return;
    }

    const data = await res.json();
    calendarEvents = data.items || [];
  } catch (e) {
    console.error('Calendar fetch failed:', e);
    calendarEvents = [];
  }
}
```

- [ ] **Step 2: Google Cloud Console 설정 (사용자가 직접 수행)**

1. [console.cloud.google.com](https://console.cloud.google.com) 접속 → 새 프로젝트 생성
2. "API 및 서비스" → "라이브러리" → "Google Calendar API" 검색 → 사용 설정
3. "사용자 인증 정보" → "OAuth 동의 화면" → 외부 선택, 앱 이름/이메일 입력, 테스트 모드 유지
4. "테스트 사용자"에 본인 Gmail 추가
5. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" → 웹 애플리케이션
6. "승인된 JavaScript 출처"에 `https://jynlab.com` 추가 (로컬 테스트용으로 `http://localhost:8080`도 추가)
7. 발급된 클라이언트 ID를 복사

- [ ] **Step 3: `GOOGLE_CLIENT_ID` 상수에 실제 ID 입력**

`index.html` 상단의:
```js
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
```
를 실제 Client ID로 교체:
```js
const GOOGLE_CLIENT_ID = '123456789-xxxxxxxxxxxx.apps.googleusercontent.com';
```

- [ ] **Step 4: 로컬에서 서버를 띄워 Google OAuth 테스트**

Google OAuth는 `file://`에서 작동하지 않으므로 로컬 서버가 필요:

```bash
cd /Users/jinyeongpark/Desktop/PROJECTS_2026/projects/free-kanban-tracker
npx serve . -p 8080
```

브라우저에서 `http://localhost:8080` 열기 →
"🔗 Connect Google Calendar" 클릭 → Google 로그인 팝업 → 승인 →
달력 스트립에 이번 주 이벤트가 녹색 칩으로 표시되는지 확인.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: fetch Google Calendar events and render in week strip"
```

---

### Task 10: 최종 검증 및 배포

**Files:**
- Modify: `index.html` (필요 시 마무리 수정)

- [ ] **Step 1: 전체 시나리오 체크리스트**

| 시나리오 | 기대 결과 |
|---------|----------|
| 페이지 최초 로드 | 보드 위에 이번 주 달력 스트립 표시, 오늘 날짜 주황 강조 |
| due date 있는 카드가 존재 | 해당 요일 칸에 파란 칩으로 카드 제목 표시 |
| ‹ 버튼 클릭 | 지난주 날짜로 이동 |
| › 버튼 클릭 | 다음주 날짜로 이동 |
| "Daily Log" 탭 클릭 | 스트립 숨겨짐 |
| "Board" 탭 클릭 | 스트립 다시 표시 |
| "Connect Google Calendar" 클릭 | Google 로그인 팝업 |
| Google 연결 완료 | 이번 주 이벤트가 녹색 칩으로 표시, "✅ Connected" 상태 |
| "Disconnect" 클릭 | 이벤트 칩 사라짐, 버튼 원복 |
| 새로고침 (세션 유지 중) | 토큰 복원 → 이벤트 재표시 |
| 탭 닫고 재오픈 | 토큰 초기화 → 연결 해제 상태 |

- [ ] **Step 2: 배포**

```bash
npm run deploy
```

(혹은 `wrangler pages deploy` — `package.json`에 정의된 명령 사용)

- [ ] **Step 3: 배포 후 프로덕션 확인**

`https://jynlab.com/free-kanban-tracker` 에서 동일하게 동작하는지 확인.
Google Cloud Console 승인 출처에 `https://jynlab.com`이 등록되어 있으면 OAuth도 작동함.

- [ ] **Step 4: 최종 Commit**

```bash
git add index.html
git commit -m "feat: weekly calendar strip with Google Calendar integration complete"
```
