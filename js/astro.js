// 서양 점성학 계산: 태양궁·달궁·상승궁 (열대 황도대, 출생지는 서울 기준)
import { julianDay, solarLongitude, koreaOffset } from './saju.js';

const mod = (n, m) => ((n % m) + m) % m;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// 달의 황경 (Meeus 47장 주요 항, 오차 약 0.05°)
const MOON_TERMS = [
  [6288774, 0, 0, 1, 0], [1274027, 2, 0, -1, 0], [658314, 2, 0, 0, 0], [213618, 0, 0, 2, 0],
  [-185116, 0, 1, 0, 0], [-114332, 0, 0, 0, 2], [58793, 2, 0, -2, 0], [57066, 2, -1, -1, 0],
  [53322, 2, 0, 1, 0], [45758, 2, -1, 0, 0], [-40923, 0, 1, -1, 0], [-34720, 1, 0, 0, 0],
  [-30383, 0, 1, 1, 0], [15327, 2, 0, 0, -2], [-12528, 0, 0, 1, 2], [10980, 0, 0, 1, -2],
  [10675, 4, 0, -1, 0], [10034, 0, 0, 3, 0], [8548, 4, 0, -2, 0], [-7888, 2, 1, -1, 0],
  [-6766, 2, 1, 0, 0], [-5163, 1, 0, -1, 0], [4987, 1, 1, 0, 0], [4036, 2, -1, 1, 0],
];
export function moonLongitude(jd) {
  const t = (jd - 2451545) / 36525;
  const lp = 218.3164477 + 481267.88123421 * t;
  const d = rad(297.8501921 + 445267.1114034 * t);
  const m = rad(357.5291092 + 35999.0502909 * t);
  const mp = rad(134.9633964 + 477198.8675055 * t);
  const f = rad(93.272095 + 483202.0175233 * t);
  let sum = 0;
  for (const [c, kd, km, kmp, kf] of MOON_TERMS) sum += c * Math.sin(kd * d + km * m + kmp * mp + kf * f);
  return mod(lp + sum / 1e6, 360);
}

// 상승궁(Ascendant)의 황경
export function ascendant(jd, latitude, longitudeEast) {
  const t = (jd - 2451545) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t;
  const theta = rad(mod(gmst + longitudeEast, 360));
  const eps = rad(23.4392911 - 0.0130042 * t);
  const asc = Math.atan2(Math.cos(theta), -(Math.sin(theta) * Math.cos(eps) + Math.tan(rad(latitude)) * Math.sin(eps)));
  return mod(deg(asc), 360);
}

const SEOUL = { lat: 37.5665, lon: 126.978 };

/** @returns {{sun:number, moon:number, asc:number|null, moonUncertain:boolean}} 별자리 인덱스(0=양자리) */
export function calculateAstro({ year, month, day, hour = null, minute = 0 }) {
  const timeKnown = hour !== null && hour !== undefined && !Number.isNaN(hour);
  const h = timeKnown ? hour + minute / 60 : 12;
  const offset = koreaOffset(year, month, day, timeKnown ? hour : 12);
  const jd = julianDay(year, month, day, h - offset);
  const sign = (lon) => Math.floor(lon / 30);
  const moon = moonLongitude(jd);
  // 시간을 모르면 그날 0시와 24시의 달 별자리가 다른지 확인한다
  const moonUncertain = !timeKnown && sign(moonLongitude(jd - 0.5)) !== sign(moonLongitude(jd + 0.5));
  return {
    sun: sign(solarLongitude(jd)),
    moon: sign(moon),
    asc: timeKnown ? sign(ascendant(jd, SEOUL.lat, SEOUL.lon)) : null,
    moonUncertain,
    degrees: { sun: solarLongitude(jd), moon, asc: timeKnown ? ascendant(jd, SEOUL.lat, SEOUL.lon) : null },
  };
}
