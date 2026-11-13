// PDF로 내보낼 문서 블록을 만든다 (화면과 같은 풀이를 종이 문서 형식으로).
import {
  STEMS, STEMS_KO, BRANCHES_KO, TEN_GODS, TWELVE_STAGES, tenGod, branchRelation, yearPillarOf, monthPillarsOf, currentSajuYear,
} from './saju.js';
import {
  ELEMENT_INFO, DAY_MASTERS, TEN_GOD_GROUP_INFO, TEN_GOD_INFO, STAGE_INFO, STRENGTH_INFO, SINSAL_INFO, YEAR_BRANCH_INFO,
} from './data-saju.js';
import { SIGNS } from './data-astro.js';
import { SURI, LUCK_LABEL, FLOW_INFO } from './data-name.js';
import { CLASSICS, SEASON_NOTES, seasonOf, ANIMAL_NOTES, ORGAN_NOTES, PSYCH } from './data-notes.js';
import { TYPES, LEVELS } from './data-stress.js';
import { standaloneMedallion } from './art.js';

const EL = (i) => ELEMENT_INFO[i];
// 종이 위에서 잘 보이도록 오행 색을 조금 짙게
const PRINT_COLOR = ['#2f9e63', '#e0553d', '#b98a1c', '#7c8496', '#2f6fd6'];
const TILE_COLOR = ['#6fcf97', '#ff8a73', '#e3c06b', '#d9dde8', '#6ea8ff'];

export function ageOf(input) {
  const [y, m, d] = input.date.split('-').map(Number);
  const n = new Date();
  return n.getFullYear() - y - (n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d) ? 1 : 0);
}

function yearBlocks(sajuYear, r, label) {
  const p = yearPillarOf(sajuYear);
  const info = TEN_GOD_INFO[tenGod(r.dayMaster, p.stem)];
  const rel = branchRelation(r.pillars.day.branch, p.branch);
  const out = [
    { t: 'h3', text: `${label} · ${sajuYear}년 ${p.hanja}(${p.hangul})년 — ${info.name}의 해` },
    { t: 'p', text: info.year.total },
    { t: 'kv', keyWidth: 190, rows: [['재물', info.year.money], ['일 · 학업', info.year.work], ['사랑 · 관계', info.year.love], ['건강', info.year.health]] },
  ];
  if (rel) out.push({ t: 'p', text: `일지와의 관계(${rel === '같음' ? '복음' : rel}): ${YEAR_BRANCH_INFO[rel]}` });
  return out;
}

export function sajuDocument({ input, r, astro, name }, brand) {
  const dm = DAY_MASTERS[r.dayMaster];
  const el = EL(r.dayMasterElement);
  const who = input.name ? `${input.name}님` : '당신';
  const p = r.pillars;
  const st = r.strength;
  const yong = EL(st.yongElement);
  const classic = CLASSICS[r.dayMaster];
  const season = seasonOf(p.month.branch);
  const now = new Date();
  const thisYear = currentSajuYear(now);
  const blocks = [];
  const add = (...b) => blocks.push(...b);

  const [by, bm, bd] = input.date.split('-');
  add({
    t: 'cover',
    eyebrow: `${brand} · 사주 풀이`,
    art: standaloneMedallion(dm.art, TILE_COLOR[r.dayMasterElement], Object.values(p).filter(Boolean).map((x) => x.branch)),
    title: dm.title,
    subtitle: `${who}의 일주 · ${p.day.hanja}(${p.day.hangul})`,
    lines: [
      `양력 ${by}년 ${Number(bm)}월 ${Number(bd)}일 ${input.unknownTime ? '(시간 모름)' : input.time}`,
      `${r.animal}띠 · 태양 ${SIGNS[astro.sun].name} · 달 ${SIGNS[astro.moon].name}`,
      `작성일 ${now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    ],
  });

  // 1. 원국
  const col = (label, x, d, me) => (x ? {
    label, me,
    top: d.stemGod < 0 ? '일간(나)' : TEN_GODS[d.stemGod],
    stem: x.hanja[0], stemSub: `${STEMS_KO[x.stem]} · ${EL(x.stemElement).hanja}`, color1: TILE_COLOR[x.stemElement],
    branch: x.hanja[1], branchSub: `${BRANCHES_KO[x.branch]} · ${EL(x.branchElement).hanja}`, color2: TILE_COLOR[x.branchElement],
    bottom: TEN_GODS[d.branchGod], hidden: d.hidden.map((s) => STEMS[s]).join(' '), stage: TWELVE_STAGES[d.stage],
  } : { label, top: '', stem: '?', stemSub: '', color1: '#77739a', branch: '?', branchSub: '', color2: '#77739a', bottom: '시간 모름', hidden: '', stage: '' });
  add({ t: 'h2', text: '1. 사주 원국(原局)' },
    { t: 'quote', text: dm.inner },
    { t: 'pillars', cols: [col('시주', p.hour, r.detail.hour), col('일주', p.day, r.detail.day, true), col('월주', p.month, r.detail.month), col('연주', p.year, r.detail.year)] },
    { t: 'small', text: '글자 위아래는 십성, 그 아래는 지장간과 12운성이에요. 가운데 일간이 나 자신을 뜻해요.' },
    { t: 'h3', text: '오행의 분포' },
    { t: 'bars', rows: r.counts.map((c, i) => ({ label: `${EL(i).hanja} ${EL(i).name}`, value: c, max: Math.max(4, ...r.counts), color: PRINT_COLOR[i], text: `${c}개` })) });
  r.counts.forEach((c, i) => { if (c === 0) add({ t: 'p', text: `${EL(i).hanja}(${EL(i).name})의 기운이 없어요. ${EL(i).lack}` }); });
  const max = Math.max(...r.counts);
  r.counts.forEach((c, i) => { if (c >= 3 && c === max) add({ t: 'p', text: `${EL(i).hanja}(${EL(i).name})의 기운이 강해요. ${EL(i).excess}` }); });
  add({ t: 'h3', text: `태어난 계절 · ${season}의 ${el.name}` }, { t: 'p', text: SEASON_NOTES[r.dayMasterElement][season] },
    { t: 'h3', text: STRENGTH_INFO[st.level].title }, { t: 'p', text: STRENGTH_INFO[st.level].desc },
    { t: 'note', title: `나의 용신은 ${yong.hanja}(${yong.name})`, text: `${TEN_GOD_GROUP_INFO[st.yongGroup].role}. 이렇게 채워 보세요: ${yong.boost}.` });
  if (r.sinsal.length) {
    add({ t: 'h3', text: '타고난 별 · 신살' }, { t: 'kv', rows: r.sinsal.map((k) => [k, `${SINSAL_INFO[k].title}. ${SINSAL_INFO[k].desc}`]) });
  }

  // 2. 성격
  const seat = TEN_GOD_INFO[r.detail.day.branchGod];
  const stage = STAGE_INFO[r.detail.day.stage];
  const topGroup = r.tenGodCounts.indexOf(Math.max(...r.tenGodCounts));
  add({ t: 'h2', text: '2. 나라는 사람' },
    { t: 'quote', text: `${classic.text}\n${classic.ko}\n— 『적천수(滴天髓)』` },
    { t: 'p', text: dm.personality },
    { t: 'h3', text: '빛나는 지점' }, { t: 'p', text: dm.strengths },
    { t: 'h3', text: '조심하면 좋은 점' }, { t: 'p', text: dm.caution },
    { t: 'h3', text: `${p.day.hangul}일주의 에너지 · ${stage.name}(${stage.hanja})` }, { t: 'p', text: stage.desc },
    { t: 'h3', text: `가까운 관계에서의 나 · 일지 ${seat.name}` }, { t: 'p', text: seat.seat },
    { t: 'h3', text: `나를 이끄는 힘 · ${TEN_GOD_GROUP_INFO[topGroup].name}` }, { t: 'p', text: TEN_GOD_GROUP_INFO[topGroup].desc },
    { t: 'h3', text: '사랑할 때' }, { t: 'p', text: dm.love },
    { t: 'h3', text: '일과 적성' }, { t: 'p', text: dm.work },
    { t: 'h3', text: '지칠 때 나를 돌보는 법' }, { t: 'p', text: `${dm.stressStyle} ${dm.healing}` },
    { t: 'h3', text: `${r.animal}띠` }, { t: 'p', text: ANIMAL_NOTES[p.year.branch] });

  // 3. 운의 흐름
  add({ t: 'h2', text: '3. 운의 흐름' });
  if (r.daeun) {
    const age = ageOf(input);
    const idx = r.daeun.list.findLastIndex((d) => age >= d.age);
    add({ t: 'h3', text: `대운 (대운수 ${r.daeun.startAge} · ${r.daeun.forward ? '순행' : '역행'})` },
      { t: 'kv', keyWidth: 250, rows: r.daeun.list.map((d, i) => [`${d.age}~${d.age + 9}세 ${d.hanja}${i === idx ? ' ◀' : ''}`, `${TEN_GODS[d.stemGod]} · ${TEN_GOD_INFO[d.stemGod].keyword}`]) });
    const cur = r.daeun.list[idx];
    if (cur) add({ t: 'p', text: `지금은 ${cur.hanja}(${cur.hangul}) 대운이에요. ${TEN_GOD_INFO[cur.stemGod].daeun}` });
  }
  add(...yearBlocks(thisYear, r, '올해'), ...yearBlocks(thisYear + 1, r, '내년'),
    { t: 'h3', text: `${thisYear + 1}년 월별 흐름` },
    { t: 'kv', keyWidth: 190, rows: monthPillarsOf(thisYear + 1).map((mp, i) => {
      const info = TEN_GOD_INFO[tenGod(r.dayMaster, mp.stem)];
      const good = mp.stemElement === st.yongElement || mp.branchElement === st.yongElement;
      return [`${i === 11 ? 1 : i + 2}월 ${mp.hanja}${good ? ' ★' : ''}`, `${info.name} — ${info.month}`];
    }) },
    { t: 'small', text: '★ 표시는 용신의 기운이 들어와 힘이 실리는 달이에요. 월의 경계는 절기를 따라요.' },
    { t: 'h3', text: '행운 포인트' },
    { t: 'kv', rows: [['색', yong.luckyColor], ['방향', yong.direction], ['숫자', yong.numbers], ['계절', yong.season], ['가까이 둘 것', yong.items], ['음식', yong.foods]] },
    { t: 'note', title: PSYCH.fortune.title, text: PSYCH.fortune.text, cite: PSYCH.fortune.cite });

  // 4. 별자리
  add({ t: 'h2', text: '4. 별자리로 보는 나' },
    { t: 'h3', text: `태양궁 ${SIGNS[astro.sun].name} · 나의 본질` }, { t: 'p', text: SIGNS[astro.sun].sun },
    { t: 'h3', text: `달궁 ${SIGNS[astro.moon].name} · 속마음` }, { t: 'p', text: SIGNS[astro.moon].moon });
  if (astro.asc !== null) add({ t: 'h3', text: `상승궁 ${SIGNS[astro.asc].name} · 첫인상` }, { t: 'p', text: SIGNS[astro.asc].asc });

  // 5. 이름
  if (name) {
    add({ t: 'h2', text: '5. 이름 풀이' },
      { t: 'p', text: `발음오행: ${name.chars.map((c) => `${c.ch}(${EL(c.element).hanja}, ${c.strokes}획)`).join(' → ')}` },
      ...[...new Set(name.flow)].map((k) => ({ t: 'p', text: `${k} — ${FLOW_INFO[k]}` })),
      { t: 'kv', keyWidth: 250, rows: name.grids.map((g) => [`${g.key} ${g.number} · ${SURI[g.number][0]}`, `${LUCK_LABEL[SURI[g.number][1]]} · ${g.period}. ${SURI[g.number][2]}`]) },
      { t: 'small', text: '한글 획수 기준의 참고용 풀이예요. 정통 성명학은 한자 획수와 뜻을 함께 봐요.' });
  }

  add({ t: 'gap', h: 30 },
    { t: 'small', text: `오행과 몸: ${el.hanja}(${el.name})은 ${ORGAN_NOTES[r.dayMasterElement].organs}와 이어져 있다고 봐요. ${ORGAN_NOTES[r.dayMasterElement].tip}` },
    { t: 'small', text: '이 풀이는 자기 이해와 재미를 위한 참고 자료이며, 의학·법률·투자 등 전문적인 판단을 대신하지 않아요. 신강·신약과 용신의 판단은 학파에 따라 다를 수 있어요.' });
  return blocks;
}

export function reportDocument({ input, r }, stress, cardMessage, brand) {
  const t = TYPES[stress.type];
  const dm = DAY_MASTERS[r.dayMaster];
  const yong = EL(r.strength.yongElement);
  const level = LEVELS.find((l) => l.key === stress.level);
  const who = input.name ? `${input.name}님` : '당신';
  const note = PSYCH[stress.type];
  return [
    { t: 'cover', eyebrow: `${brand} · 마음 리포트`, art: standaloneMedallion(t.art, t.color, []), title: `${who}의 마음 지도`, subtitle: `${dm.title} × ${t.name}`,
      lines: [new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })] },
    { t: 'h2', text: '1. 타고난 결과 지금의 마음' },
    { t: 'p', text: `${who}은 본래 ${dm.title}의 기운을 타고났어요. ${dm.keywords.map((k) => `#${k}`).join(' ')}` },
    { t: 'p', text: `그런데 지금의 마음은 ${t.name}의 모습을 하고 있어요. ${t.tagline}` },
    { t: 'p', text: `${dm.stressStyle} ${t.summary}` },
    { t: 'h2', text: '2. 지금의 상태' },
    { t: 'h3', text: `${level.label} (${stress.total}점 / 75점)` }, { t: 'p', text: level.desc },
    { t: 'h3', text: '왜 이렇게 지쳤을까요?' }, { t: 'p', text: t.cause },
    { t: 'h3', text: '몸이 보내는 신호' }, { t: 'p', text: t.body },
    { t: 'h2', text: '3. 회복 처방' },
    { t: 'kv', keyWidth: 190, rows: [['기질 맞춤', dm.healing], ...t.care.map((c) => [c.when, c.text]), ['용신 채우기', `${yong.hanja}(${yong.name})의 기운을 더해 주세요. ${yong.boost}.`], ['피해야 할 것', t.avoid]] },
    { t: 'note', title: `심리학 노트 · ${note.title}`, text: note.text, cite: note.cite },
    { t: 'h2', text: `4. ${who}에게 보내는 편지` },
    { t: 'p', text: dm.caution },
    { t: 'quote', text: `“${cardMessage}”` },
    { t: 'small', text: '이 리포트는 자기 이해를 돕기 위한 참고 자료이며, 의학적 진단이나 상담을 대신하지 않아요.' },
  ];
}
