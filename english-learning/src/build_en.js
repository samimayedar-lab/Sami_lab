const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, PageBreak, BorderStyle, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require('docx');
const weeks = [...require('./en1.js'), ...require('./en2.js')];

const OUT = process.argv[2] || 'english-plan.docx';
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


// ================= English B1 -> B2 plan =================
C.primary = '1F4E79'; C.accent = 'C0392B'; C.head = 'DCE6F2'; C.line = 'B4C7DC'; C.soft = 'EAF1F8';
const en = (o = {}) => ({ ltr: true, size: 22, ...o });
const enB = (o = {}) => ({ ltr: true, size: 22, bold: true, color: C.primary, ...o });
const sp = (s) => { const [a, b, c] = s.split('|'); return { a, b, c }; };

const days = [];
weeks.forEach((wk, wi) => {
  wk.lessons.forEach((ls, li) => days.push({ n: wi * 7 + li + 1, kind: 'lesson', wi, ls }));
  days.push({ n: wi * 7 + 7, kind: 'review', wi });
});
const finalDays = [
  { t: 'Mock Test 1 — Reading & Use of English', items: ['یک آزمون Reading سطح B2 (مثلاً نمونه‌های رایگان Cambridge B2 First یا IELTS Academic/General) را با زمان‌سنج انجام بده.','بخش Use of English (word formation, collocations) را انجام بده و اشتباه‌ها را تحلیل کن.','کلمه‌های جدید را به کارت‌هایت اضافه کن.'] },
  { t: 'Mock Test 2 — Listening', items: ['یک آزمون Listening نمونهٔ B2 را کامل انجام بده.','فایل‌ها را با transcript دوباره گوش کن و جاهایی که نفهمیدی را علامت بزن.','۲۰ دقیقه shadowing روی یکی از فایل‌ها.'] },
  { t: 'Mock Test 3 — Writing', items: ['یک essay (۱۸۰ کلمه) در ۴۰ دقیقه بنویس.','یک ایمیل یا نامهٔ رسمی (۱۵۰ کلمه) در ۳۰ دقیقه بنویس.','هر دو را برای Claude بفرست و با معیارهای B2 (Content, Organisation, Language) نمره بگیر.'] },
  { t: 'Mock Test 4 — Speaking', items: ['با Claude یک آزمون Speaking کامل (۱۵ دقیقه، سبک IELTS Part 1-2-3) انجام بده.','پاسخ‌هایت را ضبط کن و با ضبط روز ۱ مقایسه کن.','۳ ضعف اصلی را بنویس و برای هر کدام ۱۰ دقیقه تمرین کن.'] },
  { t: 'Final Review — Weak Points', items: ['دفتر «اشتباه‌های من» را کامل مرور کن.','کارت‌های سخت (کارت‌هایی که هنوز بلد نیستی) را ۳ بار مرور کن.','ضعیف‌ترین بخش گرامر را دوباره از روی درسش تمرین کن.'] },
  { t: 'Final Assessment & Celebration 🎉', items: ['آزمون نهایی پیوست ۲ را انجام بده.','۱۰ دقیقه گفتگوی آزاد با Claude دربارهٔ هر موضوعی، بدون توقف.','جدول «B2 Can-Do» را تیک بزن و برنامهٔ ۳ ماه بعد را بچین. Congratulations!'] },
];
finalDays.forEach((f, i) => days.push({ n: 85 + i, kind: 'final', f }));
const byN = Object.fromEntries(days.map(d => [d.n, d]));
const titleOf = (n) => { const d = byN[n]; return d.kind === 'lesson' ? d.ls.t : d.kind === 'review' ? `Week ${d.wi + 1} Review & Test` : d.f.t; };

function blankWord(word, ex) {
  const head = word.split('/')[0].trim().replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let m = ex.match(new RegExp('\\b' + esc(head) + '\\w*', 'i'));
  if (!m && !head.includes(' ')) { const stem = head.slice(0, Math.max(4, head.length - 2)); m = ex.match(new RegExp('\\b' + esc(stem) + '\\w*', 'i')); }
  if (!m && head.includes(' ')) { const f = head.split(' ')[0]; if (f.length > 3) m = ex.match(new RegExp('\\b' + esc(f.slice(0, f.length - 1)) + '\\w*', 'i')); }
  if (!m) return null;
  return { q: ex.slice(0, m.index) + '________' + ex.slice(m.index + m[0].length), a: m[0] };
}
const titlePara = (n, t) => para([run(`روز ${fa(n)} — `, { size: 34, bold: true, color: C.primary }), run(t, { ltr: true, size: 34, bold: true, color: C.primary })],
  { heading: HeadingLevel.HEADING_1, pageBreak: true, rule: true, after: 120, keepNext: true });
const listening = [
  'BBC Learning English — 6 Minute English', 'TED / TED-Ed (با زیرنویس انگلیسی)', 'پادکست All Ears English', 'Luke\'s English Podcast',
  'BBC News (۱۰ دقیقه بخش خبر)', 'یک قسمت سریال انگلیسی با زیرنویس انگلیسی', 'VOA Learning English',
];

const out = [];
// Cover
out.push(para('', { before: 1800 }));
out.push(para([run('English B1 → B2', { ltr: true, size: 60, bold: true, color: C.primary })], { center: true, ltr: true }));
out.push(para([run('برنامهٔ ۹۰ روزهٔ رسیدن از سطح B1 به B2', { size: 40, bold: true, color: C.accent })], { center: true, after: 200 }));
out.push(para([run('روزی ۲ ساعت • ۱۲ هفته + ۶ روز آزمون نهایی • ۷۲۰ واژه و عبارت • ۷۲ درس گرامر و مهارت', { size: 24, color: C.grey })], { center: true }));
out.push(para([run('Speaking • Listening • Reading • Writing', { ltr: true, size: 24, color: C.grey })], { center: true, ltr: true, after: 600 }));
out.push(para([run('You can do it!', { ltr: true, size: 36, bold: true, color: C.gold })], { center: true, ltr: true }));

// Guide
out.push(h1('راهنمای استفاده'));
out.push(para('این برنامه برای کسی طراحی شده که الان در سطح B1 است: مکالمهٔ روزمره را بلد است، اما هنوز روان و دقیق حرف نمی‌زند. هدف این است که بعد از ۹۰ روز بتوانی در سطح B2 حرف بزنی، بنویسی و متن‌های واقعی را بفهمی.'));
out.push(h2('سطح B2 یعنی چه؟'));
[
  'دربارهٔ موضوعات متنوع، از جمله موضوعات انتزاعی، روان و بدون مکث زیاد صحبت کنی.',
  'نظرت را با دلیل و مثال بیان کنی و از آن دفاع کنی.',
  'ایدهٔ اصلی متن‌ها، مقاله‌ها، اخبار و فیلم‌های عادی را بفهمی.',
  'ایمیل رسمی، essay و گزارش با ساختار درست بنویسی.',
  'با انگلیسی‌زبان‌ها بدون فشار زیاد برای هیچ‌کدام از دو طرف ارتباط برقرار کنی.',
].forEach(t => out.push(bullet(t)));
out.push(h2('ساختار برنامه'));
[
  'هفته‌های ۱ تا ۶: گرامر کلیدی B2 (زمان‌ها، modals، شرطی‌ها، مجهول، نقل قول، الگوهای فعل)',
  'هفته‌های ۷ و ۸: روانی گفتار و ساختارهای پیشرفته (تأکید، inversion، discourse markers)',
  'هفته‌های ۹ تا ۱۱: موضوعات روز، نوشتن در سطح B2 و واژگان پیشرفته (idiom، collocation، phrasal verb)',
  'هفتهٔ ۱۲ و روزهای ۸۵ تا ۹۰: ارائه، مذاکره، مهارت‌های آزمون و آزمون‌های شبیه‌سازی‌شده',
  'روز هفتم هر هفته: مرور و آزمون',
].forEach(t => out.push(bullet(t)));
out.push(h2('برنامهٔ ثابت ۲ ساعتهٔ هر روز'));
out.push(table([1700, 2400, 5538], ['زمان', 'بخش', 'چه کار کنم؟'], [
  ['۱۵ دقیقه', '۱. مرور', 'کارت‌های واژهٔ روزهای قبل (روش لایتنر یا اپ Anki) + جمله‌های دیروز از حفظ'],
  ['۲۰ دقیقه', '۲. واژگان', '۱۰ واژه/عبارت جدید: تلفظ را در فرهنگ لغت آنلاین (Cambridge/Oxford) گوش کن، مثال را بلند بخوان، کارت بساز.'],
  ['۲۵ دقیقه', '۳. گرامر', 'نکته را بخوان، مثال‌ها را تحلیل کن، تمرین‌های جای خالی و ترجمه را انجام بده.'],
  ['۲۵ دقیقه', '۴. شنیداری و خواندن', 'منبع پیشنهادی روز + یادداشت ۵ عبارت جدید'],
  ['۲۰ دقیقه', '۵. نوشتن', 'تکلیف نوشتاری روز؛ هفته‌ای ۲-۳ بار برای Claude بفرست تا اصلاح کند.'],
  ['۱۵ دقیقه', '۶. صحبت کردن', 'تکلیف گفتاری روز با Claude یا ضبط صدای خودت + shadowing جمله‌ها'],
], { colOpts: [{ center: true, bold: true }, { bold: true, color: C.primary }, {}], zebra: true }));
out.push(h2('قانون‌های طلایی'));
[
  'هر روز صحبت کن، حتی ۱۰ دقیقه. صحبت کردن مهم‌ترین تفاوت B1 و B2 است.',
  'صدایت را ضبط کن. ضبط روز ۱ را با روز ۹۰ مقایسه کن!',
  'دفتر «اشتباه‌های من» داشته باش و هر اصلاح را در آن بنویس.',
  'واژه را تنها حفظ نکن؛ همیشه با collocation و یک جملهٔ کامل یاد بگیر.',
  'زبان گوشی و یکی از اپ‌هایت را انگلیسی کن.',
  'اگر یک روز نشد، فردا ادامه بده. پیوستگی از کمال مهم‌تر است.',
].forEach(t => out.push(bullet(t)));
out.push(h2('تمرین روزانه با Claude'));
out.push(para('هر روز به من بگو «English Day 12» (یا هر روز دیگر). همان درس را با هم تمرین می‌کنیم: گفتگو دربارهٔ موضوع روز، اصلاح ملایم اشتباه‌هایت، آزمون واژه و بازخورد روی نوشته‌هایت.'));

// Overview
out.push(h1('نقشهٔ ۹۰ روز'));
weeks.forEach((wk, wi) => {
  out.push(h2(wk.title));
  const rows = [];
  for (let i = 1; i <= 7; i++) { const n = wi * 7 + i; rows.push([`روز ${fa(n)}`, cell(titleOf(n), 7138, { ltr: true }), '☐']); }
  out.push(table([1500, 7138, 1000], null, rows, { colOpts: [{ bold: true, center: true, color: C.primary }, {}, { center: true }], zebra: true }));
});
out.push(h2('روزهای ۸۵ تا ۹۰ — آزمون‌های شبیه‌سازی و جمع‌بندی'));
out.push(table([1500, 7138, 1000], null, finalDays.map((f, i) => [`روز ${fa(85 + i)}`, cell(f.t, 7138, { ltr: true }), '☐']), { colOpts: [{ bold: true, center: true, color: C.primary }, {}, { center: true }], zebra: true }));

function lessonDay({ n, wi, ls }) {
  const r = [];
  r.push(titlePara(n, ls.t));
  r.push(para([run(weeks[wi].title + '  |  موضوع: ', { color: C.grey, size: 20 }), run(ls.topic, { ltr: true, color: C.grey, size: 20 })], { after: 120 }));
  const rev = [n - 1, n - 3, n - 7].filter(x => x >= 1 && byN[x].kind === 'lesson').map(x => `روز ${fa(x)}`);
  r.push(table([1500, 8138], ['زمان', 'برنامهٔ امروز'], [
    ['۱۵ دقیقه', rev.length ? `مرور کارت‌های ${rev.join('، ')} + جمله‌های دیروز از حفظ` : 'اولین روز است! ۵ دقیقه دربارهٔ خودت به انگلیسی صحبت کن و ضبط کن (برای مقایسه در روز ۹۰).'],
    ['۲۰ دقیقه', 'بخش ۲: ۱۰ واژهٔ جدید + کارت‌سازی'],
    ['۲۵ دقیقه', 'بخش ۱ (گرامر) + تمرین‌های ب و ج'],
    ['۲۵ دقیقه', 'بخش ۴: ' + ls.read],
    ['۲۰ دقیقه', 'بخش ۵: تکلیف نوشتاری'],
    ['۱۵ دقیقه', 'بخش ۶: تکلیف گفتاری + shadowing جمله‌ها'],
  ], { colOpts: [{ center: true, bold: true, color: C.primary }, {}], zebra: true }));

  r.push(h2('۱. گرامر و نکتهٔ کلیدی'));
  ls.g.forEach(g => r.push(bullet(g)));

  r.push(h2('۲. واژه‌ها و عبارت‌های امروز'));
  r.push(table([500, 2300, 2300, 4538], ['#', 'English', 'فارسی', 'Example'], ls.w.map((x, i) => { const p = sp(x); return [fa(i + 1), p.a, p.b, p.c]; }),
    { colOpts: [{ center: true, color: C.grey }, enB(), {}, en({ size: 20, italic: true })], zebra: true }));

  r.push(h2('۳. جمله‌های کاربردی (برای حفظ و shadowing)'));
  r.push(table([500, 5000, 4138], ['#', 'English', 'فارسی'], ls.s.map((x, i) => { const p = sp(x); return [fa(i + 1), p.a, p.b]; }),
    { colOpts: [{ center: true, color: C.grey }, enB({ size: 22 }), {}], zebra: true }));

  r.push(h2('۴. شنیداری و خواندن'));
  r.push(para(ls.read, { fill: C.soft }));
  r.push(para('روش: ۱) یک بار برای ایدهٔ کلی ۲) یک بار برای جزئیات ۳) با متن یا زیرنویس. ۵ عبارت جدید را یادداشت کن.', { after: 60 }));

  r.push(h2('۵. تمرین‌ها'));
  const bl = ls.w.map(x => { const p = sp(x); return blankWord(p.a, p.c); }).filter(Boolean).slice(0, 6);
  if (bl.length) {
    r.push(para([run('الف) جای خالی را با واژه‌های امروز پر کن:', { bold: true })]));
    bl.forEach((b, i) => r.push(para([run(`${i + 1}. ${b.q}`, { ltr: true, size: 22 })], { ltr: true, after: 30 })));
    r.push(para([run('Answers: ' + bl.map((b, i) => `${i + 1}) ${b.a}`).join('   '), { ltr: true, size: 18, color: C.grey })], { ltr: true }));
  }
  r.push(para([run('ب) ترجمه به انگلیسی ', { bold: true }), run('(بعد با جدول جمله‌ها چک کن):', { color: C.grey })], { before: 120 }));
  ls.s.forEach((x, i) => r.push(para([run(`${fa(i + 1)}. ${sp(x).b}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 30 })));
  r.push(para([run('ج) جمله‌سازی: ', { bold: true }), run('با ۵ واژه از واژه‌های امروز و با گرامر امروز، ۵ جمله دربارهٔ زندگی خودت بنویس.')], { before: 120 }));
  for (let i = 0; i < 3; i++) r.push(para([run('……………………………………………………………………………………………………', { color: 'BBBBBB' })], { after: 20 }));
  r.push(para([run('د) نوشتن: ', { bold: true, color: C.primary }), run(ls.write)], { before: 120, fill: C.soft }));
  r.push(para([run('هـ) صحبت کردن: ', { bold: true, color: C.accent }), run(ls.task)], { before: 80, fill: C.soft2 }));

  r.push(h2('✔ چک‌لیست امروز'));
  ['مرور کارت‌های قبلی', '۱۰ واژهٔ جدید + کارت', 'گرامر + تمرین‌ها', 'شنیداری / خواندن', 'تکلیف نوشتاری', 'تکلیف گفتاری + ضبط صدا'].forEach(t => r.push(check(t)));
  return r;
}

function reviewDay({ n, wi }) {
  const wk = weeks[wi]; const r = [];
  r.push(titlePara(n, `Week ${wi + 1} Review & Test`));
  r.push(para([run(wk.title, { color: C.grey, size: 20 })], { after: 120 }));
  r.push(table([1500, 8138], ['زمان', 'برنامهٔ امروز'], [
    ['۲۰ دقیقه', 'مرور همهٔ ۶۰ کارت این هفته؛ کارت‌های سخت را جدا کن.'],
    ['۲۰ دقیقه', 'نکته‌های گرامر ۶ درس را دوباره بخوان؛ برای هر کدام ۲ جملهٔ جدید بساز.'],
    ['۲۵ دقیقه', 'آزمون واژه (بخش ۱) و آزمون ترجمه (بخش ۲) بدون نگاه کردن به درس‌ها'],
    ['۲۵ دقیقه', 'یک متن طولانی‌تر (۲۵۰ کلمه) با موضوع یکی از درس‌ها بنویس و برای Claude بفرست.'],
    ['۳۰ دقیقه', 'آزمون صحبت با Claude (بخش ۳)'],
  ], { colOpts: [{ center: true, bold: true, color: C.primary }, {}], zebra: true }));
  r.push(h2('درس‌های این هفته'));
  wk.lessons.forEach((ls, i) => r.push(para([run(`روز ${fa(wi * 7 + i + 1)}: `, { bold: true }), run(ls.t, { ltr: true })], { bullet: true, after: 40 })));

  r.push(h2('۱. آزمون واژه: معادل انگلیسی را بنویس'));
  const vt = []; wk.lessons.forEach(ls => [2, 7].forEach(k => ls.w[k] && vt.push(sp(ls.w[k]))));
  const half = Math.ceil(vt.length / 2); const rows = [];
  for (let i = 0; i < half; i++) { const a = vt[i], b = vt[i + half]; rows.push([`${fa(i + 1)}. ${a.b}`, '', b ? `${fa(i + 1 + half)}. ${b.b}` : '', '']); }
  r.push(table([2600, 2219, 2600, 2219], ['فارسی', 'English', 'فارسی', 'English'], rows));
  r.push(para([run('Answers: ' + vt.map((x, i) => `${i + 1}) ${x.a}`).join('   '), { ltr: true, size: 18, color: C.grey })], { ltr: true, before: 80 }));

  r.push(h2('۲. آزمون ترجمه: به انگلیسی بنویس'));
  const st = []; wk.lessons.forEach(ls => [1, 4].forEach(k => ls.s[k] && st.push(sp(ls.s[k]))));
  st.forEach((x, i) => r.push(para([run(`${fa(i + 1)}. ${x.b}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 30 })));
  r.push(para([run('Answers: ' + st.map((x, i) => `${i + 1}) ${x.a}`).join('   '), { ltr: true, size: 18, color: C.grey })], { ltr: true, before: 80 }));

  r.push(h2('۳. آزمون صحبت با Claude (۳۰ دقیقه)'));
  [`به Claude بگو: «Week ${wi + 1} speaking test». او از هر درس این هفته سؤال می‌پرسد.`,
   'هر جواب حداقل ۴-۵ جمله باشد (روش PREP: نکته، دلیل، مثال، جمع‌بندی).',
   'در پایان از Claude بخواه ۳ اشتباه پرتکرارت و ۳ نقطهٔ قوتت را بگوید.'].forEach(t => r.push(bullet(t)));
  r.push(h2('خودارزیابی'));
  r.push(table([6638, 1000, 1000, 1000], ['', 'خوب', 'متوسط', 'ضعیف'], [
    ['واژه‌های این هفته را می‌دانم و می‌توانم به کار ببرم', '☐', '☐', '☐'], ['گرامر این هفته را در صحبت درست استفاده می‌کنم', '☐', '☐', '☐'],
    ['جمله‌های کاربردی را از حفظ می‌گویم', '☐', '☐', '☐'], ['در گفتگو راحت و بدون مکث زیاد بودم', '☐', '☐', '☐'],
  ], { colOpts: [{}, { center: true }, { center: true }, { center: true }] }));
  r.push(para('اگر بیشتر از دو مورد «ضعیف» بود، قبل از هفتهٔ بعد یک روز اضافه مرور کن.', { fill: C.soft2, before: 120 }));
  return r;
}

function finalDay({ n, f }) {
  const r = [titlePara(n, f.t)];
  r.push(para('هفتهٔ آخر برای سنجیدن خودت در شرایط شبیه آزمون است. ۲ ساعت امروز را این‌طور بگذران:', { after: 120 }));
  f.items.forEach(t => r.push(check(t)));
  r.push(h2('منابع آزمون رایگان'));
  ['Cambridge English: نمونه آزمون‌های «B2 First» (sample papers)', 'IELTS.org و British Council: نمونه سؤالات IELTS', 'British Council LearnEnglish: بخش Skills (سطح B2)'].forEach(t => r.push(bullet(t)));
  return r;
}

days.forEach(d => out.push(...(d.kind === 'lesson' ? lessonDay(d) : d.kind === 'review' ? reviewDay(d) : finalDay(d))));

// Appendix 1 — grammar reference
out.push(h1('پیوست ۱ — مرجع گرامر'));
out.push(h2('زمان‌ها'));
out.push(table([2600, 3300, 3738], ['Tense', 'Form', 'Example'], [
  ['Present Simple', 'V / V-s', 'She works here.'], ['Present Continuous', 'am/is/are + V-ing', 'I\'m studying now.'],
  ['Present Perfect', 'have/has + V3', 'I\'ve been to Tabriz.'], ['Present Perfect Cont.', 'have/has been + V-ing', 'I\'ve been learning for a year.'],
  ['Past Simple', 'V2', 'We met in 2020.'], ['Past Continuous', 'was/were + V-ing', 'It was raining.'],
  ['Past Perfect', 'had + V3', 'The train had left.'], ['Past Perfect Cont.', 'had been + V-ing', 'I had been waiting.'],
  ['Future Simple', 'will + V', 'I\'ll call you.'], ['be going to', 'am/is/are going to + V', 'We\'re going to move.'],
  ['Future Continuous', 'will be + V-ing', 'I\'ll be working at 5.'], ['Future Perfect', 'will have + V3', 'I\'ll have finished by June.'],
], { colOpts: [enB(), en(), en({ italic: true })], zebra: true }));
out.push(h2('جمله‌های شرطی'));
out.push(table([1800, 3800, 4038], ['Type', 'Form', 'Example'], [
  ['Zero', 'If + present, present', 'If you heat ice, it melts.'], ['First', 'If + present, will + V', 'If it rains, we\'ll stay home.'],
  ['Second', 'If + past, would + V', 'If I had time, I\'d travel.'], ['Third', 'If + had V3, would have V3', 'If I had known, I would have come.'],
  ['Mixed', 'If + had V3, would + V', 'If I had studied, I\'d be a doctor now.'], ['Wish', 'wish + past / past perfect / would', 'I wish I knew. / I wish I had gone.'],
], { colOpts: [enB(), en(), en({ italic: true })], zebra: true }));
out.push(h2('مجهول و نقل قول'));
out.push(table([3200, 3200, 3238], ['Active / Direct', 'Passive / Reported', 'نکته'], [
  ['They build houses.', 'Houses are built.', 'be + V3'], ['They have sold it.', 'It has been sold.', 'have been + V3'],
  ['People say he is rich.', 'He is said to be rich.', 'impersonal passive'], ['"I am tired," she said.', 'She said she was tired.', 'یک زمان به عقب'],
  ['"Where do you live?"', 'He asked where I lived.', 'ترتیب خبری'], ['"Sit down!"', 'He told me to sit down.', 'tell + sb + to'],
], { colOpts: [en(), en({ bold: true, color: C.primary }), {}], zebra: true }));
out.push(h2('فعل‌های + ing / + to'));
out.push(table([4819, 4819], ['+ V-ing', '+ to V'], [
  ['enjoy, avoid, mind, finish, keep, suggest', 'want, decide, hope, plan, agree, refuse'],
  ['consider, can\'t stand, give up, deny, admit', 'manage, afford, promise, learn, offer, seem'],
  ['look forward to, be used to, interested in', 'would like, expect, intend, tend, fail'],
  ['remember/stop/try/regret + ing (معنی ۱)', 'remember/stop/try/regret + to (معنی ۲)'],
], { colOpts: [en(), en()], zebra: true }));

// Appendix 2 — final test
out.push(h1('پیوست ۲ — آزمون نهایی (روز ۹۰)'));
out.push(h2('بخش الف: ترجمه به انگلیسی'));
['اگر زودتر شروع کرده بودم، الان روان صحبت می‌کردم.','گفته می‌شود که این شهر هزار سال پیش ساخته شده است.','هفتهٔ پیش موهایم را کوتاه کردم (در آرایشگاه).','از من پرسید که چند وقت است انگلیسی یاد می‌گیرم.','نه تنها انگلیسی‌ام بهتر شده، بلکه اعتماد به نفسم هم بیشتر شده.','کاش وقت بیشتری برای مطالعه داشتم.','با وجود اینکه خسته بودم، تکالیفم را تمام کردم.','چیزی که بیشترین کمک را به من کرد صحبت کردن هر روزه بود.','حتماً کلیدهایش را جا گذاشته، چون نمی‌تواند در را باز کند.','تا پایان سال، بیش از هزار کلمه یاد گرفته‌ام.']
  .forEach((t, i) => out.push(para([run(`${fa(i + 1)}. ${t}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 30 })));
out.push(para([run('Answers: 1) If I had started earlier, I would be fluent now. 2) It is said that this city was built a thousand years ago. 3) I had my hair cut last week. 4) She/He asked me how long I had been learning English. 5) Not only has my English improved, but my confidence has also grown. 6) I wish I had more time to study. 7) Although/Even though I was tired, I finished my homework. 8) What helped me most was speaking every day. 9) He must have left his keys behind, because he can\'t open the door. 10) By the end of the year, I will have learned more than a thousand words.', { ltr: true, size: 18, color: C.grey })], { ltr: true, before: 80 }));
out.push(h2('بخش ب: نوشتن (۴۰ دقیقه)'));
out.push(para([run('Essay (180–220 words): ', { ltr: true, bold: true }), run('"Learning a foreign language is more important today than ever before." Do you agree?', { ltr: true })], { ltr: true }));
out.push(h2('بخش ج: صحبت کردن با Claude (۱۵ دقیقه)'));
['Part 1: سؤال‌های کوتاه دربارهٔ خودت، کار و خانواده (۴ دقیقه)', 'Part 2: ۲ دقیقه صحبت بدون توقف دربارهٔ «A person who has influenced you»', 'Part 3: بحث دربارهٔ موضوعات انتزاعی مرتبط (۵ دقیقه)'].forEach(t => out.push(bullet(t)));
out.push(h2('جدول B2 Can-Do'));
out.push(table([7638, 1000, 1000], ['می‌توانم...', 'بله', 'هنوز نه'], [
  ['۱۰ دقیقه دربارهٔ یک موضوع آشنا بدون مکث طولانی صحبت کنم', '☐', '☐'], ['نظرم را با دلیل و مثال بگویم و از آن دفاع کنم', '☐', '☐'],
  ['ایدهٔ اصلی یک خبر یا پادکست را بدون زیرنویس بفهمم', '☐', '☐'], ['یک essay منسجم ۲۰۰ کلمه‌ای بنویسم', '☐', '☐'],
  ['ایمیل رسمی درست و مؤدبانه بنویسم', '☐', '☐'], ['از شرطی‌ها، مجهول و نقل قول در صحبت استفاده کنم', '☐', '☐'],
  ['بیشتر فیلم‌ها را با زیرنویس انگلیسی دنبال کنم', '☐', '☐'], ['phrasal verbها و idiomهای رایج را بفهمم و به کار ببرم', '☐', '☐'],
], { colOpts: [{}, { center: true }, { center: true }], zebra: true }));

// Appendix 3 — resources
out.push(h1('پیوست ۳ — منابع و ۳ ماه بعد'));
out.push(h2('منابع رایگان پیشنهادی'));
['شنیداری: BBC Learning English (6 Minute English, The English We Speak)، TED، پادکست‌های All Ears English و Luke\'s English Podcast',
 'خواندن: BBC News، BBC Future، The Guardian، Breaking News English (سطح ۴ تا ۶)',
 'گرامر و تمرین: British Council LearnEnglish (B1-B2)، کتاب English Grammar in Use (Murphy)',
 'واژگان: Cambridge Dictionary (تلفظ و مثال)، اپ Anki برای کارت‌ها، English Vocabulary in Use (Upper-Intermediate)',
 'صحبت کردن: تمرین روزانه با Claude، shadowing با TED Talks، ضبط صدای خود'].forEach(t => out.push(bullet(t)));
out.push(h2('بعد از ۹۰ روز'));
['ماه ۴: هر روز ۳۰ دقیقه پادکست یا سریال بدون زیرنویس + ادامهٔ کارت‌ها',
 'ماه ۵: یک رمان سادهٔ انگلیسی (graded reader سطح B2) بخوان و هفته‌ای ۲ essay بنویس.',
 'ماه ۶: اگر هدفت آزمون است (IELTS / B2 First)، یک ماه تمرین تخصصی آزمون؛ وگرنه شروع مسیر C1.'].forEach(t => out.push(bullet(t)));

const doc = new Document({
  creator: 'Claude', title: 'English B1 to B2 — 90-Day Plan',
  styles: {
    default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 300 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 34, bold: true, color: C.primary }, paragraph: { outlineLevel: 0 } },
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
      new TextRun({ text: 'English B1 → B2 — 90-Day Plan — page ', font: FONT, size: 16, color: C.grey }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.grey }),
    ] })] }) },
    children: out,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('wrote', OUT, b.length); });
