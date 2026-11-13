// 풀이 문서를 캔버스에 조판해 PDF 파일로 만든다.
// 한글 글꼴을 PDF에 심는 대신 각 쪽을 이미지(JPEG)로 넣어, 어떤 기기에서도 같은 모양으로 열린다.

const W = 1240; // A4 @150dpi
const H = 1754;
const M = 118; // 여백
const INK = '#2a2440';
const SOFT = '#6a637f';
const GOLD = '#9a7527';
const PAPER = '#fbf7ee';
const SERIF = '"Noto Serif KR", "Nanum Myeongjo", "AppleMyungjo", serif';
const SANS = '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';

const loadImage = (svg) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

function wrap(ctx, text, maxWidth) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * @param {Array<object>} blocks 문서 블록 목록
 * @param {{brand:string, footer:string}} meta
 * @returns {Promise<Blob>} PDF
 */
export async function renderPdf(blocks, meta) {
  await Promise.all([document.fonts.load(`600 40px ${SERIF}`), document.fonts.ready]);
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const pages = [];
  let y = 0;
  let pageNo = 0;

  const startPage = () => {
    pageNo += 1;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(154,117,39,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(46, 46, W - 92, H - 92);
    ctx.fillStyle = SOFT; ctx.font = `400 22px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(`${meta.brand} · ${meta.footer}`, W / 2, H - 76);
    ctx.textAlign = 'right'; ctx.fillText(String(pageNo), W - M, H - 76);
    ctx.textAlign = 'left';
    y = M + 10;
  };
  const endPage = async () => {
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
    pages.push(new Uint8Array(await blob.arrayBuffer()));
  };
  const need = async (h) => {
    if (y + h > H - M - 30) { await endPage(); startPage(); }
  };
  const text = async (str, { font, color = INK, lh, x = M, width = W - M * 2, gap = 0, keep = 2 }) => {
    ctx.font = font;
    const lines = wrap(ctx, str, width);
    for (let i = 0; i < lines.length; i++) {
      await need(i === 0 ? lh * Math.min(keep, lines.length) : lh);
      ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left';
      ctx.fillText(lines[i], x, y + lh * 0.76);
      y += lh;
    }
    y += gap;
  };

  startPage();
  for (const b of blocks) {
    if (b.t === 'cover') {
      const img = b.art ? await loadImage(b.art) : null;
      ctx.textAlign = 'center';
      ctx.fillStyle = GOLD; ctx.font = `600 30px ${SANS}`; ctx.fillText(b.eyebrow, W / 2, 250);
      if (img) {
        ctx.fillStyle = '#17153d'; ctx.beginPath(); ctx.arc(W / 2, 560, 250, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(img, W / 2 - 235, 325, 470, 470);
      }
      ctx.fillStyle = INK; ctx.font = `600 76px ${SERIF}`;
      wrap(ctx, b.title, W - 260).forEach((line, i) => ctx.fillText(line, W / 2, 950 + i * 100));
      ctx.fillStyle = GOLD; ctx.font = `600 36px ${SERIF}`; ctx.fillText(b.subtitle, W / 2, 1140);
      ctx.fillStyle = SOFT; ctx.font = `400 30px ${SANS}`;
      b.lines.forEach((line, i) => ctx.fillText(line, W / 2, 1230 + i * 52));
      ctx.textAlign = 'left';
      await endPage(); startPage();
    } else if (b.t === 'h2') {
      await need(460); // 제목만 쪽 끝에 홀로 남지 않도록
      y += 26;
      ctx.fillStyle = GOLD; ctx.fillRect(M, y, 64, 5);
      y += 26;
      await text(b.text, { font: `600 46px ${SERIF}`, lh: 64, gap: 16 });
    } else if (b.t === 'h3') {
      await need(130);
      y += 10;
      await text(b.text, { font: `700 31px ${SANS}`, color: GOLD, lh: 46, gap: 4 });
    } else if (b.t === 'p') {
      await text(b.text, { font: `400 29px ${SANS}`, lh: 49, gap: 18 });
    } else if (b.t === 'small') {
      await text(b.text, { font: `400 23px ${SANS}`, color: SOFT, lh: 38, gap: 12 });
    } else if (b.t === 'quote') {
      ctx.font = `600 33px ${SERIF}`;
      const lines = wrap(ctx, b.text, W - M * 2 - 90);
      const h = lines.length * 56 + 56;
      await need(h + 20);
      ctx.fillStyle = '#f3ead6'; roundRect(ctx, M, y, W - M * 2, h, 18); ctx.fill();
      ctx.fillStyle = GOLD; ctx.fillRect(M, y + 18, 6, h - 36);
      ctx.fillStyle = INK; ctx.font = `600 33px ${SERIF}`;
      lines.forEach((line, i) => ctx.fillText(line, M + 46, y + 28 + 56 * (i + 0.76)));
      y += h + 26;
    } else if (b.t === 'note') {
      ctx.font = `400 26px ${SANS}`;
      const lines = wrap(ctx, b.text, W - M * 2 - 80);
      const h = lines.length * 43 + 100 + (b.cite ? 40 : 0);
      await need(h + 20);
      ctx.strokeStyle = 'rgba(154,117,39,0.5)'; ctx.lineWidth = 2; roundRect(ctx, M, y, W - M * 2, h, 18); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = `700 26px ${SANS}`; ctx.fillText(b.title, M + 40, y + 56);
      ctx.fillStyle = INK; ctx.font = `400 26px ${SANS}`;
      lines.forEach((line, i) => ctx.fillText(line, M + 40, y + 72 + 43 * (i + 0.76)));
      if (b.cite) { ctx.fillStyle = SOFT; ctx.font = `400 20px ${SANS}`; ctx.fillText(b.cite, M + 40, y + h - 28, W - M * 2 - 80); }
      y += h + 26;
    } else if (b.t === 'kv') {
      const kw = b.keyWidth ?? 210;
      for (const [k, v] of b.rows) {
        ctx.font = `400 28px ${SANS}`;
        const lines = wrap(ctx, v, W - M * 2 - kw);
        await need(lines.length * 46 + 22);
        ctx.strokeStyle = 'rgba(42,36,64,0.12)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke();
        y += 12;
        ctx.fillStyle = GOLD; ctx.font = `700 26px ${SANS}`; ctx.fillText(k, M, y + 34);
        ctx.fillStyle = INK; ctx.font = `400 28px ${SANS}`;
        lines.forEach((line, i) => ctx.fillText(line, M + kw, y + 46 * (i + 0.76)));
        y += lines.length * 46 + 10;
      }
      y += 20;
    } else if (b.t === 'pillars') {
      const colW = (W - M * 2 - 3 * 24) / 4;
      const tile = 150;
      await need(tile * 2 + 250);
      b.cols.forEach((c, i) => {
        const x = M + i * (colW + 24);
        const cx = x + colW / 2;
        ctx.textAlign = 'center';
        if (c.me) { ctx.fillStyle = '#f3ead6'; roundRect(ctx, x, y, colW, tile * 2 + 236, 18); ctx.fill(); }
        ctx.fillStyle = SOFT; ctx.font = `700 26px ${SANS}`; ctx.fillText(c.label, cx, y + 42);
        ctx.fillStyle = GOLD; ctx.font = `700 24px ${SANS}`; ctx.fillText(c.top, cx, y + 82);
        [[c.stem, c.stemSub, c.color1], [c.branch, c.branchSub, c.color2]].forEach(([ch, sub, color], j) => {
          const ty = y + 100 + j * (tile + 12);
          ctx.fillStyle = '#1b1942'; roundRect(ctx, cx - tile / 2, ty, tile, tile, 20); ctx.fill();
          ctx.fillStyle = color; ctx.font = `600 78px ${SERIF}`; ctx.fillText(ch, cx, ty + 92);
          ctx.fillStyle = '#cfc8e0'; ctx.font = `400 20px ${SANS}`; ctx.fillText(sub, cx, ty + 128);
        });
        const by = y + 100 + tile * 2 + 12;
        ctx.fillStyle = GOLD; ctx.font = `700 24px ${SANS}`; ctx.fillText(c.bottom, cx, by + 40);
        ctx.fillStyle = SOFT; ctx.font = `400 24px ${SERIF}`; ctx.fillText(c.hidden, cx, by + 76);
        ctx.fillText(c.stage, cx, by + 110);
        ctx.textAlign = 'left';
      });
      y += tile * 2 + 262;
    } else if (b.t === 'bars') {
      for (const r of b.rows) {
        await need(56);
        ctx.fillStyle = INK; ctx.font = `600 27px ${SANS}`; ctx.fillText(r.label, M, y + 34);
        const bx = M + 250; const bw = W - M * 2 - 250 - 110;
        ctx.fillStyle = 'rgba(42,36,64,0.1)'; roundRect(ctx, bx, y + 16, bw, 18, 9); ctx.fill();
        if (r.value > 0) { ctx.fillStyle = r.color ?? GOLD; roundRect(ctx, bx, y + 16, Math.max(18, bw * (r.value / r.max)), 18, 9); ctx.fill(); }
        ctx.fillStyle = SOFT; ctx.font = `600 25px ${SANS}`; ctx.textAlign = 'right'; ctx.fillText(r.text ?? String(r.value), W - M, y + 34); ctx.textAlign = 'left';
        y += 56;
      }
      y += 16;
    } else if (b.t === 'gap') {
      y += b.h ?? 20;
    } else if (b.t === 'break') {
      await endPage(); startPage();
    }
  }
  await endPage();
  return buildPdf(pages);
}

// 최소한의 PDF 작성기: 쪽마다 JPEG 이미지 하나를 A4에 꽉 채운다.
function buildPdf(jpegs) {
  const enc = new TextEncoder();
  const parts = [];
  const offsets = [];
  let pos = 0;
  const push = (d) => { const u = typeof d === 'string' ? enc.encode(d) : d; parts.push(u); pos += u.length; };
  const obj = (n, head, stream) => {
    offsets[n] = pos;
    push(`${n} 0 obj\n${head}\n`);
    if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); }
    push('endobj\n');
  };
  const PW = 595.28; const PH = 841.89;
  push('%PDF-1.4\n');
  const n = jpegs.length;
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Count ${n} /Kids [${jpegs.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`);
  jpegs.forEach((jpg, i) => {
    const page = 3 + i * 3;
    const content = enc.encode(`q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`);
    obj(page, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${page + 2} 0 R >> >> /Contents ${page + 1} 0 R >>`);
    obj(page + 1, `<< /Length ${content.length} >>`, content);
    obj(page + 2, `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>`, jpg);
  });
  const count = 2 + n * 3;
  const xref = pos;
  push(`xref\n0 ${count + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= count; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}

/** PDF를 기기에 저장한다. 아이폰·아이패드는 공유 시트(파일에 저장)를, 그 밖에는 바로 내려받기를 쓴다. */
export async function savePdf(blob, filename) {
  const file = new File([blob], filename, { type: 'application/pdf' });
  const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isApple && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return 'downloaded';
}
