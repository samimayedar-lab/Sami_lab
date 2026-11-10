// تولید فایل‌های Word مستندات ISO 9001 – اجرا: node build.js
// برای جایگزینی لوگو، فایل اصلی را با نام logo.png در پوشه بالادست قرار دهید و دوباره اجرا کنید.
const fs = require("fs");
const path = require("path");
const D = require("docx");
const { docs, CO, blank } = require("./content");

const OUT = path.join(__dirname, "..");
const LOGO = fs.readFileSync(path.join(OUT, "logo.png"));
const FONT = "Tahoma";
const RED = "C8102E", DARK = "1E1E1E", GREY = "F2F2F2", BORDER = "8C8C8C";
const DATE = "[تاریخ تصویب]";
const fa = (s) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

const run = (text, o = {}) =>
  new D.TextRun({ text, rightToLeft: true, font: { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT }, size: o.size || 20, sizeComplexScript: o.size || 20, bold: !!o.bold, boldComplexScript: !!o.bold, color: o.color });

// پشتیبانی از **پررنگ**
const runs = (text, o = {}) =>
  String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) =>
    s.startsWith("**") ? run(s.slice(2, -2), { ...o, bold: true }) : run(s, o));

const P = (text, o = {}) =>
  new D.Paragraph({
    bidirectional: true,
    alignment: o.align || D.AlignmentType.BOTH,
    spacing: { before: o.before ?? 60, after: o.after ?? 100, line: o.line || 300 },
    children: runs(text, o),
    ...(o.numbering ? { numbering: o.numbering } : {}),
    ...(o.heading ? { heading: o.heading } : {}),
    ...(o.border ? { border: o.border } : {}),
    keepNext: o.keepNext,
  });

const H1 = (t) => P(t, { heading: D.HeadingLevel.HEADING_1, size: 26, bold: true, color: RED, before: 240, after: 120, align: D.AlignmentType.RIGHT, keepNext: true,
  border: { bottom: { style: D.BorderStyle.SINGLE, size: 6, color: RED, space: 2 } } });
const H3 = (t) => P(t, { heading: D.HeadingLevel.HEADING_2, size: 22, bold: true, color: DARK, before: 160, after: 60, align: D.AlignmentType.RIGHT, keepNext: true });
const bullet = (t) => P(t, { numbering: { reference: "bul", level: 0 }, after: 60 });

const bd = { style: D.BorderStyle.SINGLE, size: 4, color: BORDER };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
const cell = (text, w, o = {}) =>
  new D.TableCell({
    width: { size: w, type: D.WidthType.DXA },
    borders,
    shading: o.fill ? { type: D.ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    verticalAlign: D.VerticalAlign.CENTER,
    columnSpan: o.span,
    rowSpan: o.rowSpan,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: (Array.isArray(text) ? text : [text]).map((t) =>
      t instanceof D.Paragraph ? t :
      P(t, { size: o.size || 18, bold: o.bold, color: o.color, align: o.align || D.AlignmentType.RIGHT, before: 0, after: 0, line: 260 })),
  });

const table = ({ head, rows, w }, o = {}) => {
  const total = w.reduce((a, b) => a + b, 0);
  return new D.Table({
    visuallyRightToLeft: true,
    width: { size: total, type: D.WidthType.DXA },
    columnWidths: w,
    rows: [
      new D.TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, w[i], { fill: DARK, color: "FFFFFF", bold: true, align: D.AlignmentType.CENTER })) }),
      ...rows.map((r, ri) => new D.TableRow({
        height: o.rowHeight ? { value: o.rowHeight, rule: D.HeightRule.ATLEAST } : undefined,
        children: r.map((c, i) => cell(c, w[i], { fill: ri % 2 ? GREY : undefined })),
      })),
    ],
  });
};
const gap = () => P("", { after: 60, before: 0 });

function blocks(list) {
  const out = [];
  for (const b of list) {
    if (typeof b === "string") out.push(P(b));
    else if (b.ul) b.ul.forEach((t) => out.push(bullet(t)));
    else if (b.h3) out.push(H3(b.h3));
    else if (b.table) { out.push(table(b.table)); out.push(gap()); }
  }
  return out;
}

// سربرگ سند
function header(doc, width) {
  const w = [Math.round(width * 0.24), Math.round(width * 0.48)];
  w.push(width - w[0] - w[1]);
  const logo = new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.ImageRun({ type: "png", data: LOGO, transformation: { width: 96, height: 60 } })] });
  const pageP = new D.Paragraph({ bidirectional: true, alignment: D.AlignmentType.RIGHT, children: [run("صفحه: ", { size: 16 }), new D.TextRun({ children: [D.PageNumber.CURRENT], size: 16, font: FONT }), run(" از ", { size: 16 }), new D.TextRun({ children: [D.PageNumber.TOTAL_PAGES], size: 16, font: FONT })] });
  const info = [P(`کد مدرک: ${doc.code}`, { size: 16, before: 0, after: 0, align: D.AlignmentType.RIGHT }), P("شماره ویرایش: ۰۰", { size: 16, before: 0, after: 0, align: D.AlignmentType.RIGHT }), P(`تاریخ: ${DATE}`, { size: 16, before: 0, after: 0, align: D.AlignmentType.RIGHT }), pageP];
  const mid = [P(CO, { size: 22, bold: true, color: RED, align: D.AlignmentType.CENTER, before: 0, after: 40 }), P(doc.title, { size: 20, bold: true, align: D.AlignmentType.CENTER, before: 0, after: 0 }), P("سیستم مدیریت کیفیت ISO 9001:2015", { size: 15, color: "666666", align: D.AlignmentType.CENTER, before: 20, after: 0 })];
  return new D.Header({
    children: [
      new D.Table({
        visuallyRightToLeft: true, width: { size: width, type: D.WidthType.DXA }, columnWidths: w,
        rows: [new D.TableRow({ children: [cell([logo], w[0]), cell(mid, w[1]), cell(info, w[2])] })],
      }),
      P("", { before: 0, after: 0 }),
    ],
  });
}
const footer = () => new D.Footer({ children: [P(`این مدرک متعلق به ${CO} است و هرگونه تکثیر بدون مجوز ممنوع است. نسخه چاپی فاقد مهر «کنترل‌شده» فاقد اعتبار است.`, { size: 14, color: "777777", align: D.AlignmentType.CENTER, border: { top: { style: D.BorderStyle.SINGLE, size: 4, color: RED, space: 2 } } })] });

function approval(width) {
  const c = Math.floor(width / 3), w = [c, c, width - 2 * c];
  return [
    gap(),
    table({ head: ["تهیه‌کننده", "تأییدکننده", "تصویب‌کننده"], w, rows: [["نام: [.....]\nسمت: نماینده مدیریت", "نام: [.....]\nسمت: مدیر واحد مربوط", "نام: [.....]\nسمت: مدیرعامل"].map((s) => s.split("\n")), ["امضا و تاریخ:", "امضا و تاریخ:", "امضا و تاریخ:"]] }, { rowHeight: 700 }),
  ];
}
function revisionTable(width) {
  const w = [1100, 1600, width - 1100 - 1600 - 2200, 2200];
  return [P("سوابق بازنگری مدرک", { bold: true, size: 20, align: D.AlignmentType.RIGHT }), table({ head: ["ویرایش", "تاریخ", "شرح تغییرات", "تصویب‌کننده"], w, rows: [["۰۰", DATE, "صدور اولیه", "مدیرعامل"], ["", "", "", ""]] }), gap()];
}

function formBlocks(f, width) {
  const out = [H1(`${f.code} – ${f.title}`)];
  if (f.top) out.push(table({ head: f.top, w: f.top.map(() => Math.floor(width / f.top.length)), rows: [f.top.map(() => "")] }, { rowHeight: 450 }), gap());
  if (f.fields) {
    out.push(table({ head: ["عنوان", "شرح"], w: [3000, width - 3000], rows: f.fields.map((x) => [x, ""]) }, { rowHeight: 520 }));
  }
  if (f.head) {
    const rows = f.items ? f.items.map((it, i) => [fa(i + 1), it, ...Array(f.head.length - 2).fill("")]) : blank(f.rows, f.head.length).map((r, i) => (r[0] = fa(i + 1), r));
    const scale = width / f.w.reduce((a, b) => a + b, 0);
    const w = f.w.map((x) => Math.floor(x * scale)); w[w.length - 1] += width - w.reduce((a, b) => a + b, 0);
    out.push(table({ head: f.head, w, rows }, { rowHeight: 420 }));
  }
  if (f.after) { out.push(gap()); f.after.forEach((t) => out.push(P(t, { align: D.AlignmentType.RIGHT }))); }
  out.push(gap(), P(`کد فرم: ${f.code}   |   ویرایش: ۰۰`, { size: 14, color: "777777", align: D.AlignmentType.LEFT }));
  return out;
}

async function build(doc) {
  const land = !!doc.landscape;
  const pageW = land ? 16838 : 11906, margin = 1000;
  const width = pageW - 2 * margin;
  const children = [];
  // جداول محتوا با عرض متن پرتره طراحی شده‌اند؛ برای افقی مقیاس می‌دهیم
  const scaleTables = (list) => list.map((b) => {
    if (b.table) {
      const s = width / b.table.w.reduce((a, c) => a + c, 0);
      const w = b.table.w.map((x) => Math.floor(x * s)); w[w.length - 1] += width - w.reduce((a, c) => a + c, 0);
      return { table: { ...b.table, w } };
    }
    return b;
  });
  if (!doc.forms) children.push(...revisionTable(width));
  for (const s of doc.sections) { children.push(H1(s.h)); children.push(...blocks(scaleTables(s.blocks))); }
  if (doc.forms) doc.forms.forEach((f, i) => { if (i) children.push(new D.Paragraph({ children: [new D.PageBreak()] })); children.push(...formBlocks(f, width)); });
  if (!doc.noApproval) children.push(...approval(width));

  const d = new D.Document({
    creator: CO, title: doc.title,
    styles: {
      default: { document: { run: { font: FONT, size: 20 }, paragraph: { bidirectional: true } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 26, bold: true, color: RED }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 22, bold: true, color: DARK }, paragraph: { spacing: { before: 160, after: 60 }, keepNext: true, outlineLevel: 1 } },
      ],
    },
    numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: D.LevelFormat.BULLET, text: "●", alignment: D.AlignmentType.RIGHT, style: { paragraph: { indent: { left: 500, hanging: 300 } }, run: { color: RED, size: 14 } } }] }] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838, orientation: land ? D.PageOrientation.LANDSCAPE : D.PageOrientation.PORTRAIT }, margin: { top: 2300, bottom: 1100, left: margin, right: margin, header: 500, footer: 400 } } },
      headers: { default: header(doc, width) },
      footers: { default: footer() },
      children,
    }],
  });
  const file = path.join(OUT, doc.file + ".docx");
  fs.writeFileSync(file, await D.Packer.toBuffer(d));
  return file;
}

(async () => {
  for (const doc of docs) console.log(path.basename(await build(doc)));
})();
