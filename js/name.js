// 한글 성명학: 획수 수리(원·형·이·정 4격)와 발음오행
// 정통 성명학은 한자 획수를 쓰지만, 여기서는 널리 쓰이는 한글 획수 기준을 따른다.

const CHO_STROKES = [2, 4, 2, 3, 6, 5, 4, 4, 8, 2, 4, 1, 3, 6, 4, 3, 4, 4, 3];
const JUNG_STROKES = [2, 3, 3, 4, 2, 3, 3, 4, 2, 4, 5, 3, 3, 2, 4, 5, 3, 3, 1, 2, 1];
const JONG_STROKES = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3];
// 초성의 발음오행 (0 木 ㄱㅋ, 1 火 ㄴㄷㄹㅌ, 2 土 ㅇㅎ, 3 金 ㅅㅈㅊ, 4 水 ㅁㅂㅍ)
const CHO_ELEMENT = [0, 0, 1, 1, 1, 1, 4, 4, 4, 3, 3, 2, 3, 3, 3, 0, 1, 4, 2];

export const isKoreanName = (name) => /^[가-힣]{2,4}$/.test(name ?? '');

function decompose(ch) {
  const n = ch.charCodeAt(0) - 0xac00;
  const cho = Math.floor(n / 588);
  const jung = Math.floor((n % 588) / 28);
  const jong = n % 28;
  return { ch, cho, strokes: CHO_STROKES[cho] + JUNG_STROKES[jung] + JONG_STROKES[jong], element: CHO_ELEMENT[cho] };
}

const wrap = (n) => (n > 81 ? ((n - 1) % 80) + 1 : n);
const mod = (n, m) => ((n % m) + m) % m;

/** 이름은 성 1글자 + 이름 1~3글자로 가정한다. */
export function analyzeName(name) {
  if (!isKoreanName(name)) return null;
  const chars = [...name].map(decompose);
  const [family, ...given] = chars;
  const sum = (arr) => arr.reduce((s, c) => s + c.strokes, 0);
  const givenSum = sum(given);
  const grids = [
    { key: '원격', period: '초년운 · 타고난 바탕', number: wrap(given.length === 1 ? givenSum + 1 : givenSum) },
    { key: '형격', period: '청년운 · 성격과 사회성', number: wrap(family.strokes + given[0].strokes) },
    { key: '이격', period: '중년운 · 대인 관계', number: wrap(family.strokes + given.at(-1).strokes + (given.length === 1 ? 1 : 0)) },
    { key: '정격', period: '말년운 · 인생 총운', number: wrap(sum(chars)) },
  ];
  // 발음오행의 흐름: 인접한 글자끼리 상생(生)·비화(같음)·상극(剋)
  const flow = [];
  for (let i = 0; i < chars.length - 1; i++) {
    const rel = mod(chars[i + 1].element - chars[i].element, 5);
    flow.push(rel === 0 ? '비화' : rel === 1 || rel === 4 ? '상생' : '상극');
  }
  return { chars, grids, flow, elements: chars.map((c) => c.element) };
}
