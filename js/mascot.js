// 달토끼 "보리": 픽셀 아트 캐릭터. 문자 격자를 SVG 사각형으로 바꿔 그린다.
const PAL = {
  K: '#231d4a', W: '#fffaf0', S: '#e8decd', P: '#f7a8b8', N: '#f08fa2',
  E: '#2b2452', H: '#ffffff', G: '#f0cd78', R: '#e9736f',
};

const EARS = [
  '......KK......KK......',
  '.....KWWK....KWWK.....',
  '.....KWPK....KPWK.....',
  '.....KWPK....KPWK.....',
  '.....KWPK....KPWK.....',
  '.....KWPK....KPWK.....',
  '.....KWWK....KWWK.....',
];
const BODY = [
  '....KKWWWKKKKWWWKK....',
  '...KWWWWWWWWWWWWWWK...',
  '..KWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWK..',
  '..KWWWWWWWWWWWWWWWWK..',
  '..KWPPWWWWNNWWWWPPWK..',
  '..KWPPWWWWWWWWWWPPWK..',
  '..KSWWWWWWWWWWWWWWSK..',
  '...KKWWWWWWWWWWWWKK...',
  '....KGGGGGGGGGGGGK....',
  '...KWWWWWWWRRWWWWWWK..',
  '..KWWKWWWWWRRWWWWKWWK.',
  '..KWWKWWWWWWWWWWWKWWK.',
  '...KKKWWWWWWWWWWWKKK..',
  '.....KWWWKKKKKWWWK....',
  '.....KKKK.....KKKK....',
];
const EYES_OPEN = [[6, 11, 'E'], [7, 11, 'E'], [6, 12, 'E'], [7, 12, 'E'], [14, 11, 'E'], [15, 11, 'E'], [14, 12, 'E'], [15, 12, 'E']];
const EYES_CLOSED = [[6, 12, 'E'], [7, 12, 'E'], [14, 12, 'E'], [15, 12, 'E']];

function rects(rows, y0 = 0) {
  let out = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w += 1;
      if (c !== '.') out += `<rect x="${x}" y="${y + y0}" width="${w}" height="1" fill="${PAL[c]}"/>`;
      x += w;
    }
  });
  return out;
}
const dots = (list) => list.map(([x, y, c]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[c]}"/>`).join('');

/** @param {number} size 가로 크기(px) @param {'idle'|'happy'} mood */
export function rabbit(size = 88, mood = 'idle') {
  return `<span class="rabbit rabbit-${mood}" style="width:${size}px" aria-hidden="true">
    <svg viewBox="0 0 22 24" width="${size}" height="${(size * 24) / 22}" shape-rendering="crispEdges">
      <g class="rb-ears">${rects(EARS)}</g>
      <g class="rb-body">${rects(BODY, 7)}</g>
      <g class="rb-open">${dots(EYES_OPEN)}</g>
      <g class="rb-closed">${dots(EYES_CLOSED)}</g>
    </svg>
    <span class="rabbit-shadow"></span>
  </span>`;
}

/** 캐릭터가 말풍선으로 안내한다. text에는 신뢰할 수 있는 HTML만 넣을 것. */
export function guide(text, { mood = 'idle', size = 72 } = {}) {
  return `<div class="guide">${rabbit(size, mood)}<div class="bubble"><small>달토끼 보리</small><p>${text}</p></div></div>`;
}
