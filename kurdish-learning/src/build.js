const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, PageBreak, BorderStyle, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require('docx');
const { weeks, finalDays } = require('./lessons.js');

const OUT = process.argv[2] || 'kurdish-plan.docx';
const FONT = 'Segoe UI';
const C = { primary: '1F5F4A', accent: 'C0392B', gold: 'B8860B', soft: 'EEF5F1', soft2: 'FBF3E4', grey: '666666', line: 'BFD3C9', head: 'D9EAE2' };
const W = 9638; // A4 content width in DXA (11906 - 2*1134)
const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

// ---------- helpers ----------
function run(text, o = {}) {
  const size = o.size || 22;
  return new TextRun({
    text, font: { ascii: FONT, hAnsi: FONT, cs: FONT }, rightToLeft: o.ltr ? false : true,
    size, sizeComplexScript: size, bold: o.bold, boldComplexScript: o.bold,
    italics: o.italic, italicsComplexScript: o.italic, color: o.color,
  });
}
function para(children, o = {}) {
  if (typeof children === 'string') children = [run(children, o)];
  return new Paragraph({
    children, bidirectional: !o.ltr, alignment: o.center ? AlignmentType.CENTER : undefined,
    spacing: { before: o.before ?? 40, after: o.after ?? 80, line: o.line ?? 300 },
    heading: o.heading, numbering: o.bullet ? { reference: 'bul', level: 0 } : (o.check ? { reference: 'chk', level: 0 } : undefined),
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    border: o.rule ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.primary, space: 4 } } : undefined,
    keepNext: o.keepNext, pageBreakBefore: o.pageBreak,
  });
}
const h1 = (t, pb = true) => para([run(t, { size: 36, bold: true, color: C.primary })], { heading: HeadingLevel.HEADING_1, pageBreak: pb, rule: true, after: 160, keepNext: true });
const h2 = (t) => para([run(t, { size: 26, bold: true, color: C.accent })], { heading: HeadingLevel.HEADING_2, before: 220, after: 80, keepNext: true });
const bullet = (t, o = {}) => para(typeof t === 'string' ? [run(t, o)] : t, { bullet: true, after: 40 });
const check = (t) => para([run(t)], { check: true, after: 40 });

function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map(c =>
    c instanceof Paragraph ? c : para([run(String(c), o)], { ltr: o.ltr, center: o.center, before: 20, after: 20, line: 276 }));
  return new TableCell({
    children: paras, width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}
const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
function table(widths, header, rows, o = {}) {
  const trs = [];
  if (header) trs.push(new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { bold: true, fill: C.head, center: true, size: 20 })) }));
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => {
    const spec = (o.colOpts && o.colOpts[i]) || {};
    return c instanceof TableCell ? c : cell(c, widths[i], { ...spec, fill: spec.fill || (o.zebra && ri % 2 ? 'F7FAF8' : undefined) });
  }) })));
  return new Table({
    rows: trs, width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
    visuallyRightToLeft: true, borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
  });
}
const spacer = () => para('', { before: 0, after: 60 });
const ku = (t, extra = {}) => ({ size: 26, bold: true, color: C.primary, ...extra });

// ---------- day indexing ----------
const days = []; // {n, kind, week, lesson}
weeks.forEach((wk, wi) => {
  wk.lessons.forEach((ls, li) => days.push({ n: wi * 7 + li + 1, kind: 'lesson', wi, ls }));
  days.push({ n: wi * 7 + 7, kind: 'review', wi });
});
finalDays.forEach((f, i) => days.push({ n: 85 + i, kind: 'final', f }));
const byN = Object.fromEntries(days.map(d => [d.n, d]));
const lessonTitle = (n) => { const d = byN[n]; return d.kind === 'lesson' ? d.ls.t : d.kind === 'review' ? `مرور هفته ${fa(d.wi + 1)}` : d.f.t; };

const listening = [
  'یک آهنگ از محەممەد ماملێ (خوانندهٔ مهابادی) را گوش کن و هر کلمه‌ای شناختی یادداشت کن.',
  'یک کارتون کودکانهٔ کردی سورانی در یوتیوب ببین (کلمات ساده و تکراری دارند).',
  'یک آهنگ از حەسەن زیرەک گوش کن؛ سعی کن یک جمله از آن را تکرار کنی.',
  '۱۰ دقیقه خبر یا برنامهٔ کردی (Rudaw یا Kurdistan24) ببین؛ فقط دنبال کلمه‌های آشنا بگرد.',
  'از شوهرت بخواه ۵ دقیقه دربارهٔ روزش به کردی حرف بزند؛ تو فقط گوش کن و بعد خلاصه کن.',
  'به پیام صوتی یکی از فامیل‌ها (یا ضبط صدای شوهرت) دوباره گوش بده و جمله‌ها را بنویس.',
];

// ---------- exercise generation ----------
function splitPair(s) { const [k, f, p] = s.split('|'); return { k, f, p }; }
function blankOut(k) {
  // blank the last word (usually the verb) — strip trailing punctuation
  const m = k.match(/^(.*?)([^\s]+?)([.!؟?،]*)$/);
  if (!m || !m[1].trim()) return null;
  return { q: m[1] + '_______' + m[3], a: m[2] };
}

// ---------- sections ----------
const out = [];

// Cover
out.push(para('', { before: 1800 }));
out.push(para([run('بەرنامەی فێربوونی کوردی', { size: 52, bold: true, color: C.primary })], { center: true }));
out.push(para([run('برنامهٔ ۹۰ روزهٔ یادگیری کردی مهابادی', { size: 40, bold: true, color: C.accent })], { center: true, after: 200 }));
out.push(para([run('گویش موکریانی (سورانی) — از صفر تا مکالمهٔ روان', { size: 28, color: C.grey })], { center: true }));
out.push(para([run('روزی ۲ ساعت • ۱۲ هفته + ۶ روز جمع‌بندی • بیش از ۷۰۰ واژه • ۴۰+ فعل • ۴۰۰+ جملهٔ کاربردی', { size: 22, color: C.grey })], { center: true, after: 600 }));
out.push(para([run('بە هیوای سەرکەوتن! 🌸', { size: 32, bold: true, color: C.gold })], { center: true }));
out.push(para([run('(به امید موفقیت!)', { size: 22, color: C.grey })], { center: true }));

// How to use
out.push(h1('راهنمای استفاده'));
out.push(para('این برنامه برای یک فارسی‌زبان طراحی شده که همسرش اهل مهاباد است. یعنی یک معلم بومی هر روز کنارت هست. بزرگ‌ترین مزیتت همین است، پس هر روز بخشی از تمرین را با او انجام بده.'));
out.push(h2('ساختار برنامه'));
[
  'هر هفته ۶ روز درس جدید و یک روز مرور و آزمون دارد (روزهای ۷، ۱۴، ۲۱، ... ۸۴).',
  'روزهای ۸۵ تا ۹۰ برای جمع‌بندی، مکالمهٔ کامل و آزمون نهایی هستند.',
  'هر روز: برنامهٔ زمانی ۲ ساعته، نکتهٔ دستوری، ۱۰ واژه، صرف فعل، جمله‌های کاربردی و تمرین‌ها.',
  'هفته‌های ۱ تا ۴: پایه (حال ساده، زندگی روزمره) | هفته‌های ۵ تا ۸: گذشته و مکالمهٔ اجتماعی | هفته‌های ۹ تا ۱۲: جمله‌های پیچیده و روانی.',
].forEach(t => out.push(bullet(t)));
out.push(h2('برنامهٔ ثابت ۲ ساعتهٔ هر روز'));
out.push(table([1700, 2200, 5738], ['زمان', 'بخش', 'چه کار کنم؟'], [
  ['۱۵ دقیقه', '۱. مرور', 'کارت‌های واژهٔ روزهای قبل را مرور کن (روش لایتنر). جمله‌های دیروز را از حفظ بگو.'],
  ['۲۵ دقیقه', '۲. واژه‌های جدید', 'هر کلمه را ۳ بار بلند بخوان، یک بار بنویس و برایش کارت بساز (یک طرف کردی، طرف دیگر فارسی).'],
  ['۲۵ دقیقه', '۳. دستور و فعل', 'نکتهٔ دستوری را بخوان، جدول فعل را بلند صرف کن و با هر شکل یک جملهٔ کوتاه بساز.'],
  ['۲۰ دقیقه', '۴. جمله‌ها و گفتگو', 'روش «سایه» (Shadowing): هر جمله را بخوان، چشم را ببند و تکرار کن تا از حفظ شود.'],
  ['۲۰ دقیقه', '۵. تمرین نوشتاری', 'تمرین‌های ترجمه، جای خالی و جمله‌سازی همان روز را انجام بده.'],
  ['۱۵ دقیقه', '۶. مکالمه و شنیداری', 'تکلیف گفتاری روز را با شوهرت انجام بده و چند دقیقه کردی گوش کن.'],
], { colOpts: [{ center: true, bold: true }, { bold: true, color: C.primary }, {}], zebra: true }));
out.push(h2('قانون‌های طلایی'));
[
  'هر روز، حتی اگر وقت کم داشتی، حداقل بخش ۱ و ۶ را انجام بده. پیوستگی از زمان طولانی مهم‌تر است.',
  'یک دفتر «اشتباه‌های من» داشته باش و هر اصلاحی که شوهرت کرد را در آن بنویس.',
  'از روز ۱ به بعد صدای خودت را ضبط کن. ضبط روز ۱ را با روز ۹۰ مقایسه کن!',
  'از شوهرت خواهش کن هر روز حداقل ۱۵ دقیقه فقط کردی با تو حرف بزند، حتی اگر کامل نفهمیدی.',
  'تلفظ لاتین فقط در هفته‌های اول کمک است. هدف این است که خط کردی را مستقیم بخوانی.',
  'گویش‌های کردی با هم فرق دارند. اگر شوهرت کلمه‌ای را متفاوت گفت، شکل مهابادی او را یاد بگیر و در حاشیه بنویس.',
].forEach(t => out.push(bullet(t)));
out.push(h2('تمرین روزانه با Claude'));
out.push(para('هر روز می‌توانی به من بگویی «روز ۱۲» (یا هر روز دیگر) تا با هم همان درس را تمرین کنیم: پرسش و پاسخ، اصلاح جمله‌هایت، آزمون واژه و گفتگوی نقش‌آفرینی.'));
out.push(h2('راهنمای تلفظ لاتین'));
out.push(table([1600, 3200, 1600, 3238], ['لاتین', 'تلفظ', 'لاتین', 'تلفظ'], [
  ['a', 'آ (مثل آب)', 'e', 'فتحه (مثل دَر)'],
  ['ê', 'ای باز (بین «ای» و «اِ»)', 'ı', 'کسرهٔ خیلی کوتاه (نوشته نمی‌شود)'],
  ['î', 'ای (مثل سیب)', 'o', 'اُ (مثل «او» کوتاه)'],
  ['u', 'اُ کوتاه', 'û', 'او کشیده (مثل دوست)'],
  ['ç', 'چ', 'ş', 'ش'],
  ['j', 'ژ', 'c', 'ج'],
  ['x', 'خ', 'ř', 'ر غلیظ (ڕ)'],
  ['ł', 'ل غلیظ (ڵ)', 'w', 'و (مثل وای)'],
], { colOpts: [{ ltr: true, center: true, bold: true, color: C.primary }, {}, { ltr: true, center: true, bold: true, color: C.primary }, {}] }));

// Overview
out.push(h1('نقشهٔ ۹۰ روز'));
weeks.forEach((wk, wi) => {
  out.push(h2(wk.title));
  const rows = [];
  for (let i = 1; i <= 7; i++) { const n = wi * 7 + i; rows.push([`روز ${fa(n)}`, lessonTitle(n), '☐']); }
  out.push(table([1500, 7138, 1000], null, rows, { colOpts: [{ bold: true, center: true, color: C.primary }, {}, { center: true }], zebra: true }));
});
out.push(h2('روزهای ۸۵ تا ۹۰ — جمع‌بندی و آزمون نهایی'));
out.push(table([1500, 7138, 1000], null, finalDays.map((f, i) => [`روز ${fa(85 + i)}`, f.t, '☐']), { colOpts: [{ bold: true, center: true, color: C.primary }, {}, { center: true }], zebra: true }));

// Days
function scheduleTable(n, ls) {
  const rev = [n - 1, n - 3, n - 7].filter(x => x >= 1 && byN[x].kind === 'lesson').map(x => `روز ${fa(x)}`);
  const revText = rev.length ? `کارت‌های واژهٔ ${rev.join('، ')} را مرور کن و جمله‌های دیروز را از حفظ بگو.` : 'اولین روز است! الفبای کردی را یک بار از روی جدول بلند بخوان.';
  return table([1500, 8138], ['زمان', 'برنامهٔ امروز'], [
    ['۱۵ دقیقه', revText],
    ['۲۵ دقیقه', `${fa(ls.w.length)} واژهٔ جدید: بلند بخوان، بنویس، کارت بساز.`],
    ['۲۵ دقیقه', ls.v ? `نکتهٔ دستوری + صرف فعل «${ls.v.inf}»` : 'نکتهٔ دستوری را بخوان و با هر نکته ۲ جمله بساز.'],
    ['۲۰ دقیقه', `${fa(ls.s.length)} جملهٔ کاربردی${ls.d ? ' + گفتگو' : ''}: روش سایه تا حفظ شوند.`],
    ['۲۰ دقیقه', 'تمرین‌های نوشتاری الف تا د.'],
    ['۱۵ دقیقه', 'تکلیف گفتاری + ' + listening[n % listening.length]],
  ], { colOpts: [{ center: true, bold: true, color: C.primary }, {}], zebra: true });
}

function lessonDay(d) {
  const { n, ls, wi } = d;
  const res = [];
  res.push(h1(`روز ${fa(n)} — ${ls.t}`));
  res.push(para([run(`${weeks[wi].title}`, { color: C.grey, size: 20 })], { after: 120 }));
  res.push(scheduleTable(n, ls));

  res.push(h2('۱. نکتهٔ دستوری'));
  ls.g.forEach(g => res.push(bullet(g)));

  res.push(h2('۲. واژه‌های امروز'));
  const hasP = ls.w.some(x => splitPair(x).p) && wi < 4;
  const wr = ls.w.map((x, i) => { const p = splitPair(x); return hasP ? [fa(i + 1), p.k, p.p || '', p.f] : [fa(i + 1), p.k, p.f]; });
  res.push(hasP
    ? table([700, 3200, 2400, 3338], ['#', 'کردی', 'تلفظ', 'فارسی'], wr, { colOpts: [{ center: true, color: C.grey }, ku(), { ltr: true, italic: true, color: C.grey, center: true }, {}], zebra: true })
    : table([700, 4469, 4469], ['#', 'کردی', 'فارسی'], wr, { colOpts: [{ center: true, color: C.grey }, ku(), {}], zebra: true }));

  if (ls.v) {
    const v = ls.v;
    res.push(h2(`۳. فعل امروز: ${v.inf} (${v.fa})`));
    const pron = ['ئەمن', 'ئەتۆ', 'ئەو', 'ئێمە', 'ئێوە', 'ئەوان'];
    const cols = v.cols || ['حال', 'گذشته'];
    res.push(table([1800, 3919, 3919], ['ضمیر', cols[0], cols[1]], pron.map((p, i) => [p, v.pres[i] || '—', v.past[i] || '—']),
      { colOpts: [{ bold: true, center: true }, ku({ size: 24, center: true }), ku({ size: 24, center: true, color: C.accent })], zebra: true }));
    if (v.imp && v.imp !== '—') res.push(para([run('امری: ', { bold: true }), run(v.imp, ku({ size: 24 }))], { before: 80 }));
    if (v.note) res.push(para([run('نکته: ', { bold: true, color: C.gold }), run(v.note)]));
  } else {
    res.push(h2('۳. فعل امروز'));
    res.push(para('امروز فعل جدیدی نداری. فعل‌های روزهای قبل را در جمله‌های امروز پیدا کن و زیرشان خط بکش.'));
  }

  res.push(h2('۴. جمله‌های کاربردی'));
  res.push(table([600, 5000, 4038], ['#', 'کردی', 'فارسی'], ls.s.map((x, i) => { const p = splitPair(x); return [fa(i + 1), p.k, p.f]; }),
    { colOpts: [{ center: true, color: C.grey }, ku({ size: 24 }), {}], zebra: true }));

  if (ls.d) {
    res.push(h2('گفتگو'));
    res.push(table([5000, 4638], ['کردی', 'فارسی'], ls.d.map(x => { const p = splitPair(x); return [p.k, p.f]; }),
      { colOpts: [ku({ size: 22 }), { color: C.grey }], zebra: true }));
  }

  res.push(h2('۵. تمرین‌ها'));
  res.push(para([run('الف) کارت‌سازی: ', { bold: true }), run(`برای همهٔ ${fa(ls.w.length)} واژه کارت بساز. فردا، ۳ روز بعد و ۷ روز بعد مرورشان کن.`)]));
  res.push(para([run('ب) ترجمه به کردی ', { bold: true }), run('(اول جواب‌ها را بپوشان، بعد با جدول جمله‌ها چک کن):', { color: C.grey })]));
  ls.s.forEach((x, i) => res.push(para([run(`${fa(i + 1)}. ${splitPair(x).f}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 40 })));
  const blanks = ls.s.map(x => blankOut(splitPair(x).k)).filter(Boolean).slice(0, 4);
  if (blanks.length) {
    res.push(para([run('ج) جای خالی را پر کن:', { bold: true })], { before: 120 }));
    blanks.forEach((b, i) => res.push(para([run(`${fa(i + 1)}. `), run(b.q, { size: 24, color: C.primary })], { after: 40 })));
    res.push(para([run('پاسخ‌ها: ', { bold: true, color: C.grey, size: 18 }), run(blanks.map((b, i) => `${fa(i + 1)}) ${b.a}`).join('   '), { color: C.grey, size: 18 })]));
  }
  res.push(para([run('د) جمله‌سازی: ', { bold: true }), run(ls.v ? `۵ جملهٔ جدید دربارهٔ زندگی خودت با فعل «${ls.v.inf}» و واژه‌های امروز بنویس.` : '۵ جملهٔ جدید دربارهٔ زندگی خودت با واژه‌های امروز بنویس.')], { before: 120 }));
  for (let i = 0; i < 3; i++) res.push(para([run('……………………………………………………………………………………………………', { color: 'BBBBBB' })], { after: 20 }));
  res.push(para([run('هـ) تکلیف گفتاری با شوهرت: ', { bold: true, color: C.accent }), run(ls.task)], { before: 120, fill: C.soft2 }));

  res.push(h2('✔ چک‌لیست امروز'));
  ['مرور کارت‌های قبلی', 'واژه‌های جدید + کارت', 'دستور و فعل', 'جمله‌ها از حفظ', 'تمرین‌های نوشتاری', 'تکلیف گفتاری و شنیداری'].forEach(t => res.push(check(t)));
  return res;
}

function reviewDay(d) {
  const { n, wi } = d;
  const wk = weeks[wi];
  const res = [];
  res.push(h1(`روز ${fa(n)} — مرور و آزمون هفته ${fa(wi + 1)}`));
  res.push(para([run(wk.title, { color: C.grey, size: 20 })], { after: 120 }));
  res.push(table([1500, 8138], ['زمان', 'برنامهٔ امروز'], [
    ['۲۰ دقیقه', 'همهٔ کارت‌های این هفته (حدود ۶۰ واژه) را مرور کن. کارت‌هایی که بلد نبودی را جدا کن.'],
    ['۲۰ دقیقه', 'نکته‌های دستوری ۶ روز گذشته را دوباره بخوان و برای هر کدام یک جمله بساز.'],
    ['۲۵ دقیقه', 'آزمون واژه (بخش ۱) و آزمون ترجمه (بخش ۲) را بدون نگاه انجام بده.'],
    ['۲۵ دقیقه', 'اشتباه‌های آزمون را در دفتر «اشتباه‌های من» بنویس و کارت‌های سخت را دوباره تمرین کن.'],
    ['۳۰ دقیقه', 'گفتگوی آزاد با شوهرت دربارهٔ همهٔ موضوعات این هفته (بخش ۳).'],
  ], { colOpts: [{ center: true, bold: true, color: C.primary }, {}], zebra: true }));

  res.push(h2('موضوعات این هفته'));
  wk.lessons.forEach((ls, i) => res.push(bullet(`روز ${fa(wi * 7 + i + 1)}: ${ls.t}`)));

  // vocab test: 2 words per lesson = 12
  res.push(h2('۱. آزمون واژه: معادل کردی را بنویس'));
  const vt = [];
  wk.lessons.forEach(ls => { [1, 6].forEach(k => { if (ls.w[k]) vt.push(splitPair(ls.w[k])); }); });
  const half = Math.ceil(vt.length / 2);
  const rows = [];
  for (let i = 0; i < half; i++) {
    const a = vt[i], b = vt[i + half];
    rows.push([`${fa(i + 1)}. ${a.f}`, '', b ? `${fa(i + 1 + half)}. ${b.f}` : '', '']);
  }
  res.push(table([2600, 2219, 2600, 2219], ['فارسی', 'کردی', 'فارسی', 'کردی'], rows));
  res.push(para([run('پاسخ‌ها: ', { bold: true, color: C.grey, size: 18 }), run(vt.map((x, i) => `${fa(i + 1)}) ${x.k}`).join('  '), { color: C.grey, size: 18 })], { before: 80 }));

  res.push(h2('۲. آزمون ترجمه: به کردی بگو و بنویس'));
  const st = [];
  wk.lessons.forEach(ls => { const s = ls.s; [s[0], s[s.length - 1]].forEach(x => st.push(splitPair(x))); });
  st.forEach((x, i) => res.push(para([run(`${fa(i + 1)}. ${x.f}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 40 })));
  res.push(para([run('پاسخ‌ها: ', { bold: true, color: C.grey, size: 18 }), run(st.map((x, i) => `${fa(i + 1)}) ${x.k}`).join('   '), { color: C.grey, size: 18 })], { before: 80 }));

  res.push(h2('۳. گفتگوی آزاد با شوهرت (۳۰ دقیقه)'));
  [
    'هر موضوع این هفته را ۵ دقیقه پیش بکش. شوهرت سؤال بپرسد و تو فقط کردی جواب بدهی.',
    'دو دقیقه بدون توقف دربارهٔ هفته‌ات به کردی صحبت کن و ضبطش کن.',
    'از شوهرت بخواه ۳ اشتباه مهمت را بگوید و آن‌ها را در دفتر بنویس.',
  ].forEach(t => res.push(bullet(t)));
  res.push(h2('خودارزیابی'));
  res.push(table([6638, 1000, 1000, 1000], ['', 'خوب', 'متوسط', 'ضعیف'], [
    ['واژه‌های این هفته را می‌دانم', '☐', '☐', '☐'],
    ['می‌توانم فعل‌های این هفته را صرف کنم', '☐', '☐', '☐'],
    ['جمله‌ها را از حفظ و درست می‌گویم', '☐', '☐', '☐'],
    ['در گفتگو با شوهرم راحت بودم', '☐', '☐', '☐'],
  ], { colOpts: [{}, { center: true }, { center: true }, { center: true }] }));
  res.push(para('اگر بیشتر از دو مورد «ضعیف» بود، قبل از هفتهٔ بعد یک روز دیگر مرور کن. اشکالی ندارد که برنامه یک روز عقب بیفتد!', { fill: C.soft2, before: 120 }));
  return res;
}

function finalDay(d) {
  const res = [];
  res.push(h1(`روز ${fa(d.n)} — ${d.f.t}`));
  res.push(para('هفتهٔ آخر برای ترکیب همه چیز است. امروز ۲ ساعت را این‌طور بگذران:', { after: 120 }));
  d.f.items.forEach(t => res.push(check(t)));
  res.push(h2('مرور ۳۰ دقیقه‌ای'));
  const wk = (d.n - 85) * 2;
  res.push(para(`کارت‌های هفته‌های ${fa(wk + 1)} و ${fa(wk + 2)} را مرور کن و از هر هفته ۵ جمله را از حفظ بگو.`));
  return res;
}

days.forEach(d => out.push(...(d.kind === 'lesson' ? lessonDay(d) : d.kind === 'review' ? reviewDay(d) : finalDay(d))));

// ---------- appendices ----------
out.push(h1('پیوست ۱ — مرجع دستور زبان'));
out.push(h2('ضمیرها'));
out.push(table([1800, 2600, 2600, 2638], ['فارسی', 'منفصل (مهاباد)', 'چسبان (ملکی / فاعل گذشتهٔ متعدی)', 'بودن (است)'], [
  ['من', 'ئەمن', 'ـم', 'ـم'], ['تو', 'ئەتۆ', 'ـت', 'ـی'], ['او', 'ئەو', 'ـی', 'ـە'],
  ['ما', 'ئێمە', 'ـمان', 'ـین'], ['شما', 'ئێوە', 'ـتان', 'ـن'], ['آن‌ها', 'ئەوان', 'ـیان', 'ـن'],
], { colOpts: [{ bold: true, center: true }, ku({ center: true }), ku({ center: true }), ku({ center: true })], zebra: true }));
out.push(h2('ساخت زمان‌ها'));
out.push(table([2100, 3300, 2000, 2238], ['زمان', 'ساخت', 'لازم (هاتن)', 'متعدی (خواردن)'], [
  ['حال ساده', 'دە + بن مضارع + شناسه', 'دێم', 'دەخۆم'],
  ['منفی حال', 'نا + بن مضارع + شناسه', 'نایەم', 'ناخۆم'],
  ['التزامی', 'بـ + بن مضارع + شناسه', 'بێم', 'بخۆم'],
  ['امری', 'بـ + بن مضارع (+ ـە)', 'وەرە', 'بخۆ'],
  ['نهی', 'مە + بن مضارع', 'مەیە', 'مەخۆ'],
  ['گذشتهٔ ساده', 'لازم: بن ماضی + شناسه | متعدی: ضمیر چسبان', 'هاتم', 'خواردم / نانم خوارد'],
  ['ماضی استمراری', 'دە + بن ماضی', 'دەهاتم', 'دەمخوارد'],
  ['ماضی نقلی', 'بن ماضی + وو + ...', 'هاتووم', 'خواردوومە'],
  ['مجهول', 'بن + رێ (حال) / را (گذشته)', '—', 'دەخورێ / خورا'],
  ['آینده', 'همان حال ساده + قید زمان', 'سبەی دێم', 'سبەی دەخۆم'],
], { colOpts: [{ bold: true }, {}, ku({ center: true }), ku({ center: true })], zebra: true }));
out.push(h2('پسوندهای اسم'));
out.push(table([3000, 3300, 3338], ['کاربرد', 'پسوند', 'مثال'], [
  ['معرفه (آن ...)', 'ـەکە / ـکە', 'کتێبەکە'], ['نکره (یک ...)', 'ـێک / ـیەک', 'کتێبێک'],
  ['جمع', 'ـان', 'کتێبان'], ['جمع معرفه', 'ـەکان', 'کتێبەکان'], ['اضافه (کسره)', 'ـی', 'کتێبی من'],
  ['این / آن', 'ئەم ... ە / ئەو ... ە', 'ئەم کتێبە'], ['تفضیلی / عالی', 'ـتر / ـترین', 'باشتر، باشترین'],
], { colOpts: [{}, ku({ center: true }), ku({ center: true })], zebra: true }));

out.push(h1('پیوست ۲ — فهرست همهٔ فعل‌ها'));
const verbRows = [];
weeks.forEach((wk, wi) => wk.lessons.forEach((ls, li) => { if (ls.v) verbRows.push([fa(wi * 7 + li + 1), ls.v.inf, ls.v.fa, ls.v.pres[0], ls.v.past[0], ls.v.imp]); }));
out.push(table([800, 1900, 2000, 1700, 1700, 1538], ['روز', 'مصدر', 'معنی', 'من (حال)', 'من (ستون دوم)', 'امری'], verbRows,
  { colOpts: [{ center: true, color: C.grey }, ku({ size: 22 }), {}, ku({ size: 22, center: true }), ku({ size: 22, center: true, color: C.accent }), ku({ size: 22, center: true })], zebra: true }));

out.push(h1('پیوست ۳ — آزمون نهایی (روز ۸۹)'));
out.push(h2('بخش الف: ترجمه به کردی'));
[
  'من فارس هستم و شوهرم اهل مهاباد است.', 'دیروز به خانهٔ مادرشوهرم رفتیم و دلمه خوردیم.', 'اگر فردا هوا خوب باشد، به کوه می‌رویم.',
  'تا حالا به دریاچهٔ ارومیه رفته‌ای؟', 'در بچگی هر تابستان به روستا می‌رفتیم.', 'فکر می‌کنم یادگیری کردی خیلی مهم است، چون می‌خواهم با خانواده‌ات حرف بزنم.',
  'کتابی که دیروز خریدم خیلی خوب است.', 'مادرم گفت که جمعه می‌آید.', 'لطفاً آهسته‌تر حرف بزن، نمی‌فهمم.', 'نوروزت مبارک! سالی پر از شادی برایت آرزو می‌کنم.',
].forEach((t, i) => out.push(para([run(`${fa(i + 1)}. ${t}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 40 })));
out.push(h2('بخش ب: صرف فعل'));
out.push(para('فعل‌های هاتن، چوون، خواردن، کردن، دیتن، گوتن، زانین، دان، نووسین و تێگەیشتن را برای «ئەمن» و «ئەو» در حال، گذشته، ماضی نقلی و امری بنویس.'));
out.push(h2('بخش ج: گفتار (با شوهرت یا خانواده‌اش)'));
['۲ دقیقه خودت را کامل معرفی کن.', '۳ دقیقه یک خاطره تعریف کن.', '۳ دقیقه دربارهٔ یک موضوع نظر بده و از آن دفاع کن.', '۲ دقیقه یک گفتگوی تلفنی نقش‌آفرینی کن.'].forEach(t => out.push(bullet(t)));
out.push(para('معیار موفقیت: اگر توانستی ۱۰ دقیقه بدون برگشتن به فارسی حرف بزنی، به هدف ۳ ماهه رسیده‌ای! 🎉', { fill: C.soft, before: 120 }));

out.push(h1('پیوست ۴ — منابع و ۳ ماه بعد'));
out.push(h2('منابع پیشنهادی'));
[
  'شنیداری: کانال‌های Rudaw و Kurdistan24 (سورانی)، کارتون‌های کودکانهٔ کردی در یوتیوب',
  'موسیقی موکریانی: محەممەد ماملێ، حەسەن زیرەک، ناسر ڕەزازی، عەزیز وەیسی',
  'شعر: هێمن و هەژار (شاعران بزرگ منطقهٔ مهاباد). خواندن شعرشان در ماه سوم عالی است.',
  'فرهنگ لغت: واژه‌نامه‌های کردی-فارسی سورانی مثل «هەنبانە بۆرینە» اثر هەژار',
  'صفحه‌کلید کردی سورانی را روی گوشی‌ات فعال کن تا پیام‌هایت را کردی بنویسی.',
].forEach(t => out.push(bullet(t)));
out.push(h2('بعد از ۹۰ روز'));
[
  'ماه ۴: هر روز یک برنامهٔ کردی ۲۰ دقیقه‌ای ببین و خلاصه‌اش را بگو.',
  'ماه ۵: یک کتاب داستان کودکانه یا رمان ساده به کردی بخوان.',
  'ماه ۶: یک هفته به مهاباد سفر کن و فقط کردی حرف بزن!',
].forEach(t => out.push(bullet(t)));
out.push(para('توجه: این برنامه بر پایهٔ کردی سورانی با ویژگی‌های گویش موکریانی نوشته شده است. لهجهٔ هر خانواده ممکن است کمی فرق کند. هر جا شوهرت شکل دیگری گفت، شکل او را ملاک بگذار.', { fill: C.soft2, before: 200 }));

// ---------- document ----------
const doc = new Document({
  creator: 'Claude', title: 'برنامهٔ ۹۰ روزهٔ یادگیری کردی مهابادی',
  styles: {
    default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 300 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 36, bold: true, color: C.primary }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true, color: C.accent }, paragraph: { outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 500, hanging: 300 } } } }] },
    { reference: 'chk', levels: [{ level: 0, format: LevelFormat.BULLET, text: '☐', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 500, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'برنامهٔ ۹۰ روزهٔ کردی مهابادی — صفحه ', font: FONT, size: 16, color: C.grey, rightToLeft: true }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.grey }),
    ] })] }) },
    children: out,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('wrote', OUT, b.length); });
