import { QUESTIONS, SCALE, TYPES, LEVELS, COMMON_MESSAGES, scoreTest } from './data-stress.js';
import {
  calculateSaju, compatibility, STEMS, STEMS_KO, BRANCHES_KO, TEN_GODS, TEN_GOD_GROUP, TWELVE_STAGES,
  tenGod, tenGodOfBranch, branchRelation, dayPillarOf, yearPillarOf, monthPillarsOf, currentSajuYear,
} from './saju.js';
import { calculateAstro } from './astro.js';
import { analyzeName, isKoreanName } from './name.js';
import {
  ELEMENT_INFO, DAY_MASTERS, TEN_GOD_GROUP_INFO, TEN_GOD_INFO, STAGE_INFO, STRENGTH_INFO, SINSAL_INFO,
  YEAR_BRANCH_INFO, COMPAT_STEM, COMPAT_DAY, COMPAT_GRADE,
} from './data-saju.js';
import { SIGNS, ASTRO_ELEMENTS } from './data-astro.js';
import { SURI, LUCK_LABEL, FLOW_INFO } from './data-name.js';
import { icon, medallion, heroScene, cardBack, standaloneMedallion, standaloneHero } from './art.js';

// ───────── 저장소 ─────────
const STORE_KEY = 'maeum:v2';
function load() {
  try {
    const cur = JSON.parse(localStorage.getItem(STORE_KEY));
    if (cur) return cur;
    // v1 → v2: 입력값만 옮긴다 (계산 결과는 매번 다시 구한다)
    const old = JSON.parse(localStorage.getItem('maeum:v1')) ?? {};
    return { me: old.saju?.input ?? null, stress: old.stress ?? null, card: old.card ?? null };
  } catch { return {}; }
}
let store = load();
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(store));

const app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD (로컬)
const EL = (i) => ELEMENT_INFO[i];
const siteUrl = () => location.href.split('#')[0];

// 입력값 → 사주·별자리·이름 풀이 (입력이 같으면 다시 계산하지 않는다)
const cache = new Map();
function reading(input) {
  if (!input?.date) return null;
  const key = JSON.stringify(input);
  if (!cache.has(key)) {
    const [year, month, day] = input.date.split('-').map(Number);
    const [hour, minute] = input.unknownTime || !input.time ? [null, 0] : input.time.split(':').map(Number);
    const args = { year, month, day, hour, minute, gender: input.gender ?? null, solarTimeCorrection: input.correction !== false };
    cache.set(key, { input, r: calculateSaju(args), astro: calculateAstro(args), name: analyzeName(input.name) });
  }
  return cache.get(key);
}
const me = () => reading(store.me);
const callName = (input) => (input?.name ? `${esc(input.name)}님` : '당신');

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2400);
}

async function share(title, text, url = siteUrl()) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); } catch { /* 사용자가 취소 */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('복사했어요. 원하는 곳에 붙여 넣어 공유해 보세요.');
  } catch {
    toast('공유를 지원하지 않는 브라우저예요.');
  }
}

// ───────── 라우터 ─────────
const routes = { '': renderHome, saju: renderSajuForm, me: renderMe, match: renderMatch, test: renderTest, result: renderResult, card: renderCard, report: renderReport };
let query = new URLSearchParams();
let firstRender = true;

function navigate() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  query = new URLSearchParams(qs ?? '');
  const view = routes[path] ?? renderHome;
  const update = () => {
    app.innerHTML = view();
    view.mount?.();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  };
  if (!firstRender && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(update);
  } else {
    update();
  }
  firstRender = false;
}
window.addEventListener('hashchange', navigate);

const emptyState = (msg, href, label) => `<section class="panel center"><p>${msg}</p><a class="btn btn-primary" href="${href}">${label}</a></section>`;
const sectionTitle = (name, text) => `<h2 class="h-sec">${icon(name, 22)}<span>${text}</span></h2>`;

// ───────── 홈 ─────────
function todayFortune(r) {
  const now = new Date();
  const p = dayPillarOf(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const g = tenGod(r.dayMaster, p.stem);
  const rel = branchRelation(r.pillars.day.branch, p.branch);
  const extra = { 충: '변화와 이동이 많은 하루예요. 서두르지 말고 여유를 두세요.', 육합: '반가운 인연과 소식이 닿기 쉬운 하루예요.', 삼합: '사람들과 힘을 모으기 좋은 하루예요.' }[rel] ?? '';
  return { p, g, info: TEN_GOD_INFO[g], extra, good: p.stemElement === r.strength.yongElement || p.branchElement === r.strength.yongElement };
}

function renderHome() {
  const m = me();
  const now = new Date();
  const dateLabel = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  const nextYear = currentSajuYear(now) + 1;
  const ny = yearPillarOf(nextYear);
  let top;
  if (m) {
    const dm = DAY_MASTERS[m.r.dayMaster];
    const t = todayFortune(m.r);
    top = `
    <a class="profile" href="#/me" style="--el:${EL(m.r.dayMasterElement).color}">
      ${medallion(dm.art, EL(m.r.dayMasterElement).color, [], 76)}
      <span class="profile-body">
        <small>${callName(m.input)}의 일주 · ${m.r.pillars.day.hanja}(${m.r.pillars.day.hangul})</small>
        <strong>${dm.title}</strong>
        <span>내 사주 풀이 전체 보기</span>
      </span>
      <span class="chev" aria-hidden="true">›</span>
    </a>
    <section class="panel today">
      <p class="eyebrow">${dateLabel} · ${t.p.hanja}일</p>
      <h2 class="today-title">오늘의 운세 <em>${t.info.name}의 날</em>${t.good ? '<span class="badge">용신일</span>' : ''}</h2>
      <p>${t.info.day} ${t.extra}</p>
      <p class="muted small">키워드 · ${t.info.keyword}</p>
    </section>`;
  } else {
    top = `<a class="btn btn-primary btn-lg" href="#/saju">내 사주 풀이 보기</a>
    <p class="muted small center">생년월일만 입력하면 1분 안에 결과가 나와요.</p>`;
  }
  const tile = (href, art, title, sub) => `<a class="tile-card" href="${href}">${icon(art, 30)}<strong>${title}</strong><span>${sub}</span></a>`;
  return `
  <section class="hero">
    ${heroScene()}
    <div class="hero-copy">
      <p class="eyebrow">正統 四柱命理 · 사주 · 별자리 · 이름</p>
      <h1>태어난 순간에 새겨진<br><em>당신의 이야기</em></h1>
      <p class="lead">절기와 진태양시까지 계산하는 정통 사주 풀이.<br>타고난 기질부터 ${nextYear}년의 흐름까지 읽어 드려요.</p>
    </div>
  </section>
  <div class="home-top">${top}</div>

  <nav class="tiles" aria-label="메뉴">
    ${tile(m ? '#/me' : '#/saju', 'palja', '사주 풀이', '원국 · 성격 · 대운')}
    ${tile(m ? '#/me?tab=flow' : '#/saju', 'sunrise', `${nextYear} 신년운세`, `${ny.hanja}년 · 월별 흐름`)}
    ${tile('#/match', 'hearts', '궁합 보기', '연인 · 친구 · 가족')}
    ${tile(m ? '#/me?tab=name' : '#/saju', 'brush', '이름 풀이', '수리 · 발음오행')}
    ${tile('#/test', 'pulse', '마음 테스트', '스트레스 유형 15문항')}
    ${tile('#/card', 'cards', '오늘의 위로 카드', '하루 한 장')}
  </nav>

  <ul class="trust">
    <li>${icon('sun', 20)}<span><strong>절기 · 진태양시 계산</strong>입춘과 12절기를 천문 계산으로 구해 연·월주를 정확히 세워요.</span></li>
    <li>${icon('moonstar', 20)}<span><strong>사주 + 점성학 + 성명학</strong>동서양의 세 가지 관점으로 나를 입체적으로 읽어요.</span></li>
    <li>${icon('lock', 20)}<span><strong>내 기기에만 저장</strong>입력한 생년월일은 서버로 보내지 않아요.</span></li>
  </ul>`;
}

// ───────── 사주 입력 ─────────
function renderSajuForm() {
  const prev = store.me ?? {};
  const invite = store.invite;
  return `
  <section class="page-head">
    <p class="eyebrow">四柱八字</p>
    <h1>사주 정보 입력</h1>
    <p class="lead">${invite ? `${esc(invite.name || '친구')}님과의 궁합을 보려면 내 정보를 먼저 알려 주세요.` : '태어난 날과 시간을 알려 주세요.'}</p>
  </section>
  <form class="panel form" id="saju-form" novalidate>
    <label class="field">
      <span>이름 <small>(선택 · 한글 실명을 넣으면 이름 풀이도 함께 봐요)</small></span>
      <input name="name" maxlength="10" autocomplete="name" value="${esc(prev.name)}" placeholder="예: 김지은">
    </label>
    <fieldset class="field">
      <legend>성별 <small>(대운의 방향을 정하는 데 필요해요)</small></legend>
      <div class="seg">
        <label><input type="radio" name="gender" value="f" ${prev.gender === 'f' ? 'checked' : ''}><span>여성</span></label>
        <label><input type="radio" name="gender" value="m" ${prev.gender === 'm' ? 'checked' : ''}><span>남성</span></label>
      </div>
      <small class="error" id="gender-error" hidden>성별을 선택해 주세요.</small>
    </fieldset>
    <label class="field">
      <span>생년월일 <small>(양력)</small></span>
      <input name="date" type="date" required min="1920-01-01" max="${today()}" value="${esc(prev.date)}">
      <small class="hint">음력 생일만 안다면 포털의 “음력 양력 변환”으로 바꿔서 입력해 주세요.</small>
      <small class="error" id="date-error" hidden>생년월일을 입력해 주세요.</small>
    </label>
    <div class="field">
      <label for="time">태어난 시간</label>
      <input id="time" name="time" type="time" value="${esc(prev.time ?? '')}" ${prev.unknownTime ? 'disabled' : ''}>
      <label class="check"><input type="checkbox" name="unknownTime" ${prev.unknownTime ? 'checked' : ''}> 시간을 몰라요</label>
      <small class="error" id="time-error" hidden>태어난 시간을 입력하거나 “시간을 몰라요”를 선택해 주세요.</small>
    </div>
    <details class="field">
      <summary>고급 설정</summary>
      <label class="check"><input type="checkbox" name="correction" ${prev.correction === false ? '' : 'checked'}> 진태양시 보정 (서울 기준 약 −30분)</label>
      <small class="hint">한국 표준시는 동경 135° 기준이라 실제 태양의 위치와 약 30분 차이가 나요. 대부분의 명리학자는 보정을 권해요.</small>
    </details>
    <button class="btn btn-primary btn-lg" type="submit">풀이 보기</button>
  </form>`;
}
renderSajuForm.mount = () => {
  const form = app.querySelector('#saju-form');
  const f = form.elements;
  f.unknownTime.addEventListener('change', () => { f.time.disabled = f.unknownTime.checked; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = { gender: !!f.gender.value, date: !!f.date.value, time: f.unknownTime.checked || !!f.time.value };
    for (const [k, v] of Object.entries(ok)) form.querySelector(`#${k}-error`).hidden = v;
    if (!ok.gender) { form.querySelector('input[name=gender]').focus(); return; }
    if (!ok.date) { f.date.focus(); return; }
    if (!ok.time) { f.time.focus(); return; }
    store.me = {
      name: f.name.value.trim(), gender: f.gender.value, date: f.date.value,
      time: f.time.value, unknownTime: f.unknownTime.checked, correction: f.correction.checked,
    };
    save();
    location.hash = store.invite ? '#/match' : '#/me';
  });
};

// ───────── 내 사주 ─────────
const TABS = [['base', '원국'], ['self', '성격'], ['flow', '운세'], ['astro', '별자리'], ['name', '이름']];

function ageOf(input) {
  const [y, m, d] = input.date.split('-').map(Number);
  const n = new Date();
  return n.getFullYear() - y - (n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d) ? 1 : 0);
}

function pillarColumn(label, p, d) {
  if (!p) {
    return `<div class="pcol is-empty"><span class="p-label">${label}</span><span class="p-god">&nbsp;</span>
      <span class="ptile">?</span><span class="ptile">?</span><span class="p-god">시간 모름</span><span class="p-sub">&nbsp;</span><span class="p-sub">&nbsp;</span></div>`;
  }
  const tile = (ch, ko, el) => `<span class="ptile" style="--el:${EL(el).color}"><b>${ch}</b><small>${ko} · ${EL(el).hanja}</small></span>`;
  return `<div class="pcol">
    <span class="p-label">${label}</span>
    <span class="p-god">${d.stemGod < 0 ? '일간(나)' : TEN_GODS[d.stemGod]}</span>
    ${tile(p.hanja[0], STEMS_KO[p.stem], p.stemElement)}
    ${tile(p.hanja[1], BRANCHES_KO[p.branch], p.branchElement)}
    <span class="p-god">${TEN_GODS[d.branchGod]}</span>
    <span class="p-sub">${d.hidden.map((s) => STEMS[s]).join(' ')}</span>
    <span class="p-sub">${TWELVE_STAGES[d.stage]}</span>
  </div>`;
}

function tabBase({ input, r }) {
  const dm = DAY_MASTERS[r.dayMaster];
  const p = r.pillars;
  const total = r.counts.reduce((a, b) => a + b, 0);
  const max = Math.max(...r.counts);
  const lacking = r.counts.flatMap((c, i) => (c === 0 ? [i] : []));
  const excess = r.counts.flatMap((c, i) => (c >= 3 && c === max ? [i] : []));
  const st = r.strength;
  const yong = EL(st.yongElement);
  const hee = EL(st.heeElement);
  return `
  <section class="panel quote-panel">
    <p class="eyebrow">남들은 잘 모르는 ${callName(input)}</p>
    <blockquote>${dm.inner}</blockquote>
  </section>

  <section class="panel">
    ${sectionTitle('palja', '사주 원국(原局)')}
    <div class="palja">
      ${pillarColumn('시주', p.hour, r.detail.hour)}
      ${pillarColumn('일주', p.day, r.detail.day)}
      ${pillarColumn('월주', p.month, r.detail.month)}
      ${pillarColumn('연주', p.year, r.detail.year)}
    </div>
    <p class="muted small">글자 위아래는 십성(十星), 그 아래는 지장간(支藏干)과 12운성이에요. 가운데 <strong>일간 ${dm.stem}</strong>이 바로 ${callName(input)} 자신을 뜻해요.</p>
  </section>

  <section class="panel">
    ${sectionTitle('sun', '오행의 분포')}
    <div class="elements">
      ${r.counts.map((c, i) => `
        <div class="el-col">
          <span class="el-bar"><span style="height:${(c / Math.max(4, total / 2)) * 100}%;background:${EL(i).color}"></span></span>
          <span class="el-num">${c}</span>
          <span class="el-name" style="color:${EL(i).color}">${EL(i).hanja}<small>${EL(i).name}</small></span>
        </div>`).join('')}
    </div>
    ${lacking.map((i) => `<div class="callout" style="--accent:${EL(i).color}"><strong>${EL(i).hanja}(${EL(i).name})의 기운이 없어요</strong><p>${EL(i).lack}</p></div>`).join('')}
    ${excess.map((i) => `<div class="callout" style="--accent:${EL(i).color}"><strong>${EL(i).hanja}(${EL(i).name})의 기운이 강해요</strong><p>${EL(i).excess}</p></div>`).join('')}
    ${!lacking.length && !excess.length ? '<p>다섯 가지 기운이 고르게 분포되어 있어요. 어느 한쪽에 치우치지 않아 상황에 따라 유연하게 대처하는 힘이 있어요.</p>' : ''}
  </section>

  <section class="panel">
    ${sectionTitle('mountain', '신강 · 신약과 용신(用神)')}
    <div class="gauge" role="img" aria-label="일간을 돕는 기운 ${st.support}%">
      <span class="gauge-track"><span class="gauge-dot" style="left:${st.support}%"></span></span>
      <span class="gauge-labels"><span>신약</span><span>중화</span><span>신강</span></span>
    </div>
    <h3 class="h-sub">${STRENGTH_INFO[st.level].title}</h3>
    <p>${STRENGTH_INFO[st.level].desc}</p>
    <div class="yong" style="--el:${yong.color}">
      <span class="yong-char">${yong.hanja}</span>
      <div>
        <strong>나의 용신은 ${yong.hanja}(${yong.name})</strong>
        <p>${TEN_GOD_GROUP_INFO[st.yongGroup].role}</p>
        <p class="muted small">용신은 사주의 균형을 잡아 주는, 나에게 가장 필요한 기운이에요. 이를 돕는 희신(喜神)은 <b style="color:${hee.color}">${hee.hanja}(${hee.name})</b>이에요.</p>
      </div>
    </div>
    <p class="chip-line"><strong>이렇게 채워 보세요</strong> ${yong.boost}</p>
  </section>

  ${r.sinsal.length ? `
  <section class="panel">
    ${sectionTitle('star', '타고난 별 · 신살(神殺)')}
    <ul class="sinsal">
      ${r.sinsal.map((k) => `<li><strong>${k} <small>${SINSAL_INFO[k].hanja}</small></strong><em>${SINSAL_INFO[k].title}</em><p>${SINSAL_INFO[k].desc}</p></li>`).join('')}
    </ul>
  </section>` : ''}
  <p class="muted small center">${r.timeKnown ? '' : '태어난 시간을 모르면 시주를 뺀 여섯 글자로 풀이해요. '}신강·신약과 용신은 학파에 따라 판단이 다를 수 있어요.</p>`;
}

function tabSelf({ input, r }) {
  const dm = DAY_MASTERS[r.dayMaster];
  const seat = TEN_GOD_INFO[r.detail.day.branchGod];
  const stage = STAGE_INFO[r.detail.day.stage];
  const topGroup = r.tenGodCounts.indexOf(Math.max(...r.tenGodCounts));
  const g = TEN_GOD_GROUP_INFO[topGroup];
  return `
  <section class="panel">
    ${sectionTitle(dm.art, '타고난 기질')}
    <p>${dm.personality}</p>
    <h3 class="h-sub">빛나는 지점</h3><p>${dm.strengths}</p>
    <h3 class="h-sub">조심하면 좋은 점</h3><p>${dm.caution}</p>
  </section>
  <section class="panel">
    ${sectionTitle('moonstar', `${r.pillars.day.hangul}일주의 속마음`)}
    <h3 class="h-sub">에너지의 결 · ${stage.name}(${stage.hanja})</h3><p>${stage.desc}</p>
    <h3 class="h-sub">가까운 관계에서의 나 · 일지 ${seat.name}</h3><p>${seat.seat}</p>
  </section>
  <section class="panel">
    ${sectionTitle('star', `나를 이끄는 힘 · ${g.name}`)}
    <h3 class="h-sub">${g.title}</h3><p>${g.desc}</p>
    <div class="god-chips">${r.tenGodCounts.map((c, i) => `<span class="${i === topGroup ? 'on' : ''}">${TEN_GOD_GROUP[i]} ${c}</span>`).join('')}</div>
  </section>
  <section class="panel">
    ${sectionTitle('hearts', '사랑할 때')}
    <p>${dm.love}</p>
  </section>
  <section class="panel">
    ${sectionTitle('brush', '일과 적성')}
    <p>${dm.work}</p>
  </section>
  <section class="panel">
    ${sectionTitle('pulse', '지칠 때 나를 돌보는 법')}
    <p>${dm.stressStyle}</p><p>${dm.healing}</p>
    <a class="btn" href="#/test">${store.stress ? '마음 테스트 결과 다시 보기' : '지금 내 스트레스 유형 알아보기'}</a>
  </section>`;
}

function yearCard(sajuYear, { input, r }, label) {
  const p = yearPillarOf(sajuYear);
  const g = tenGod(r.dayMaster, p.stem);
  const info = TEN_GOD_INFO[g];
  const rel = branchRelation(r.pillars.day.branch, p.branch);
  const yong = r.strength.yongElement;
  const good = p.stemElement === yong || p.branchElement === yong;
  const row = (title, text) => `<div><dt>${title}</dt><dd>${text}</dd></div>`;
  return `
  <section class="panel year" style="--el:${EL(p.stemElement).color}">
    <p class="eyebrow">${label}</p>
    <h2 class="year-title"><span class="year-hanja">${p.hanja}</span><span>${sajuYear}년 ${p.hangul}년<small>${info.name}(${info.hanja})의 해 · ${info.keyword}</small></span></h2>
    <p>${info.year.total}</p>
    ${good ? `<div class="callout" style="--accent:${EL(yong).color}"><strong>용신이 들어오는 해</strong><p>${callName(input)}에게 가장 필요한 ${EL(yong).hanja}(${EL(yong).name})의 기운이 들어와요. 평소보다 일이 수월하게 풀리고, 미뤄 둔 일을 시작하기에 좋아요.</p></div>` : ''}
    <dl class="areas">
      ${row('재물', info.year.money)}${row('일 · 학업', info.year.work)}${row('사랑 · 관계', info.year.love)}${row('건강', info.year.health)}
    </dl>
    ${rel ? `<div class="callout"><strong>${p.hanja[1]}(${BRANCHES_KO[p.branch]})와 내 일지의 관계 · ${rel === '같음' ? '복음' : rel}</strong><p>${YEAR_BRANCH_INFO[rel]}</p></div>` : ''}
  </section>`;
}

function monthList(sajuYear, r) {
  const yong = r.strength.yongElement;
  return `<ol class="months">
    ${monthPillarsOf(sajuYear).map((p, i) => {
    const info = TEN_GOD_INFO[tenGod(r.dayMaster, p.stem)];
    const good = p.stemElement === yong || p.branchElement === yong;
    return `<li class="${good ? 'is-good' : ''}"><span class="m-num">${i === 11 ? '1월' : `${i + 2}월`}<small>${p.hanja}</small></span><span class="m-body"><strong>${info.name}${good ? ' ★' : ''}</strong>${info.month}</span></li>`;
  }).join('')}
  </ol>`;
}

function tabFlow(m) {
  const { input, r } = m;
  const now = new Date();
  const thisYear = currentSajuYear(now);
  const lateYear = now.getMonth() >= 9 || thisYear < now.getFullYear(); // 10월~입춘 전: 신년운세가 먼저
  const lucky = EL(r.strength.yongElement);
  let daeun;
  if (r.daeun) {
    const age = ageOf(input);
    const idx = r.daeun.list.findLastIndex((d) => age >= d.age);
    const cur = r.daeun.list[idx];
    daeun = `
    <div class="daeun" tabindex="0" aria-label="대운 흐름">
      ${r.daeun.list.map((d, i) => `<div class="du ${i === idx ? 'is-now' : ''}" style="--el:${EL(d.stemElement).color};--el2:${EL(d.branchElement).color}">
        <small>${d.age}세</small><b>${d.hanja[0]}</b><b class="b2">${d.hanja[1]}</b><small>${TEN_GODS[d.stemGod]}</small></div>`).join('')}
    </div>
    ${cur ? `<h3 class="h-sub">지금은 ${cur.hanja}(${cur.hangul}) 대운 · ${cur.age}~${cur.age + 9}세</h3>
      <p><strong>${TEN_GODS[cur.stemGod]}의 10년.</strong> ${TEN_GOD_INFO[cur.stemGod].daeun}</p>
      <p class="muted">후반 5년은 지지 ${cur.hanja[1]}의 영향으로 <strong>${TEN_GODS[cur.branchGod]}</strong>(${TEN_GOD_INFO[cur.branchGod].keyword})의 기운이 강해지고, 에너지는 <strong>${TWELVE_STAGES[cur.stage]}</strong>의 흐름을 타요.</p>`
    : `<p>아직 첫 대운이 시작되기 전이에요. ${r.daeun.startAge}세부터 첫 대운이 열려요.</p>`}
    <p class="muted small">대운수 ${r.daeun.startAge} · ${r.daeun.forward ? '순행' : '역행'}. 나이는 만 나이 기준이에요.</p>`;
  } else {
    daeun = `<p>대운은 성별에 따라 흐르는 방향이 달라져요. 성별을 입력하면 10년 단위의 큰 흐름을 볼 수 있어요.</p><a class="btn" href="#/saju">성별 입력하기</a>`;
  }
  const cards = lateYear
    ? yearCard(thisYear + 1, m, `${thisYear + 1} 신년운세`) + yearCard(thisYear, m, '올해의 남은 흐름')
    : yearCard(thisYear, m, '올해의 운세') + yearCard(thisYear + 1, m, '미리 보는 내년');
  const monthYear = lateYear ? thisYear + 1 : thisYear;
  return `
  <section class="panel">
    ${sectionTitle('mountain', '대운(大運) · 10년의 큰 흐름')}
    ${daeun}
  </section>
  ${cards}
  <section class="panel">
    ${sectionTitle('sunrise', `${monthYear}년 월별 흐름`)}
    ${monthList(monthYear, r)}
    <p class="muted small">★ 표시는 용신의 기운이 들어와 특히 힘이 실리는 달이에요. 월의 경계는 절기(매달 4~8일경)를 따라요.</p>
  </section>
  <section class="panel">
    ${sectionTitle('gem', '나를 채워 주는 행운 포인트')}
    <p class="muted">용신 ${lucky.hanja}(${lucky.name})의 기운을 더해 주는 것들이에요.</p>
    <dl class="lucky">
      <div><dt>행운의 색</dt><dd>${lucky.luckyColor}</dd></div>
      <div><dt>행운의 방향</dt><dd>${lucky.direction}</dd></div>
      <div><dt>행운의 숫자</dt><dd>${lucky.numbers}</dd></div>
      <div><dt>힘이 되는 계절</dt><dd>${lucky.season}</dd></div>
      <div class="wide"><dt>가까이 두면 좋은 것</dt><dd>${lucky.items}</dd></div>
      <div class="wide"><dt>도움이 되는 음식</dt><dd>${lucky.foods}</dd></div>
    </dl>
  </section>`;
}

function tabAstro({ input, astro }) {
  const sun = SIGNS[astro.sun];
  const moon = SIGNS[astro.moon];
  const asc = astro.asc === null ? null : SIGNS[astro.asc];
  const card = (role, sub, s, text) => `
    <section class="panel sign">
      <span class="sign-symbol" aria-hidden="true">${s.symbol}</span>
      <div><p class="eyebrow">${role} · ${sub}</p><h3>${s.name} <small>${ASTRO_ELEMENTS[s.element]}의 별자리</small></h3><p>${text}</p></div>
    </section>`;
  return `
  <section class="panel">
    ${sectionTitle('moonstar', '별자리로 보는 나 · 빅3')}
    <p>서양 점성학에서는 태어난 순간 <strong>태양·달·동쪽 지평선</strong>이 어느 별자리에 있었는지로 사람을 읽어요. ${callName(input)}은
    <strong>태양 ${sun.name}</strong>, <strong>달 ${moon.name}</strong>${asc ? `, <strong>상승 ${asc.name}</strong>` : ''}의 조합이에요.</p>
  </section>
  ${card('태양궁', '나의 본질과 삶의 방향', sun, sun.sun)}
  ${card('달궁', '속마음과 감정의 습관', moon, moon.moon)}
  ${asc ? card('상승궁', '남들이 보는 첫인상', asc, asc.asc) : `<section class="panel"><p class="muted">상승궁(첫인상의 별자리)은 태어난 시간이 있어야 계산할 수 있어요.</p></section>`}
  <section class="panel quote-panel">
    <p class="eyebrow">한 문장으로 보면</p>
    <blockquote>${asc ? `겉으로는 ${asc.name}처럼 보이지만, ` : ''}속마음은 ${moon.name}의 달을 품은 ${sun.name} 사람.</blockquote>
  </section>
  <p class="muted small center">${astro.moonUncertain ? '태어난 날 달이 별자리를 옮겨 가서, 시간에 따라 달궁이 바로 옆 별자리일 수 있어요. ' : ''}열대 황도대 기준이며, 상승궁은 서울에서 태어난 것으로 보고 계산했어요.</p>`;
}

function tabName({ input, r, name }) {
  if (!name) {
    return `<section class="panel center">
      ${icon('brush', 44, 'gold')}
      <h2 class="h-sec center-title">이름 풀이</h2>
      <p>한글 이름(성 포함 2~4자)을 입력하면 획수 수리와 발음오행으로 이름의 기운을 풀어 드려요.</p>
      ${input.name && !isKoreanName(input.name) ? '<p class="muted small">지금 입력된 이름은 한글 실명 형식이 아니에요.</p>' : ''}
      <a class="btn btn-primary" href="#/saju">이름 입력하기</a>
    </section>`;
  }
  const yong = EL(r.strength.yongElement);
  const hasYong = name.elements.includes(r.strength.yongElement);
  const goodCount = name.grids.filter((g) => SURI[g.number][1] === 1).length;
  const flowKinds = [...new Set(name.flow)];
  return `
  <section class="panel">
    ${sectionTitle('brush', '이름의 소리 · 발음오행')}
    <div class="name-chars">
      ${name.chars.map((c, i) => `${i ? `<span class="flow flow-${name.flow[i - 1]}">${name.flow[i - 1]}</span>` : ''}
        <span class="nchar" style="--el:${EL(c.element).color}"><b>${c.ch}</b><small>${EL(c.element).hanja} · ${c.strokes}획</small></span>`).join('')}
    </div>
    ${flowKinds.map((k) => `<p><strong>${k}</strong> — ${FLOW_INFO[k]}</p>`).join('')}
    <div class="callout" style="--accent:${yong.color}"><strong>사주와의 어울림</strong>
      <p>${hasYong
    ? `이름의 소리에 용신인 ${yong.hanja}(${yong.name})의 기운이 들어 있어요. 사주에 필요한 부분을 이름이 채워 주고 있어요.`
    : `이름의 소리에는 용신인 ${yong.hanja}(${yong.name})의 기운이 없어요. 별명이나 닉네임, 자주 쓰는 색과 소품으로 보완해 보세요.`}</p></div>
  </section>
  <section class="panel">
    ${sectionTitle('scroll', '이름의 수리 · 원형이정(元亨利貞)')}
    <p class="muted">네 가지 격 중 <strong>${goodCount}개</strong>가 길수예요.</p>
    <ul class="grids">
      ${name.grids.map((g) => {
    const [title, luck, desc] = SURI[g.number];
    return `<li class="luck-${luck}"><span class="g-num">${g.number}</span><div><strong>${g.key} · ${title} <em>${LUCK_LABEL[luck]}</em></strong><small>${g.period}</small><p>${desc}</p></div></li>`;
  }).join('')}
    </ul>
    <p class="muted small">한글 획수 기준의 풀이예요. 정통 성명학은 한자 획수와 뜻을 함께 보기 때문에 결과가 다를 수 있어요.</p>
  </section>`;
}

const TAB_VIEWS = { base: tabBase, self: tabSelf, flow: tabFlow, astro: tabAstro, name: tabName };
let activeTab = 'base';

function renderMe() {
  const m = me();
  if (!m) return emptyState('아직 입력한 사주 정보가 없어요.', '#/saju', '사주 입력하기');
  if (TAB_VIEWS[query.get('tab')]) activeTab = query.get('tab');
  const { input, r, astro } = m;
  const dm = DAY_MASTERS[r.dayMaster];
  const el = EL(r.dayMasterElement);
  const branches = Object.values(r.pillars).filter(Boolean).map((p) => p.branch);
  return `
  <section class="result-hero" style="--el:${el.color}">
    <p class="eyebrow">${callName(input)}의 일주 · ${r.pillars.day.hanja}(${r.pillars.day.hangul})</p>
    ${medallion(dm.art, el.color, branches)}
    <h1>${dm.title}</h1>
    <p class="tagline">${STEMS_KO[r.dayMaster]}${el.ko}(${dm.stem}${el.hanja}) · ${r.yinYang}의 ${el.name} · ${r.animal}띠 · ${SIGNS[astro.sun].name}</p>
    <p class="chips">${dm.keywords.map((k) => `<span>#${k}</span>`).join('')}</p>
  </section>
  <div class="tabs" role="tablist" aria-label="풀이 항목">
    ${TABS.map(([k, label]) => `<button type="button" role="tab" id="tab-${k}" aria-selected="${k === activeTab}" aria-controls="tab-body" data-tab="${k}">${label}</button>`).join('')}
  </div>
  <div id="tab-body" role="tabpanel" aria-labelledby="tab-${activeTab}">${TAB_VIEWS[activeTab](m)}</div>
  <div class="actions">
    <button type="button" class="btn btn-primary" id="save-card">${icon('download', 20)}결과 카드 저장 · 공유</button>
    <a class="btn" href="#/match">${icon('hearts', 20)}친구 · 연인과 궁합 보기</a>
    <button type="button" class="btn btn-ghost" id="share">${icon('share', 18)}친구에게 알려 주기</button>
    <a class="btn btn-ghost" href="#/saju">정보 다시 입력하기</a>
  </div>`;
}
renderMe.mount = () => {
  const m = me();
  if (!m) return;
  const dm = DAY_MASTERS[m.r.dayMaster];
  const tabs = app.querySelector('.tabs');
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    activeTab = btn.dataset.tab;
    tabs.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    const body = app.querySelector('#tab-body');
    body.setAttribute('aria-labelledby', btn.id);
    body.innerHTML = TAB_VIEWS[activeTab](m);
    btn.scrollIntoView({ block: 'nearest', inline: 'center' });
    if (tabs.getBoundingClientRect().top <= 1) window.scrollTo({ top: body.offsetTop - tabs.offsetHeight - 8 });
  });
  app.querySelector('.tabs [aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  app.querySelector('#share').addEventListener('click', () => share('마음결 사주 풀이',
    `나는 ${m.r.pillars.day.hangul}일주, “${dm.title}”래. ${dm.keywords.map((k) => `#${k}`).join(' ')}\n소름 돋게 맞는데… 너도 해 봐!`));
  app.querySelector('#save-card').addEventListener('click', () => saveShareCard(m));
};

// ───────── 결과 카드 이미지 ─────────
const loadImage = (svg) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function saveShareCard({ input, r, astro }) {
  const dm = DAY_MASTERS[r.dayMaster];
  const el = EL(r.dayMasterElement);
  const W = 1080; const H = 1350;
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  try {
    await document.fonts.load('600 64px "Noto Serif KR"');
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1a1746'); bg.addColorStop(0.6, '#12102e'); bg.addColorStop(1, '#0c0b20');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const [hero, medal] = await Promise.all([
      loadImage(standaloneHero()),
      loadImage(standaloneMedallion(dm.art, el.color, Object.values(r.pillars).filter(Boolean).map((p) => p.branch))),
    ]);
    ctx.globalAlpha = 0.5; ctx.drawImage(hero, 0, H - 830, W, 830); ctx.globalAlpha = 1;
    const veil = ctx.createLinearGradient(0, 300, 0, H);
    veil.addColorStop(0, 'rgba(18,16,46,0)'); veil.addColorStop(0.3, 'rgba(18,16,46,0.9)'); veil.addColorStop(1, 'rgba(18,16,46,0.55)');
    ctx.fillStyle = veil; ctx.fillRect(0, 300, W, H - 300);
    ctx.strokeStyle = 'rgba(212,178,106,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.drawImage(medal, (W - 460) / 2, 150, 460, 460);

    const serif = '"Noto Serif KR", "Nanum Myeongjo", serif';
    const sans = '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4b26a'; ctx.font = `500 34px ${sans}`;
    ctx.fillText(`${input.name ? `${input.name}님의 일주` : '나의 일주'} · ${r.pillars.day.hanja} ${r.pillars.day.hangul}`, W / 2, 112);
    ctx.fillStyle = '#f6efe0'; ctx.font = `600 66px ${serif}`;
    wrapText(ctx, dm.title, W - 200).forEach((line, i) => ctx.fillText(line, W / 2, 716 + i * 84));
    ctx.fillStyle = el.color; ctx.font = `500 36px ${sans}`;
    ctx.fillText(dm.keywords.map((k) => `#${k}`).join('   '), W / 2, 806);
    ctx.fillStyle = 'rgba(246,239,224,0.9)'; ctx.font = `400 38px ${serif}`;
    const lines = wrapText(ctx, `“${dm.inner}”`, W - 220);
    lines.forEach((line, i) => ctx.fillText(line, W / 2, 900 + i * 60));
    ctx.fillStyle = 'rgba(246,239,224,0.65)'; ctx.font = `500 30px ${sans}`;
    ctx.fillText(`${r.animal}띠 · 태양 ${SIGNS[astro.sun].name} · 달 ${SIGNS[astro.moon].name}`, W / 2, 920 + lines.length * 60);
    ctx.fillStyle = '#d4b26a'; ctx.font = `600 38px ${serif}`;
    ctx.fillText('마음결', W / 2, H - 112);
    ctx.fillStyle = 'rgba(246,239,224,0.6)'; ctx.font = `400 26px ${sans}`;
    ctx.fillText(siteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, H - 70);

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const file = new File([blob], 'maeumgyeol.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: '마음결 사주 풀이', text: `나는 “${dm.title}”. 너도 해 봐! ${siteUrl()}` }); } catch { /* 취소 */ }
      return;
    }
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'maeumgyeol.png' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('결과 카드를 저장했어요.');
  } catch {
    toast('이미지를 만들지 못했어요. 화면을 캡처해 주세요.');
  }
}

// ───────── 궁합 ─────────
const b64 = {
  enc: (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (str) => JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))),
};
function parseInvite(str) {
  try {
    const o = b64.dec(str);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.d)) return null;
    const time = /^\d{2}:\d{2}$/.test(o.t ?? '') ? o.t : '';
    return { name: String(o.n ?? '').slice(0, 10), date: o.d, time, unknownTime: !time, gender: o.g === 'm' || o.g === 'f' ? o.g : null, correction: true };
  } catch { return null; }
}
const inviteLink = (input) => `${siteUrl()}#/match?p=${b64.enc({ n: input.name, d: input.date, t: input.unknownTime ? '' : input.time, g: input.gender })}`;

function matchResult(a, b) {
  const c = compatibility(a.r, b.r);
  const score = Math.round(50 + ((c.score - 40) * 49) / 60);
  const grade = COMPAT_GRADE.find((g) => score >= g.min);
  const person = (x) => {
    const dm = DAY_MASTERS[x.r.dayMaster];
    return `<div class="duo-person">${medallion(dm.art, EL(x.r.dayMasterElement).color, [], 104)}<strong>${esc(x.input.name) || '나'}</strong><small>${x.r.pillars.day.hanja} · ${dm.title}</small></div>`;
  };
  const stem = COMPAT_STEM[c.stemKey];
  return `
  <section class="result-hero match-hero">
    <p class="eyebrow">두 사람의 궁합</p>
    <div class="duo">${person(a)}<span class="duo-score"><b>${score}</b><small>점</small></span>${person(b)}</div>
    <h1>${grade.title}</h1>
    <p class="tagline">${grade.desc}</p>
  </section>
  <section class="panel">
    ${sectionTitle('hearts', '항목별 궁합')}
    <div class="bars">
      ${c.parts.map((p) => `<div class="bar-row"><span class="bar-label">${p.label}</span><span class="bar"><span style="width:${(p.score / p.max) * 100}%"></span></span><span class="bar-val">${p.key}</span></div>`).join('')}
    </div>
  </section>
  <section class="panel">
    ${sectionTitle('sun', `기질의 만남 · ${stem.title}`)}
    <p>${stem.desc}</p>
    <h3 class="h-sub">속마음과 생활 리듬</h3>
    <p>${COMPAT_DAY[c.dayKey]}</p>
    <h3 class="h-sub">서로에게 줄 수 있는 것</h3>
    <p>${esc(a.input.name) || '나'}에게 필요한 기운은 <b style="color:${EL(a.r.strength.yongElement).color}">${EL(a.r.strength.yongElement).hanja}</b>, ${esc(b.input.name) || '상대'}에게 필요한 기운은 <b style="color:${EL(b.r.strength.yongElement).color}">${EL(b.r.strength.yongElement).hanja}</b>이에요.
    ${c.parts[2].key === '높음' ? '두 사람은 서로에게 부족한 기운을 넉넉히 가지고 있어, 함께 있을 때 마음이 편안해지고 운이 살아나요.' : c.parts[2].key === '보통' ? '서로의 부족한 부분을 어느 정도 채워 줄 수 있어요. 상대가 힘들어할 때 내가 가진 강점을 나눠 주세요.' : '서로에게 필요한 기운을 직접 채워 주기는 어려운 조합이에요. 그 대신 각자의 시간과 취미를 존중할 때 관계가 건강해져요.'}</p>
  </section>`;
}

function renderMatch() {
  const fromLink = query.get('p') ? parseInvite(query.get('p')) : null;
  if (fromLink) { store.invite = fromLink; save(); }
  const m = me();
  const invite = store.invite;
  if (!m) {
    return `<section class="page-head">
      <p class="eyebrow">宮合</p><h1>궁합 보기</h1>
      <p class="lead">${invite ? `<strong>${esc(invite.name) || '친구'}</strong>님이 궁합을 보고 싶어 해요.<br>내 생년월일을 입력하면 바로 결과가 나와요.` : '먼저 내 사주 정보를 입력해 주세요.'}</p>
    </section>
    <div class="actions"><a class="btn btn-primary btn-lg" href="#/saju">내 정보 입력하기</a></div>`;
  }
  const partnerInput = invite ?? store.partner;
  const partner = reading(partnerInput);
  if (partner) {
    return `${matchResult(m, partner)}
    <div class="actions">
      <button type="button" class="btn btn-primary" id="share-match">${icon('share', 18)}결과 공유하기</button>
      <button type="button" class="btn" id="reset-match">다른 사람과 궁합 보기</button>
      <a class="btn btn-ghost" href="#/me">내 사주 풀이 보기</a>
    </div>`;
  }
  return `
  <section class="page-head">
    <p class="eyebrow">宮合</p><h1>궁합 보기</h1>
    <p class="lead">연인, 친구, 가족 누구와도 볼 수 있어요.</p>
  </section>
  <section class="panel">
    ${sectionTitle('share', '궁합 링크 보내기')}
    <p>링크를 받은 사람이 자기 생일을 입력하면, 두 사람의 궁합이 바로 나와요.</p>
    <button type="button" class="btn btn-primary" id="send-invite">내 궁합 링크 보내기</button>
    <p class="muted small">링크에는 내 이름과 생년월일시가 담겨요. 믿을 수 있는 사람에게만 보내 주세요.</p>
  </section>
  <form class="panel form" id="partner-form" novalidate>
    ${sectionTitle('hearts', '상대 정보 직접 입력하기')}
    <label class="field"><span>상대 이름 <small>(선택)</small></span><input name="name" maxlength="10" placeholder="예: 민준"></label>
    <label class="field"><span>상대 생년월일 <small>(양력)</small></span>
      <input name="date" type="date" required min="1920-01-01" max="${today()}">
      <small class="error" id="pdate-error" hidden>생년월일을 입력해 주세요.</small></label>
    <label class="field"><span>태어난 시간 <small>(모르면 비워 두세요)</small></span><input name="time" type="time"></label>
    <button class="btn" type="submit">궁합 결과 보기</button>
  </form>`;
}
renderMatch.mount = () => {
  const m = me();
  if (!m) return;
  app.querySelector('#send-invite')?.addEventListener('click', () => share('마음결 궁합',
    `${m.input.name ? `${m.input.name}님이` : '친구가'} 궁합을 보고 싶어 해요. 생일만 입력하면 바로 나와요!`, inviteLink(m.input)));
  const form = app.querySelector('#partner-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    form.querySelector('#pdate-error').hidden = !!f.date.value;
    if (!f.date.value) { f.date.focus(); return; }
    store.partner = { name: f.name.value.trim(), date: f.date.value, time: f.time.value, unknownTime: !f.time.value, gender: null, correction: true };
    save();
    navigate();
  });
  app.querySelector('#reset-match')?.addEventListener('click', () => {
    store.invite = null; store.partner = null; save();
    history.replaceState(null, '', '#/match');
    navigate();
  });
  app.querySelector('#share-match')?.addEventListener('click', () => {
    const score = app.querySelector('.duo-score b').textContent;
    share('마음결 궁합', `우리 궁합 ${score}점! “${app.querySelector('.match-hero h1').textContent}” 너도 궁금한 사람이랑 해 봐.`, inviteLink(m.input));
  });
};

// ───────── 마음 테스트 ─────────
let answers = [];
let qIndex = 0;

function renderTest() {
  if (qIndex >= QUESTIONS.length) { qIndex = 0; answers = []; }
  const q = QUESTIONS[qIndex];
  const pct = Math.round((qIndex / QUESTIONS.length) * 100);
  return `
  <section class="panel test">
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${qIndex}" aria-label="진행률"><span style="width:${pct}%"></span></div>
    <p class="q-count">${qIndex + 1} / ${QUESTIONS.length}</p>
    <h2 class="q-text" id="q-text">${esc(q.text)}</h2>
    <p class="muted center">최근 2주 동안의 나를 떠올리며 답해 주세요.</p>
    <div class="scale" role="radiogroup" aria-labelledby="q-text">
      ${SCALE.map((o) => `<button type="button" class="scale-btn ${answers[qIndex] === o.value ? 'is-selected' : ''}" role="radio" aria-checked="${answers[qIndex] === o.value}" data-value="${o.value}"><span class="dot dot-${o.value}" aria-hidden="true"></span>${o.label}</button>`).join('')}
    </div>
    <div class="row"><button type="button" class="btn btn-ghost" id="prev" ${qIndex === 0 ? 'disabled' : ''}>이전</button></div>
  </section>`;
}
renderTest.mount = () => {
  app.querySelectorAll('.scale-btn').forEach((b) => b.addEventListener('click', () => {
    answers[qIndex] = Number(b.dataset.value);
    b.classList.add('is-selected');
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) { qIndex += 1; navigate(); return; }
      store.stress = { answers: [...answers], result: scoreTest(answers), date: today() };
      save();
      qIndex = 0; answers = [];
      location.hash = '#/result';
    }, 180);
  }));
  app.querySelector('#prev')?.addEventListener('click', () => { qIndex = Math.max(0, qIndex - 1); navigate(); });
};

const careBox = () => `<div class="help"><strong>혼자 감당하지 않아도 돼요</strong>
  <p>지금의 힘듦이 2주 이상 이어지거나 일상이 어렵다면, 가까운 정신건강의학과나 상담센터에서 이야기를 나눠 보세요. 정신건강 상담전화 <a href="tel:15770199">1577-0199</a>도 24시간 열려 있어요.</p></div>`;

function renderResult() {
  const r = store.stress?.result;
  if (!r) return emptyState('아직 테스트 결과가 없어요.', '#/test', '테스트 시작하기');
  const t = TYPES[r.type];
  const second = TYPES[r.second];
  const level = LEVELS.find((l) => l.key === r.level);
  const levelIdx = LEVELS.indexOf(level);
  return `
  <section class="result-hero" style="--el:${t.color}">
    <p class="eyebrow">지금 나의 스트레스 유형</p>
    ${medallion(t.art, t.color, [], 150)}
    <h1>${t.name}</h1>
    <p class="tagline">${t.tagline}</p>
  </section>
  <section class="panel">
    ${sectionTitle('pulse', '지금 나의 스트레스 수준')}
    <div class="meter" aria-label="스트레스 수준 ${levelIdx + 1}/4단계">${LEVELS.map((l, i) => `<span class="${i <= levelIdx ? 'on' : ''} lv-${i}"></span>`).join('')}</div>
    <p class="level-label">${level.label} <small>(${r.total}점 / 75점)</small></p>
    <p>${level.desc}</p>
    ${r.level === 'severe' ? careBox() : ''}
  </section>
  <section class="panel">
    ${sectionTitle(t.art, '이런 사람이에요')}
    <p>${t.summary}</p>
    <ul class="checks">${t.signs.map((s) => `<li>${s}</li>`).join('')}</ul>
    <h3 class="h-sub">왜 이렇게 지쳤을까요?</h3><p>${t.cause}</p>
    <h3 class="h-sub">몸이 보내는 신호</h3><p class="chip-line">${t.body}</p>
  </section>
  <section class="panel">
    ${sectionTitle('flower', '회복 처방')}
    <ol class="care">${t.care.map((c) => `<li><span class="care-when">${c.when}</span><p>${c.text}</p></li>`).join('')}</ol>
    <div class="callout"><strong>피해야 할 것</strong><p>${t.avoid}</p></div>
  </section>
  <section class="panel">
    ${sectionTitle('star', '유형별 점수')}
    <div class="bars">
      ${Object.entries(r.byType).map(([k, v]) => `<div class="bar-row"><span class="bar-label">${TYPES[k].name}</span><span class="bar"><span style="width:${(v / 15) * 100}%;background:${TYPES[k].color}"></span></span><span class="bar-val">${v}</span></div>`).join('')}
    </div>
    <p class="muted">두 번째로 높은 유형은 <strong>${second.name}</strong>이에요. 상황에 따라 이 모습도 함께 나타날 수 있어요.</p>
  </section>
  <div class="actions">
    <a class="btn btn-primary" href="#/card">나를 위한 위로 카드 뽑기</a>
    <a class="btn" href="${store.me ? '#/report' : '#/saju'}">${store.me ? '사주와 엮은 마음 리포트 보기' : '사주까지 보고 마음 리포트 받기'}</a>
    <button type="button" class="btn btn-ghost" id="share">${icon('share', 18)}결과 공유하기</button>
    <a class="btn btn-ghost" href="#/test">다시 테스트하기</a>
  </div>`;
}
renderResult.mount = () => {
  const r = store.stress?.result;
  if (!r) return;
  const t = TYPES[r.type];
  app.querySelector('#share')?.addEventListener('click', () => share('마음결 마음 테스트', `나의 스트레스 유형은 ${t.emoji} ${t.name}! ${t.tagline}\n너도 해 봐.`));
};

// ───────── 위로 카드 ─────────
function cardPool() {
  const type = store.stress?.result?.type;
  if (type) return [...TYPES[type].messages, ...TYPES[type].messages, ...COMMON_MESSAGES];
  return [...Object.values(TYPES).flatMap((t) => t.messages), ...COMMON_MESSAGES];
}

function renderCard() {
  const c = store.card;
  const drawn = c?.date === today();
  const typeName = store.stress?.result ? TYPES[store.stress.result.type].name : null;
  return `
  <section class="page-head">
    <p class="eyebrow">하루 한 장</p>
    <h1>오늘의 위로 카드</h1>
    <p class="lead">${drawn ? '오늘 당신에게 온 한마디예요.' : '마음이 끌리는 카드를 한 장 골라 보세요.'}</p>
    ${typeName ? `<p class="muted small">${typeName}에게 필요한 말들로 준비했어요.</p>` : ''}
  </section>
  <div class="deck ${drawn ? 'is-drawn' : ''}">
    ${[0, 1, 2].map((i) => `
      <button type="button" class="tarot ${drawn && c.slot === i ? 'is-flipped' : ''}" data-slot="${i}" ${drawn ? 'disabled' : ''} aria-label="${drawn && c.slot === i ? '오늘의 카드' : `${i + 1}번째 카드 뽑기`}">
        <span class="tarot-inner">
          <span class="tarot-back">${cardBack()}</span>
          <span class="tarot-front">${drawn && c.slot === i ? `<span class="msg">${esc(c.message)}</span>` : ''}</span>
        </span>
      </button>`).join('')}
  </div>
  ${drawn ? `<div class="actions">
    <button type="button" class="btn btn-primary" id="share-card">이 말을 소중한 사람에게 보내기</button>
    <p class="muted center">내일 새로운 카드를 뽑을 수 있어요.</p>
    ${store.stress ? '' : '<a class="btn" href="#/test">내 유형에 맞는 카드 받기 (마음 테스트)</a>'}
  </div>` : ''}`;
}
renderCard.mount = () => {
  app.querySelectorAll('.tarot:not([disabled])').forEach((b) => b.addEventListener('click', () => {
    const pool = cardPool();
    const message = pool[Math.floor(Math.random() * pool.length)];
    store.card = { date: today(), slot: Number(b.dataset.slot), message };
    save();
    b.querySelector('.tarot-front').innerHTML = `<span class="msg">${esc(message)}</span>`;
    app.querySelectorAll('.tarot').forEach((x) => { x.disabled = true; });
    app.querySelector('.deck').classList.add('is-drawn');
    b.classList.add('is-flipped');
    setTimeout(navigate, 1100);
  }));
  app.querySelector('#share-card')?.addEventListener('click', () => share('마음결 오늘의 위로 카드', `“${store.card.message}”\n— 마음결, 오늘의 위로 카드`));
};

// ───────── 마음 리포트 (사주 + 마음 테스트) ─────────
function renderReport() {
  const s = store.stress?.result;
  const m = me();
  if (!s || !m) {
    return `<section class="panel center">
      ${icon('scroll', 44, 'gold')}
      <h1 class="h-sec center-title">마음 리포트</h1>
      <p>사주 풀이와 마음 테스트를 모두 마치면, 타고난 기질과 지금의 마음을 엮은 맞춤 리포트가 열려요.</p>
      <div class="actions">
        ${m ? '<span class="done">✓ 사주 입력 완료</span>' : '<a class="btn btn-primary" href="#/saju">사주 입력하기</a>'}
        ${s ? '<span class="done">✓ 마음 테스트 완료</span>' : '<a class="btn btn-primary" href="#/test">마음 테스트 하기</a>'}
      </div>
    </section>`;
  }
  const { input, r } = m;
  const t = TYPES[s.type];
  const dm = DAY_MASTERS[r.dayMaster];
  const dmEl = EL(r.dayMasterElement);
  const yong = EL(r.strength.yongElement);
  const level = LEVELS.find((l) => l.key === s.level);
  const who = callName(input);
  const card = store.card?.date === today() ? store.card.message : t.messages[0];
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
  <article class="report">
    <header class="page-head">
      <p class="eyebrow">${dateStr} · 마음결 리포트</p>
      <h1>${who}의 마음 지도</h1>
      <div class="report-badges">
        <span style="--el:${dmEl.color}">${icon(dm.art, 18)}${dm.title}</span>
        <span style="--el:${t.color}">${icon(t.art, 18)}${t.name}</span>
      </div>
    </header>
    <section class="panel">
      <h2 class="h-sec">1. 타고난 결과 지금의 마음</h2>
      <p>${who}은 본래 <strong>${dm.title}</strong>의 기운을 타고났어요. ${dm.keywords.map((k) => `#${k}`).join(' ')} — ${who}을 가장 잘 설명하는 단어들이에요.</p>
      <p>그런데 지금 ${who}의 마음은 <strong>${t.name}</strong>의 모습을 하고 있어요. ${t.tagline}</p>
      <p>${dm.stressStyle} 이런 기질이 요즘의 상황과 만나면서, ‘${t.signs[0]}’ 같은 모습으로 드러나고 있는 거예요.</p>
    </section>
    <section class="panel">
      <h2 class="h-sec">2. 지금의 상태</h2>
      <p class="level-label">${level.label}</p>
      <p>${level.desc}</p>
      ${s.level === 'severe' ? careBox() : ''}
    </section>
    <section class="panel">
      <h2 class="h-sec">3. ${who}만을 위한 회복 처방</h2>
      <ol class="care">
        <li><span class="care-when">기질 맞춤</span><p>${dm.healing}</p></li>
        ${t.care.map((c) => `<li><span class="care-when">${c.when}</span><p>${c.text}</p></li>`).join('')}
        <li><span class="care-when">용신 채우기</span><p>${who}에게 가장 필요한 ${yong.hanja}(${yong.name})의 기운을 더해 주세요. ${yong.boost}.</p></li>
      </ol>
    </section>
    <section class="panel quote-panel">
      <h2 class="h-sec">4. ${who}에게 보내는 편지</h2>
      <p>${dm.caution}</p>
      <p>${t.avoid}</p>
      <blockquote>“${esc(card)}”</blockquote>
      <p class="sign">— 마음결 드림</p>
    </section>
  </article>
  <div class="actions">
    <button type="button" class="btn btn-primary" id="print">리포트 저장하기 (PDF)</button>
    <a class="btn btn-ghost" href="#/">처음으로</a>
  </div>`;
}
renderReport.mount = () => {
  app.querySelector('#print')?.addEventListener('click', () => window.print());
};

// ───────── 공통 ─────────
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('사주 정보, 테스트 결과, 카드 기록을 모두 지울까요?')) return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem('maeum:v1');
  store = {};
  history.replaceState(null, '', '#/');
  navigate();
  toast('모든 기록을 지웠어요.');
});

let installPrompt = null;
const installBtn = document.getElementById('install-btn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

navigate();
