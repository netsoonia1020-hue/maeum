// 일러스트: 모두 직접 그린 SVG 선화(線畵). 색은 currentColor를 따른다.

const soft = 'fill="currentColor" fill-opacity=".14"';
const ring = (n, r1, r2, cx = 32, cy = 32, offset = 0) => Array.from({ length: n }, (_, i) => {
  const a = ((i * 360) / n + offset) * (Math.PI / 180);
  const p = (r) => `${(cx + r * Math.sin(a)).toFixed(1)} ${(cy - r * Math.cos(a)).toFixed(1)}`;
  return `M${p(r1)}L${p(r2)}`;
}).join('');

const ICONS = {
  // ── 일간 10종 ──
  tree: `<path ${soft} d="M32 7c-9 0-15 6-15 13 0 2 .5 3.900 1.400 5.600C14.500 27 12 30.500 12 34.500 12 40 17 44 23 44h18c6 0 11-4 11-9.500 0-4-2.500-7.500-6.400-8.900.9-1.700 1.400-3.600 1.400-5.600 0-7-6-13-15-13z"/>
    <path d="M32 57V28M32 40l-8-7M32 34l7-6M22 57h20"/>`,
  flower: `<path d="M31 58c0-13-2-19 5-29"/>
    <path ${soft} d="M32 46c-7 1.500-12.500-1.500-15-8 7-1.500 12.500 1.500 15 8zM33.500 38c6.500 0 10.500-4 11.500-10-6.500 0-10.500 4-11.500 10z"/>
    <g transform="translate(38 17)">${[0, 72, 144, 216, 288].map((r) => `<ellipse ${soft} cx="0" cy="-6.500" rx="3.400" ry="5.200" transform="rotate(${r})"/>`).join('')}<circle cx="0" cy="0" r="2.200" fill="currentColor"/></g>`,
  sun: `<circle ${soft} cx="32" cy="32" r="10"/><path d="${ring(8, 15, 23)}${ring(8, 15, 19, 32, 32, 22.5)}"/>`,
  candle: `<path ${soft} d="M32 8c5 6 8 10 8 15a8 8 0 0 1-16 0c0-5 3-9 8-15z"/>
    <path d="M32 19c2 2.500 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3.500 3-6zM32 31v5"/>
    <rect ${soft} x="24" y="36" width="16" height="18" rx="2"/><path d="M28.500 36v6M17 57h30"/>`,
  mountain: `<path ${soft} d="M4 54l17-27 8 11 9-19 22 35z"/><path d="M33.500 29.500L38 19l5.500 8.500M16.500 34l4.500-7 4 5.500"/>
    <circle cx="14" cy="14" r="4.500"/>`,
  field: `<path d="M32 40V23"/><path ${soft} d="M32 29c-5.500 0-9-3-10-8 5.500 0 9 3 10 8zM32 26c5.500 0 9-3.500 10-9-5.500 0-9 3.500-10 9z"/>
    <path d="M5 44c10-7 19-7 27-3s17 4 27-3M5 52c11-6 20-6 28-3s16 3 26-2M9 59c9-3 17-3 24-1.500s14 1.500 22-1"/>`,
  sword: `<path ${soft} d="M32 5l5 8v27H27V13z"/><path d="M32 12v24M21 40h22M32 40v12"/><circle cx="32" cy="55" r="3"/>
    <path d="M48 12v6M45 15h6M14 22v4M12 24h4"/>`,
  gem: `<path ${soft} d="M19 20h26l9 11-22 25L10 31z"/><path d="M10 31h44M25 20l-4 11 11 25 11-25-4-11"/>
    <path d="M51 8v7M47.500 11.500h7M12 12v4M10 14h4"/>`,
  ocean: `<path d="M45 8a9 9 0 1 0 8 13 7 7 0 0 1-8-13z" ${soft}/>
    <path d="M5 34c5-5.500 9-5.500 13.500 0s9 5.500 13.500 0 9-5.500 13.500 0 9 5.500 13.500 0M5 45c5-5.500 9-5.500 13.500 0s9 5.500 13.500 0 9-5.500 13.500 0 9 5.500 13.500 0M5 56c5-5.500 9-5.500 13.500 0s9 5.500 13.500 0 9-5.500 13.500 0 9 5.500 13.500 0"/>`,
  rain: `<path ${soft} d="M19 33a9.500 9.500 0 0 1 1-19 12.500 12.500 0 0 1 24 2 8.500 8.500 0 0 1 1 17z"/>
    ${[[21, 39], [32, 45], [43, 39]].map(([x, y]) => `<path d="M${x} ${y}c2.200 3.200 3.300 5 3.300 6.700a3.300 3.300 0 0 1-6.600 0c0-1.700 1.100-3.500 3.300-6.700z"/>`).join('')}`,
  // ── 스트레스 유형 ──
  kettle: `<path ${soft} d="M15 35c0-9 7-14 16-14s16 5 16 14v8c0 5-4 9-9 9H24c-5 0-9-4-9-9z"/>
    <path d="M23 21h16M47 33l9-6v9l-9 6M15 31c-6 0-8.500 3-8.500 7s3.500 7 8.500 7"/><circle cx="31" cy="17" r="2.500"/>
    <path d="M56 20c-2-3 2-5 0-8M50 18c-1.500-2 1.500-3.500 0-5.500"/>`,
  fog: `<circle ${soft} cx="45" cy="18" r="7"/><path d="M12 26h24M20 35h34M8 44h36M18 53h30"/>`,
  juggle: `<path d="M12 44c5-32 35-32 40 0" stroke-dasharray="1.500 5"/>
    <circle ${soft} cx="14" cy="32" r="5"/><circle ${soft} cx="32" cy="14" r="5"/><circle ${soft} cx="50" cy="32" r="5"/>
    <path d="M7 55c3-5 11-5 14 0M43 55c3-5 11-5 14 0"/>`,
  // ── 메뉴 ──
  palja: `${[0, 1, 2, 3].map((i) => `<rect ${i === 1 ? soft : ''} x="${7 + i * 13}" y="14" width="10" height="16" rx="2"/><rect ${i === 1 ? soft : ''} x="${7 + i * 13}" y="34" width="10" height="16" rx="2"/>`).join('')}`,
  cards: `<rect ${soft} x="14" y="14" width="24" height="36" rx="3" transform="rotate(-10 26 32)"/><rect x="26" y="14" width="24" height="36" rx="3" transform="rotate(8 38 32)" fill="var(--bg, #14132b)"/>
    <path d="M38 25l1.800 4.700 4.700 1.800-4.700 1.800L38 38l-1.800-4.700-4.700-1.800 4.700-1.800z" transform="rotate(8 38 32)" fill="currentColor" stroke="none"/>`,
  moonstar: `<path ${soft} d="M38 10a20 20 0 1 0 16 30 16 16 0 0 1-16-30z"/><path d="M50 12v7M46.500 15.500h7M13 13v4M11 15h4"/>`,
  scroll: `<path ${soft} d="M18 10h30v38c0 3 2 6 5 6H23c-3 0-5-3-5-6z"/><path d="M18 16c-4 0-7-1-7-3s3-3 7-3M25 22h16M25 30h16M25 38h10M48 48c0 3 2 6 5 6"/>`,
  hearts: `<path ${soft} d="M24 50C10 40 7 32 7 26a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 6-3 14-17 24z"/>
    <path d="M44 16a8 8 0 0 1 13 7c0 6-4 13-15 21"/>`,
  sunrise: `<path ${soft} d="M17 46a15 15 0 0 1 30 0z"/><path d="M6 46h52M14 54h36M32 14v8M12 26l5 5M52 26l-5 5"/>`,
  brush: `<path ${soft} d="M40 8l16 16-22 22-11 3-5 5 3-13z"/><path d="M36 12l16 16M10 56c6 0 10-1 13-3"/>`,
  pulse: `<path ${soft} d="M32 54C14 42 8 33 8 25a11 11 0 0 1 24-5 11 11 0 0 1 24 5c0 8-6 17-24 29z"/><path d="M14 32h9l4-8 6 14 4-6h13"/>`,
  star: `<path ${soft} d="M32 8l6.500 15.500L55 25l-12.500 11L46 53l-14-8.500L18 53l3.500-17L9 25l16.500-1.500z"/>`,
  share: `<circle cx="46" cy="14" r="6"/><circle cx="16" cy="32" r="6"/><circle cx="46" cy="50" r="6"/><path d="M21.500 29l19-11M21.500 35l19 11"/>`,
  download: `<path d="M32 8v32M20 30l12 12 12-12M10 54h44"/>`,
  lock: `<rect ${soft} x="14" y="28" width="36" height="26" rx="4"/><path d="M22 28v-8a10 10 0 0 1 20 0v8M32 38v7"/>`,
};

export function icon(name, size = 28, cls = '') {
  return `<svg class="art ${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ''}</svg>`;
}

const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 나경(羅經)을 본뜬 원형 엠블럼. active: 강조할 지지 인덱스 배열 */
export function medallion(name, color = '#d4b26a', active = [], size = 190) {
  const letters = BRANCH_HANJA.map((ch, i) => {
    const a = (i * 30) * (Math.PI / 180);
    const x = 100 + 80 * Math.sin(a);
    const y = 100 - 80 * Math.cos(a);
    const on = active.includes(i);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${on ? 12 : 10}" fill="${on ? color : '#d4b26a'}" fill-opacity="${on ? 1 : 0.45}" font-weight="${on ? 700 : 400}" text-anchor="middle" dominant-baseline="central" stroke="none">${ch}</text>`;
  }).join('');
  return `<svg class="medallion" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <defs><radialGradient id="mg-${name}" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${color}" stop-opacity=".34"/><stop offset="1" stop-color="${color}" stop-opacity=".04"/></radialGradient></defs>
    <circle cx="100" cy="100" r="97" stroke="#d4b26a" stroke-opacity=".7" stroke-width="1.200"/>
    <circle cx="100" cy="100" r="93" stroke="#d4b26a" stroke-opacity=".3" stroke-width=".8"/>
    <path d="${ring(60, 64, 67.5, 100, 100)}" stroke="#d4b26a" stroke-opacity=".5" stroke-width=".8"/>
    <path d="${ring(12, 62, 68.5, 100, 100, 15)}" stroke="#d4b26a" stroke-opacity=".9" stroke-width="1.200"/>
    <circle cx="100" cy="100" r="68.500" stroke="#d4b26a" stroke-opacity=".55" stroke-width=".8"/>
    <g font-family="'Noto Serif KR', serif">${letters}</g>
    <circle cx="100" cy="100" r="58" fill="url(#mg-${name})" stroke="${color}" stroke-opacity=".6" stroke-width="1"/>
    <g transform="translate(58 58) scale(1.3125)" stroke="${color}" color="${color}" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ''}</g>
  </svg>`;
}

// 고정된 시드로 별을 흩뿌린다 (매번 같은 그림)
function stars(count, w, h, seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  return Array.from({ length: count }, () => {
    const x = (rnd() * w).toFixed(1);
    const y = (rnd() * h).toFixed(1);
    const r = (0.4 + rnd() * 1.1).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
  }).join('');
}
const sparkle = (x, y, r) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" fill="#f6e7bd"/>`;

/** 홈 화면 상단 풍경: 달과 나경, 북두칠성, 겹겹의 산 */
export function heroScene() {
  const dipper = [[34, 78], [62, 64], [90, 70], [116, 86], [120, 116], [154, 124], [160, 94]];
  return `<svg class="hero-art" viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="h-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f6e2a8" stop-opacity=".5"/><stop offset=".45" stop-color="#e2b866" stop-opacity=".14"/><stop offset="1" stop-color="#e2b866" stop-opacity="0"/></radialGradient>
      <radialGradient id="h-moon" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#f3dfae"/><stop offset="1" stop-color="#c99f58"/></radialGradient>
      <linearGradient id="h-m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d3a78"/><stop offset="1" stop-color="#1c1a44"/></linearGradient>
      <linearGradient id="h-m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2760"/><stop offset="1" stop-color="#15143a"/></linearGradient>
      <linearGradient id="h-m3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1947"/><stop offset="1" stop-color="#0f0e2a"/></linearGradient>
      <filter id="h-blur"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    ${stars(90, 390, 210)}
    ${sparkle(206, 38, 5)}${sparkle(24, 150, 4)}${sparkle(352, 196, 3.5)}${sparkle(132, 22, 3)}
    <g stroke="#d4b26a" stroke-opacity=".55" stroke-width=".8"><polyline points="${dipper.map((p) => p.join(',')).join(' ')} 116,86"/></g>
    ${dipper.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.200" fill="#f6e7bd"/>`).join('')}
    <circle cx="282" cy="112" r="120" fill="url(#h-glow)"/>
    <g stroke="#d4b26a" stroke-width=".8">
      <circle cx="282" cy="112" r="92" stroke-opacity=".35"/>
      <circle cx="282" cy="112" r="76" stroke-opacity=".5"/>
      <path d="${ring(72, 76, 80, 282, 112)}" stroke-opacity=".45"/>
      <path d="${ring(12, 76, 92, 282, 112)}" stroke-opacity=".4"/>
      <circle cx="282" cy="112" r="60" stroke-opacity=".25" stroke-dasharray="1 5"/>
    </g>
    <circle cx="282" cy="112" r="44" fill="url(#h-moon)"/>
    <g fill="#b98f4c" fill-opacity=".16"><circle cx="268" cy="100" r="9"/><circle cx="296" cy="124" r="12"/><circle cx="292" cy="94" r="5"/><circle cx="270" cy="128" r="5"/></g>
    <path d="M0 230l40-34 34 22 46-52 44 46 30-22 44 40 36-30 44 36 32-24 40 30v88H0z" fill="url(#h-m1)" fill-opacity=".75"/>
    <ellipse cx="170" cy="250" rx="220" ry="16" fill="#fff" fill-opacity=".1" filter="url(#h-blur)"/>
    <path d="M0 262l52-40 40 28 50-44 46 40 42-30 46 36 44-32 70 44v36H0z" fill="url(#h-m2)"/>
    <ellipse cx="250" cy="276" rx="200" ry="12" fill="#fff" fill-opacity=".08" filter="url(#h-blur)"/>
    <path d="M0 286l60-28 54 22 60-34 54 30 50-20 52 24 60-22v42H0z" fill="url(#h-m3)"/>
  </svg>`;
}

/** 위로 카드 뒷면: 해와 달 */
export function cardBack() {
  return `<svg viewBox="0 0 120 180" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <defs><linearGradient id="cb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2766"/><stop offset="1" stop-color="#151336"/></linearGradient></defs>
    <rect width="120" height="180" fill="url(#cb)"/>
    <g stroke="#d4b26a" stroke-width=".8">
      <rect x="7" y="7" width="106" height="166" rx="7" stroke-opacity=".9"/>
      <rect x="11" y="11" width="98" height="158" rx="5" stroke-opacity=".4"/>
      <circle cx="60" cy="90" r="30" stroke-opacity=".8"/>
      <circle cx="60" cy="90" r="36" stroke-opacity=".35" stroke-dasharray="1 4"/>
      <path d="${ring(16, 40, 50, 60, 90)}" stroke-opacity=".55"/>
      <path d="M60 22v20M60 138v20" stroke-opacity=".4"/>
    </g>
    <circle cx="60" cy="90" r="17" fill="#d4b26a" fill-opacity=".9"/>
    <circle cx="67" cy="85" r="15" fill="#1e1b4b"/>
    ${sparkle(60, 30, 5)}${sparkle(60, 150, 5)}${sparkle(24, 26, 3)}${sparkle(96, 26, 3)}${sparkle(24, 154, 3)}${sparkle(96, 154, 3)}
    ${stars(26, 120, 180, 11)}
  </svg>`;
}

/** 공유 이미지를 그릴 때 쓰는 독립 SVG 문자열 (캔버스에 올리기 위해 xmlns 포함) */
export function standaloneMedallion(name, color, active) {
  return medallion(name, color, active, 600).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
}
export function standaloneHero() {
  return heroScene().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="830" ');
}
