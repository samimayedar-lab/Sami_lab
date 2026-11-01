const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, PageBreak, BorderStyle, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require('docx');
const units = require('./biz_data.js');

const OUT = process.argv[2] || 'biz.docx';
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


C.primary = '7A4A12'; C.accent = '1F4E79'; C.head = 'F3E3C9'; C.line = 'D9C2A0'; C.soft = 'FBF3E4'; C.soft2 = 'EAF1F8';
const en = (o = {}) => ({ ltr: true, size: 22, ...o });
const enB = (o = {}) => ({ ltr: true, size: 22, bold: true, color: C.primary, ...o });
const sp = (s) => { const [a, b, c] = s.split('|'); return { a, b, c }; };
function blankWord(word, ex) {
  const head = word.split('/')[0].replace(/\(.*?\)/g, '').trim();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let m = ex.match(new RegExp('\\b' + esc(head) + '\\w*', 'i'));
  if (!m && !head.includes(' ')) { const st = head.slice(0, Math.max(4, head.length - 2)); m = ex.match(new RegExp('\\b' + esc(st) + '\\w*', 'i')); }
  if (!m) return null;
  return { q: ex.slice(0, m.index) + '________' + ex.slice(m.index + m[0].length), a: m[0] };
}
const out = [];
out.push(para('', { before: 1800 }));
out.push(para([run('Business English for Traders', { ltr: true, size: 56, bold: true, color: C.primary })], { center: true, ltr: true }));
out.push(para([run('انگلیسی تجاری برای تاجرها — با ترجمهٔ فارسی', { size: 38, bold: true, color: C.accent })], { center: true, after: 200 }));
out.push(para([run(`${fa(units.length)} درس • ${fa(units.length * 20)} واژه و اصطلاح تجاری • ${fa(units.length * 6)} جملهٔ آماده • ${fa(units.length)} گفتگوی واقعی`, { size: 24, color: C.grey })], { center: true, after: 600 }));
out.push(para([run('Buy • Sell • Negotiate • Ship • Get Paid', { ltr: true, size: 30, bold: true, color: C.gold })], { center: true, ltr: true }));

out.push(h1('راهنمای استفاده'));
out.push(para('این کتابچه مخصوص کسی است که با تاجرها سروکار دارد و می‌خواهد انگلیسی تجاری را راحت و روان صحبت کند. همهٔ واژه‌ها، جمله‌ها و گفتگوها ترجمهٔ فارسی دارند. می‌توانی آن را کنار کتاب Business Vocabulary in Use بخوانی یا به‌تنهایی.'));
out.push(h2('هر درس چه دارد؟'));
['۲۰ واژه یا اصطلاح تجاری با ترجمه و یک جملهٔ مثال', '۶ جملهٔ آماده که می‌توانی مستقیم در کارت به کار ببری', 'یک گفتگوی واقعی (مذاکره، تماس، سفارش و...) با ترجمه', 'تمرین جای خالی با پاسخ‌نامه، تمرین ترجمه و یک نقش‌آفرینی با Claude'].forEach(t => out.push(bullet(t)));
out.push(h2('برنامهٔ پیشنهادی (ساعت سوم، یعنی ساعت کار)'));
out.push(table([2200, 7438], ['زمان', 'چه کار کنم؟'], [
  ['روز ۱ هر درس', 'واژه‌ها: بلند بخوان، تلفظ را در Cambridge Dictionary گوش کن و کارت بساز.'],
  ['روز ۲', 'جمله‌های آماده و گفتگو: بلند تکرار کن (shadowing) تا از حفظ شوند.'],
  ['روز ۳', 'تمرین‌ها + نقش‌آفرینی با Claude + یک پیام یا ایمیل کوتاه دربارهٔ همان موضوع'],
], { colOpts: [{ center: true, bold: true, color: C.primary }, {}], zebra: true }));
out.push(para('هر درس حدود ۳ روز (هر روز ۶۰ دقیقه) طول می‌کشد، یعنی کل کتابچه در ۵ تا ۶ هفته تمام می‌شود. بعد از آن، کتابچه را یک بار دیگر از اول مرور کن و فقط روی صحبت کردن تمرکز کن.', { fill: C.soft, before: 80 }));
out.push(h2('فهرست درس‌ها'));
out.push(table([900, 4500, 4238], ['#', 'English', 'فارسی'], units.map((u, i) => [fa(i + 1), u.t, u.fa]), { colOpts: [{ center: true, bold: true }, en({ bold: true, color: C.primary }), {}], zebra: true }));

units.forEach((u, i) => {
  out.push(para([run(`درس ${fa(i + 1)} — `, { size: 34, bold: true, color: C.primary }), run(u.t, { ltr: true, size: 34, bold: true, color: C.primary })], { heading: HeadingLevel.HEADING_1, pageBreak: true, rule: true, after: 60, keepNext: true }));
  out.push(para([run(u.fa, { size: 26, bold: true, color: C.accent })], { after: 120 }));
  out.push(para(u.intro, { fill: C.soft }));
  out.push(h2('۱. واژه‌ها و اصطلاحات'));
  out.push(table([500, 2500, 2300, 4338], ['#', 'English', 'فارسی', 'Example'], u.w.map((x, j) => { const p = sp(x); return [fa(j + 1), p.a, p.b, p.c]; }),
    { colOpts: [{ center: true, color: C.grey }, enB(), {}, en({ size: 20, italic: true })], zebra: true }));
  out.push(h2('۲. جمله‌های آماده'));
  out.push(table([500, 5000, 4138], ['#', 'English', 'فارسی'], u.p.map((x, j) => { const p = sp(x); return [fa(j + 1), p.a, p.b]; }),
    { colOpts: [{ center: true, color: C.grey }, enB(), {}], zebra: true }));
  out.push(h2('۳. گفتگو'));
  out.push(table([5200, 4438], ['English', 'فارسی'], u.d.map(x => { const p = sp(x); return [p.a, p.b]; }),
    { colOpts: [en(), { color: C.grey }], zebra: true }));
  out.push(h2('۴. تمرین‌ها'));
  const bl = u.w.map(x => { const p = sp(x); return blankWord(p.a, p.c); }).filter(Boolean).slice(0, 8);
  out.push(para([run('الف) جای خالی را با واژه‌های این درس پر کن:', { bold: true })]));
  bl.forEach((b, j) => out.push(para([run(`${j + 1}. ${b.q}`, { ltr: true })], { ltr: true, after: 30 })));
  out.push(para([run('Answers: ' + bl.map((b, j) => `${j + 1}) ${b.a}`).join('   '), { ltr: true, size: 18, color: C.grey })], { ltr: true }));
  out.push(para([run('ب) به انگلیسی بگو و بنویس ', { bold: true }), run('(جواب‌ها در جدول جمله‌های آماده است):', { color: C.grey })], { before: 120 }));
  u.p.forEach((x, j) => out.push(para([run(`${fa(j + 1)}. ${sp(x).b}`), run('   ……………………………………………', { color: 'AAAAAA' })], { after: 30 })));
  out.push(para([run('ج) نقش‌آفرینی و نوشتن: ', { bold: true, color: C.accent }), run(u.task)], { before: 120, fill: C.soft2 }));
  out.push(h2('✔ چک‌لیست'));
  ['۲۰ واژه را بلدم و کارتشان را ساخته‌ام', 'جمله‌های آماده را از حفظ می‌گویم', 'گفتگو را بلند و روان می‌خوانم', 'تمرین‌ها و نقش‌آفرینی را انجام داده‌ام'].forEach(t => out.push(check(t)));
});

out.push(h1('واژه‌نامهٔ کامل (الفبایی)'));
const all = [];
units.forEach((u, i) => u.w.forEach(x => { const p = sp(x); all.push([p.a, p.b, fa(i + 1)]); }));
all.sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));
out.push(table([4200, 4238, 1200], ['English', 'فارسی', 'درس'], all, { colOpts: [enB({ size: 20 }), { size: 20 }, { center: true, size: 20 }], zebra: true }));

const doc = new Document({
  creator: 'Claude', title: 'Business English for Traders',
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
      new TextRun({ text: 'Business English for Traders — page ', font: FONT, size: 16, color: C.grey }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.grey }),
    ] })] }) },
    children: out,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('wrote', OUT, b.length); });
