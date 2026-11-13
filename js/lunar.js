// 음력 ↔ 양력 변환 (korean-lunar-calendar, MIT License, 1000~2050년 지원)
import KoreanLunarCalendar from './vendor/korean-lunar-calendar.js';

const cal = new KoreanLunarCalendar();
const pad = (n) => String(n).padStart(2, '0');

/** 음력 날짜를 양력 'YYYY-MM-DD'로. 없는 날짜(윤달이 아닌 달을 윤달로 지정 등)면 null */
export function lunarToSolar(year, month, day, isLeapMonth = false) {
  if (!cal.setLunarDate(year, month, day, isLeapMonth)) return null;
  const s = cal.getSolarCalendar();
  return `${s.year}-${pad(s.month)}-${pad(s.day)}`;
}

/** 양력 날짜를 음력 { year, month, day, leap }으로 */
export function solarToLunar(year, month, day) {
  if (!cal.setSolarDate(year, month, day)) return null;
  const l = cal.getLunarCalendar();
  return { year: l.year, month: l.month, day: l.day, leap: !!l.intercalation };
}
