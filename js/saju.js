// 사주 명리 계산 엔진 (양력 입력 기준)
// - 연·월주: 태양 황경(절기)으로 경계 결정 (입춘 = 315°)
// - 일주: 율리우스일 기준 60갑자 순환, 23시(자시) 이후는 다음 날
// - 시주: 시두법, 진태양시 보정(서울 동경 127° 기준)
// - 지장간·십성·12운성·신살·신강약·용신·대운·세운·월운·일진·궁합

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

// 오행: 0 木, 1 火, 2 土, 3 金, 4 水
export const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
export const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// 지장간 (여기 → 중기 → 정기 순, 마지막이 본기)
export const HIDDEN_STEMS = [
  [8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2],
  [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8],
];
const mainStem = (branch) => HIDDEN_STEMS[branch].at(-1);

export const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
export const TEN_GOD_GROUP = ['비겁', '식상', '재성', '관성', '인성'];
export const TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

const mod = (n, m) => ((n % m) + m) % m;
const rad = (d) => (d * Math.PI) / 180;

// ───────── 천문 계산 ─────────
export function julianDay(y, m, d, h = 0) {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24 + b - 1524.5;
}

// 태양의 겉보기 황경 (Meeus 저정밀 공식, 오차 약 0.01°)
export function solarLongitude(jd) {
  const t = (jd - 2451545) / 36525;
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = rad(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * m)
    + 0.000289 * Math.sin(3 * m);
  const omega = rad(125.04 - 1934.136 * t);
  return mod(l0 + c - 0.00569 - 0.00478 * Math.sin(omega), 360);
}

// 기준 시각에서 가장 가까운 다음(+1)/이전(-1) 절(節: 황경이 315°+30k°)의 JD
function nearestTermJD(jd, direction) {
  const lon = solarLongitude(jd);
  const past = mod(lon - 315, 30);
  const target = direction > 0 ? lon + (30 - past) : lon - past;
  let t = jd + (target - lon) / 0.98565;
  for (let i = 0; i < 6; i++) {
    const diff = mod(target - solarLongitude(t) + 180, 360) - 180;
    t += diff / 0.98565;
  }
  return t;
}

// 한국 표준시의 UTC 오프셋(시간). 1954~1961년 UTC+8:30, 1987·1988년 서머타임 반영.
export function koreaOffset(y, m, d, h) {
  const key = y * 1e6 + m * 1e4 + d * 100 + h;
  let offset = 9;
  if (key >= 1954032100 && key < 1961081000) offset = 8.5;
  if ((key >= 1987051002 && key < 1987101103) || (key >= 1988050802 && key < 1988100903)) offset += 1;
  return offset;
}

// ───────── 기본 도구 ─────────
export function pillarFromIndex(idx60) {
  const stem = idx60 % 10;
  const branch = idx60 % 12;
  return {
    idx: idx60, stem, branch,
    hanja: STEMS[stem] + BRANCHES[branch],
    hangul: STEMS_KO[stem] + BRANCHES_KO[branch],
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
  };
}
// 천간·지지 조합 → 60갑자 인덱스
const index60 = (stem, branch) => mod(6 * stem - 5 * branch, 60);
const pillar = (stem, branch) => pillarFromIndex(index60(stem, branch));

export function tenGod(dayStem, targetStem) {
  const rel = mod(STEM_ELEMENT[targetStem] - STEM_ELEMENT[dayStem], 5);
  const same = dayStem % 2 === targetStem % 2;
  return rel * 2 + (same ? 0 : 1);
}
export const tenGodOfBranch = (dayStem, branch) => tenGod(dayStem, mainStem(branch));

// 12운성: 양간은 순행, 음간은 역행
const STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
export function twelveStage(stem, branch) {
  return stem % 2 === 0 ? mod(branch - STAGE_START[stem], 12) : mod(STAGE_START[stem] - branch, 12);
}

// 지지 관계
const SIX_HARMONY = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const WONJIN = [7, 6, 9, 8, 11, 10, 1, 0, 3, 2, 5, 4];
const trineGroup = (b) => b % 4; // 0: 申子辰, 1: 巳酉丑, 2: 寅午戌, 3: 亥卯未
export function branchRelation(a, b) {
  if (a === b) return '같음';
  if (mod(a - b, 12) === 6) return '충';
  if (SIX_HARMONY[a] === b) return '육합';
  if (trineGroup(a) === trineGroup(b)) return '삼합';
  if (WONJIN[a] === b) return '원진';
  return null;
}
export const stemCombine = (a, b) => mod(a - b, 10) === 5;

export function dayPillarOf(y, m, d) {
  const jdn = Math.floor(julianDay(y, m, d) + 0.5);
  return pillarFromIndex(mod(jdn + 49, 60));
}
export const yearPillarOf = (sajuYear) => pillarFromIndex(mod(sajuYear - 4, 60));
// 사주 연도의 12개월 (寅월부터)
export function monthPillarsOf(sajuYear) {
  const ys = yearPillarOf(sajuYear).stem;
  return Array.from({ length: 12 }, (_, i) => pillar(mod((ys % 5) * 2 + 2 + i, 10), mod(i + 2, 12)));
}
// 오늘(로컬 날짜)이 속한 사주 연도
export function currentSajuYear(date = new Date()) {
  const y = date.getFullYear();
  const lon = solarLongitude(julianDay(y, date.getMonth() + 1, date.getDate(), 12 - 9));
  return date.getMonth() <= 1 && lon >= 270 && lon < 315 ? y - 1 : y;
}

// ───────── 신살 ─────────
const CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]];
const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
const YANGIN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
const BAEKHO = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
const GOEGANG = ['庚辰', '庚戌', '壬辰', '戊戌'];
// 삼합 그룹(b % 4)별 도화·역마·화개 지지
const DOHWA = [9, 6, 3, 0];
const YEOKMA = [2, 11, 8, 5];
const HWAGAE = [4, 1, 10, 7];

function findSinsal(pillars) {
  const list = Object.values(pillars).filter(Boolean);
  const branches = list.map((p) => p.branch);
  const day = pillars.day;
  const found = [];
  const has = (b) => branches.includes(b);
  if (CHEONEUL[day.stem].some(has)) found.push('천을귀인');
  if (has(MUNCHANG[day.stem])) found.push('문창귀인');
  // 도화·역마·화개는 연지와 일지를 기준으로 다른 자리에서 찾는다
  const check = (table) => [pillars.year, pillars.day].some((base) =>
    list.some((p) => p !== base && p.branch === table[trineGroup(base.branch)]));
  if (check(DOHWA)) found.push('도화살');
  if (check(YEOKMA)) found.push('역마살');
  if (check(HWAGAE)) found.push('화개살');
  if (YANGIN[day.stem] !== undefined && has(YANGIN[day.stem])) found.push('양인살');
  if (list.some((p) => BAEKHO.includes(p.hanja))) found.push('백호대살');
  if (GOEGANG.includes(day.hanja)) found.push('괴강살');
  return found;
}

// ───────── 신강·신약과 용신 ─────────
const WEIGHTS = { yearStem: 8, monthStem: 12, hourStem: 12, yearBranch: 8, monthBranch: 30, dayBranch: 18, hourBranch: 12 };

function analyzeStrength(pillars) {
  const dm = pillars.day.stem;
  const groups = [0, 0, 0, 0, 0]; // 비겁, 식상, 재성, 관성, 인성 (가중치 합)
  let total = 0;
  const add = (stem, w) => { groups[Math.floor(tenGod(dm, stem) / 2)] += w; total += w; };
  add(pillars.year.stem, WEIGHTS.yearStem);
  add(pillars.month.stem, WEIGHTS.monthStem);
  add(mainStem(pillars.year.branch), WEIGHTS.yearBranch);
  add(mainStem(pillars.month.branch), WEIGHTS.monthBranch);
  add(mainStem(pillars.day.branch), WEIGHTS.dayBranch);
  if (pillars.hour) {
    add(pillars.hour.stem, WEIGHTS.hourStem);
    add(mainStem(pillars.hour.branch), WEIGHTS.hourBranch);
  }
  const support = Math.round(((groups[0] + groups[4]) / total) * 100);
  const level = support >= 75 ? '태강' : support >= 55 ? '신강' : support > 45 ? '중화' : support > 25 ? '신약' : '태약';

  // 억부용신(간략): 강하면 덜어 내고, 약하면 보탠다. 중화면 계절(조후)을 본다.
  const dmEl = STEM_ELEMENT[dm];
  let yongGroup;
  let yongElement;
  if (level === '태강' || level === '신강') {
    yongGroup = groups[4] > groups[0] ? 2 : groups[0] > groups[4] ? 3 : 1;
  } else if (level === '신약' || level === '태약') {
    const drain = [groups[1], groups[2], groups[3]];
    const worst = drain.indexOf(Math.max(...drain)); // 0 식상, 1 재성, 2 관성
    yongGroup = worst === 1 ? 0 : 4;
  } else {
    const mb = pillars.month.branch;
    if ([11, 0, 1].includes(mb)) yongElement = 1; // 겨울생 → 火
    else if ([5, 6, 7].includes(mb)) yongElement = 4; // 여름생 → 水
    else yongGroup = groups.indexOf(Math.min(...groups));
  }
  if (yongElement === undefined) yongElement = mod(dmEl + yongGroup, 5);
  else yongGroup = mod(yongElement - dmEl, 5);
  return { support, level, groups, yongGroup, yongElement, heeElement: mod(yongElement - 1, 5) };
}

// ───────── 대운 ─────────
function buildDaeun({ jdUtc, yearStem, monthPillar, dayStem, gender }) {
  const forward = (yearStem % 2 === 0) === (gender === 'm');
  const termJD = nearestTermJD(jdUtc, forward ? 1 : -1);
  const days = Math.abs(termJD - jdUtc);
  const startAge = Math.max(1, Math.round(days / 3));
  const list = Array.from({ length: 9 }, (_, i) => {
    const p = pillarFromIndex(mod(monthPillar.idx + (forward ? 1 : -1) * (i + 1), 60));
    return {
      ...p,
      age: startAge + i * 10,
      stemGod: tenGod(dayStem, p.stem),
      branchGod: tenGodOfBranch(dayStem, p.branch),
      stage: twelveStage(dayStem, p.branch),
    };
  });
  return { forward, startAge, list };
}

// ───────── 메인 ─────────
/**
 * @param {{year:number, month:number, day:number, hour?:number|null, minute?:number,
 *   gender?:'f'|'m'|null, solarTimeCorrection?:boolean}} input  hour가 null이면 시간 모름
 */
export function calculateSaju({ year, month, day, hour = null, minute = 0, gender = null, solarTimeCorrection = true }) {
  const timeKnown = hour !== null && hour !== undefined && !Number.isNaN(hour);
  const h = timeKnown ? hour + minute / 60 : 12;

  const offset = koreaOffset(year, month, day, timeKnown ? hour : 12);
  const jdUtc = julianDay(year, month, day, h - offset);
  const lon = solarLongitude(jdUtc);

  // 연주: 입춘(315°) 이전이면 전년도
  let sajuYear = year;
  if (month <= 2 && lon >= 270 && lon < 315) sajuYear -= 1;
  const yearP = yearPillarOf(sajuYear);

  // 월주: 입춘부터 30°마다 한 달 (0 = 寅월)
  const monthIdx = Math.floor(mod(lon - 315, 360) / 30);
  const monthP = pillar(mod((yearP.stem % 5) * 2 + 2 + monthIdx, 10), mod(monthIdx + 2, 12));

  // 현지 시각: 서머타임 제거 후 표준 자오선(135° 또는 127.5°)과 서울(127°)의 차이 보정
  let localH = h;
  if (timeKnown) {
    const dstShift = offset === 10 ? 1 : 0;
    const meridian = offset - dstShift === 9 ? 135 : 127.5;
    localH = h - dstShift;
    if (solarTimeCorrection) localH -= ((meridian - 127) * 4) / 60;
  }

  const dayShift = timeKnown && localH >= 23 ? 1 : 0;
  const base = dayPillarOf(year, month, day);
  const dayP = pillarFromIndex(mod(base.idx + dayShift, 60));

  let hourP = null;
  if (timeKnown) {
    const hourBranch = Math.floor(mod(localH + 1, 24) / 2);
    hourP = pillar(mod((dayP.stem % 5) * 2 + hourBranch, 10), hourBranch);
  }

  const pillars = { hour: hourP, day: dayP, month: monthP, year: yearP };

  const counts = [0, 0, 0, 0, 0];
  const tenGodCounts = [0, 0, 0, 0, 0];
  const detail = {};
  for (const [key, p] of Object.entries(pillars)) {
    if (!p) continue;
    counts[p.stemElement] += 1;
    counts[p.branchElement] += 1;
    const stemGod = key === 'day' ? -1 : tenGod(dayP.stem, p.stem);
    const branchGod = tenGodOfBranch(dayP.stem, p.branch);
    if (stemGod >= 0) tenGodCounts[Math.floor(stemGod / 2)] += 1;
    tenGodCounts[Math.floor(branchGod / 2)] += 1;
    detail[key] = { stemGod, branchGod, hidden: HIDDEN_STEMS[p.branch], stage: twelveStage(dayP.stem, p.branch) };
  }

  return {
    pillars,
    detail,
    counts,
    tenGodCounts,
    dayMaster: dayP.stem,
    dayMasterElement: STEM_ELEMENT[dayP.stem],
    yinYang: dayP.stem % 2 === 0 ? '양' : '음',
    animal: ANIMALS[yearP.branch],
    timeKnown,
    sajuYear,
    strength: analyzeStrength(pillars),
    sinsal: findSinsal(pillars),
    daeun: gender ? buildDaeun({ jdUtc, yearStem: yearP.stem, monthPillar: monthP, dayStem: dayP.stem, gender }) : null,
    jdUtc,
    solarLongitude: lon,
  };
}

// ───────── 궁합 ─────────
export function compatibility(a, b) {
  const parts = [];
  // 1) 일간: 두 사람의 중심 기운
  const sa = a.dayMaster; const sb = b.dayMaster;
  const rel = mod(STEM_ELEMENT[sb] - STEM_ELEMENT[sa], 5);
  let stemKey; let stemScore;
  if (stemCombine(sa, sb)) { stemKey = '천간합'; stemScore = 30; }
  else if (rel === 1 || rel === 4) { stemKey = '상생'; stemScore = 25; }
  else if (rel === 0) { stemKey = '비화'; stemScore = 21; }
  else { stemKey = '상극'; stemScore = 14; }
  parts.push({ label: '타고난 기질', key: stemKey, score: stemScore, max: 30 });

  // 2) 일지: 속마음과 생활 리듬
  const br = branchRelation(a.pillars.day.branch, b.pillars.day.branch);
  const dayScore = { 육합: 30, 삼합: 27, 같음: 22, 원진: 12, 충: 10 }[br] ?? 19;
  parts.push({ label: '속마음·생활 리듬', key: br ?? '무난', score: dayScore, max: 30 });

  // 3) 오행 보완: 서로에게 필요한 기운을 가지고 있는가
  const give = (from, to) => Math.min(from.counts[to.strength.yongElement], 3);
  const fill = give(a, b) + give(b, a); // 0~6
  const fillScore = Math.round(10 + (fill / 6) * 15);
  parts.push({ label: '서로 채워 주는 기운', key: fill >= 4 ? '높음' : fill >= 2 ? '보통' : '낮음', score: fillScore, max: 25 });

  // 4) 띠(연지)
  const yr = branchRelation(a.pillars.year.branch, b.pillars.year.branch);
  const yearScore = { 육합: 15, 삼합: 15, 같음: 12, 원진: 7, 충: 6 }[yr] ?? 10;
  parts.push({ label: '띠 궁합', key: yr ?? '무난', score: yearScore, max: 15 });

  const score = parts.reduce((s, p) => s + p.score, 0);
  return { score, parts, stemKey, dayKey: br ?? '무난' };
}
