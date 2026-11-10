// رسم چارت سازمانی و نقشه فرایندها به صورت PNG — اجرا: node diagrams.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RED = "#C8102E", DARK = "#1E1E1E", LIGHT = "#F3F3F3", MID = "#6B6B6B";
const fontB64 = (f) => fs.readFileSync(path.join(__dirname, "fonts", f)).toString("base64");
const CSS = `@font-face{font-family:V;src:url(data:font/woff2;base64,${fontB64("Vazirmatn-NL-Regular.woff2")});font-weight:400}
@font-face{font-family:V;src:url(data:font/woff2;base64,${fontB64("Vazirmatn-NL-Bold.woff2")});font-weight:700}
text{font-family:V;direction:rtl;unicode-bidi:plaintext}`;

// جعبه با متن چندخطی (جداکننده |)
function box(cx, cy, w, h, label, o = {}) {
  const lines = label.split("|");
  const fs_ = o.fs || 17, lh = fs_ * 1.35;
  const y0 = cy - ((lines.length - 1) * lh) / 2 + fs_ * 0.35;
  const shape = o.chevron
    ? `<polygon points="${cx + w / 2},${cy - h / 2} ${cx - w / 2 + 18},${cy - h / 2} ${cx - w / 2},${cy} ${cx - w / 2 + 18},${cy + h / 2} ${cx + w / 2},${cy + h / 2} ${cx + w / 2 - 18},${cy}" fill="${o.fill || "#fff"}" stroke="${o.stroke || DARK}" stroke-width="${o.sw || 2}"/>`
    : `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="${o.fill || "#fff"}" stroke="${o.stroke || DARK}" stroke-width="${o.sw || 2}" ${o.dash ? 'stroke-dasharray="8 5"' : ""}/>`;
  const bar = o.bar ? `<rect x="${cx + w / 2 - 6}" y="${cy - h / 2}" width="6" height="${h}" fill="${o.bar}"/>` : "";
  const t = lines.map((l, i) => `<text x="${cx}" y="${y0 + i * lh}" text-anchor="middle" font-size="${fs_}" font-weight="${o.bold ? 700 : 400}" fill="${o.color || DARK}">${l}</text>`).join("");
  return shape + bar + t;
}
const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || MID}" stroke-width="${o.w || 2.5}" ${o.dash ? 'stroke-dasharray="8 6"' : ""} ${o.arrow ? 'marker-end="url(#ar)"' : ""}/>`;
const defs = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${MID}"/></marker></defs>`;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${CSS}</style>${defs}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;

/* ---------------- چارت سازمانی ---------------- */
const DEPTS = [
  ["مدیر بازرگانی خارجی", ["کارشناس خرید خارجی|و قراردادها"]],
  ["مدیر واردات و ترخیص", ["کارشناس ثبت سفارش", "کارشناس ترخیص|و حمل"]],
  ["مدیر فروش و بازاریابی", ["کارشناسان فروش", "کارشناس بازاریابی", "کارشناس امور مشتریان"]],
  ["مدیر خدمات پس از فروش", ["سرپرست فنی و گارانتی", "تکنسین‌های PDI", "کارشناس قطعات", "مسئول انبار و لجستیک"]],
  ["مدیر مالی", ["کارشناس حسابداری|و ارز"]],
  ["مدیر اداری و|منابع انسانی", ["کارشناس منابع انسانی|و آموزش", "کارشناس فناوری|اطلاعات"]],
];
function orgChart() {
  const W = 1800, H = 1020, C = W / 2;
  let b = `<text x="${C}" y="42" text-anchor="middle" font-size="30" font-weight="700" fill="${RED}">چارت سازمانی شرکت کالا تجارت روزبه</text>`;
  b += line(C, 110, C, 410);
  b += box(C, 95, 300, 56, "مجمع عمومی / هیئت‌مدیره", { fill: DARK, color: "#fff", bold: true, fs: 19 });
  b += box(C, 190, 280, 64, "مدیرعامل", { fill: RED, stroke: RED, color: "#fff", bold: true, fs: 22 });
  // ستادی
  b += line(C - 330, 290, C + 330, 290);
  b += box(C + 470, 290, 290, 64, "نماینده مدیریت در|سیستم کیفیت (QMR)", { stroke: RED, dash: true, bold: true });
  b += box(C - 470, 290, 290, 64, "مشاور حقوقی و گمرکی|(برون‌سپاری)", { stroke: MID, dash: true });
  b += `<text x="${C + 470}" y="345" text-anchor="middle" font-size="14" fill="${MID}">واحد ستادی</text><text x="${C - 470}" y="345" text-anchor="middle" font-size="14" fill="${MID}">واحد ستادی</text>`;
  // صف
  const n = DEPTS.length, cw = W / n, top = 410, my = 470;
  const xs = DEPTS.map((_, i) => W - cw / 2 - i * cw);
  b += line(xs[n - 1], top, xs[0], top);
  DEPTS.forEach(([m, subs], i) => {
    const x = xs[i];
    b += line(x, top, x, my - 34);
    b += box(x, my, 262, 68, m, { fill: DARK, stroke: DARK, color: "#fff", bold: true, fs: 17 });
    const spine = x + 112, bw = 214;
    let y = my + 34 + 62;
    b += line(spine, my + 34, spine, my + 34 + 62 + (subs.length - 1) * 88);
    subs.forEach((s) => {
      b += line(spine, y, x + 4 + bw / 2 - 20, y);
      b += box(x - 16, y, bw, 66, s, { fill: LIGHT, stroke: "#BDBDBD", bar: RED, fs: 16 });
      y += 88;
    });
  });
  // راهنما
  const ly = H - 40;
  b += box(W - 140, ly, 30, 22, "", { fill: DARK, rx: 3 }) + `<text x="${W - 165}" y="${ly + 6}" font-size="15" fill="${DARK}" text-anchor="start">مدیران صف</text>`;
  b += box(W - 340, ly, 30, 22, "", { stroke: RED, dash: true, rx: 3 }) + `<text x="${W - 365}" y="${ly + 6}" font-size="15" fill="${DARK}" text-anchor="start">واحد ستادی</text>`;
  b += box(W - 540, ly, 30, 22, "", { fill: LIGHT, stroke: "#BDBDBD", bar: RED, rx: 3 }) + `<text x="${W - 565}" y="${ly + 6}" font-size="15" fill="${DARK}" text-anchor="start">کارشناسان و سرپرستان</text>`;
  b += `<text x="40" y="${ly + 6}" font-size="14" fill="${MID}" text-anchor="end">کد مدرک: ORG-01 | ویرایش ۰۰</text>`;
  return svg(W, H, b);
}

/* ---------------- نقشه فرایندها ---------------- */
const MGMT = ["M1|برنامه‌ریزی استراتژیک", "M2|مدیریت ریسک|و فرصت", "M3|پایش و اندازه‌گیری|شاخص‌ها", "M4|ممیزی داخلی", "M5|بازنگری مدیریت", "M6|بهبود و|اقدام اصلاحی"];
const CORE = ["C1|بازاریابی و فروش", "C2|خرید خارجی|و قرارداد|با سازنده", "C3|ثبت سفارش و|تأمین ارز", "C4|حمل بین‌المللی|و بیمه", "C5|ترخیص گمرکی|و استاندارد", "C6|انبارش و PDI", "C7|شماره‌گذاری|و تحویل", "C8|خدمات|پس از فروش|و گارانتی"];
const SUP = ["S1|منابع انسانی|و آموزش", "S2|مالی و ارز", "S3|فناوری اطلاعات", "S4|کنترل مدارک|و سوابق", "S5|نگهداری زیرساخت|و تجهیزات", "S6|ارزیابی|تأمین‌کنندگان", "S7|امور حقوقی|و قراردادها"];
function band(items, x0, x1, cy, h, o) {
  const n = items.length, gap = 14, w = (x1 - x0 - gap * (n - 1)) / n;
  let s = "";
  items.forEach((t, i) => {
    const cx = x1 - w / 2 - i * (w + gap);
    const [code, ...rest] = t.split("|");
    s += box(cx, cy, w, h, rest.join("|"), { ...o, fs: o.fs || 16 });
    s += `<text x="${cx + w / 2 - (o.chevron ? 40 : 22)}" y="${cy - h / 2 + 22}" font-size="14" font-weight="700" fill="${o.codeColor || RED}" text-anchor="middle">${code}</text>`;
  });
  return s;
}
function processMap() {
  const W = 1800, H = 970;
  const L = 200, R = 1600;
  let b = `<text x="${W / 2}" y="44" text-anchor="middle" font-size="30" font-weight="700" fill="${RED}">نقشه فرایندهای سیستم مدیریت کیفیت – شرکت کالا تجارت روزبه</text><g transform="translate(0,-110)">`;
  // ستون ورودی و خروجی
  b += box(1700, 560, 170, 720, "الزامات|و نیازهای|مشتریان|و طرف‌های|ذینفع||(قوانین واردات،|استانداردهای|اجباری، سازندگان)", { fill: DARK, color: "#fff", bold: true, fs: 18 });
  b += box(100, 560, 170, 720, "رضایت|مشتریان|و طرف‌های|ذینفع||خودروی سالم،|منطبق و تحویل|به‌موقع + خدمات|مطمئن", { fill: RED, stroke: RED, color: "#fff", bold: true, fs: 18 });
  // باندها
  const bandBox = (y, h, title, fill) => `<rect x="${L}" y="${y}" width="${R - L}" height="${h}" rx="12" fill="${fill}" stroke="#D0D0D0"/><text x="${R - 18}" y="${y + 30}" text-anchor="start" font-size="20" font-weight="700" fill="${DARK}">${title}</text>`;
  b += bandBox(200, 180, "فرایندهای مدیریتی", "#F7F7F7");
  b += band(MGMT, L + 20, R - 20, 310, 100, { fill: "#fff", stroke: DARK });
  b += bandBox(420, 280, "فرایندهای اصلی (زنجیره ارزش)", "#FDF0F1");
  b += band(CORE, L + 20, R - 20, 575, 150, { fill: "#fff", stroke: RED, sw: 2.5, chevron: true, fs: 16 });
  b += bandBox(740, 180, "فرایندهای پشتیبان", "#F7F7F7");
  b += band(SUP, L + 20, R - 20, 850, 100, { fill: "#fff", stroke: MID });
  // پیکان‌ها
  b += line(1615, 575, R - 22, 575, { arrow: true, w: 3 });
  b += line(L + 22, 575, 187, 575, { arrow: true, w: 3 });
  b += line(W / 2, 382, W / 2, 418, { arrow: true }) + line(W / 2 + 40, 418, W / 2 + 40, 382, { arrow: true });
  b += line(W / 2, 740, W / 2, 704, { arrow: true }) + line(W / 2 + 40, 704, W / 2 + 40, 740, { arrow: true });
  // حلقه بازخورد
  b += `<path d="M100 925 L100 990 L1700 990 L1700 925" fill="none" stroke="${MID}" stroke-width="2.5" stroke-dasharray="9 6" marker-end="url(#ar)"/>`;
  b += `<rect x="560" y="972" width="680" height="36" fill="#fff"/><text x="${W / 2}" y="997" text-anchor="middle" font-size="18" fill="${DARK}">بازخورد مشتری، شکایات، نظرسنجی و نتایج پایش ← بهبود مستمر (PDCA)</text>`;
  b += `</g>`;
  b += `<text x="40" y="${H - 18}" font-size="14" fill="${MID}" text-anchor="end">کد مدرک: PM-01 | ویرایش ۰۰ | جهت جریان: از راست به چپ</text>`;
  return svg(W, H, b);
}

/* ---------------- گانت برنامه ۵ ساله ---------------- */
// [عنوان، نیم‌سال شروع، نیم‌سال پایان] — نیم‌سال ۱ = نیمه اول ۱۴۰۶ ... ۱۰ = نیمه دوم ۱۴۱۰
const GANTT = [
  ["الف) احداث کارخانه مونتاژ", null, null, "#C8102E"],
  ["امکان‌سنجی فنی، اقتصادی و بازار", 1, 1],
  ["انتخاب شریک خارجی و قرارداد انتقال فناوری", 1, 2],
  ["زمین، پروانه تأسیس و مجوز محیط زیست", 2, 3],
  ["تأمین مالی (آورده، تسهیلات، صندوق توسعه)", 2, 4],
  ["طراحی مهندسی و جانمایی خطوط", 3, 4],
  ["احداث سوله‌ها و زیرساخت", 4, 6],
  ["خرید، حمل و نصب تجهیزات", 6, 7],
  ["جذب و آموزش نیروی تولید", 6, 8],
  ["تولید آزمایشی، پروانه بهره‌برداری، استاندارد", 7, 8],
  ["تولید انبوه SKD", 8, 10],
  ["داخلی‌سازی قطعات و مونتاژ CKD", 9, 10],
  ["ب) توسعه صادرات", null, null, "#1F6FB2"],
  ["ایجاد واحد صادرات و مطالعه بازارهای هدف", 1, 2],
  ["صادرات کالاهای غیرخودرویی (ارزآوری)", 2, 10],
  ["صادرات قطعات و خدمات فنی", 6, 10],
  ["صادرات خودروی مونتاژی به کشورهای همسایه", 9, 10],
  ["ج) واردات در قبال صادرات", null, null, "#2E8B57"],
  ["تطبیق سازوکار با مقررات ارزی و تجاری", 1, 1],
  ["واردات با ارز صادرات اشخاص ثالث", 1, 4],
  ["واردات با ارز حاصل از صادرات خود شرکت", 3, 10],
  ["واردات قطعات CKD و ماشین‌آلات در قبال صادرات", 6, 10],
  ["رفع تعهد ارزی و تطبیق کوتاژها (مستمر)", 1, 10],
  ["د) توسعه سازمانی", null, null, "#6B6B6B"],
  ["اخذ گواهی ISO 9001", 1, 2],
  ["استقرار ERP و CRM", 2, 4],
  ["استانداردهای ISO 14001، ISO 45001 و IATF 16949 برای کارخانه", 7, 10],
];
function gantt() {
  const W = 1800, rowH = 34, top = 130, nameW = 520, R = W - 20, L = 30;
  const tlR = R - nameW, hw = (tlR - L) / 10;
  const H = top + GANTT.length * rowH + 60;
  let b = `<text x="${W / 2}" y="44" text-anchor="middle" font-size="30" font-weight="700" fill="${RED}">برنامه عملیاتی پنج‌ساله (۱۴۰۶ تا ۱۴۱۰) – شرکت کالا تجارت روزبه</text>`;
  const yrs = ["۱۴۰۶", "۱۴۰۷", "۱۴۰۸", "۱۴۰۹", "۱۴۱۰"];
  yrs.forEach((y, i) => {
    const x1 = tlR - i * 2 * hw;
    b += `<rect x="${x1 - 2 * hw}" y="70" width="${2 * hw}" height="30" fill="${i % 2 ? "#444" : DARK}"/><text x="${x1 - hw}" y="91" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">${y}</text>`;
    ["نیمه اول", "نیمه دوم"].forEach((h, j) => { b += `<rect x="${x1 - (j + 1) * hw}" y="100" width="${hw}" height="26" fill="#EEE" stroke="#fff"/><text x="${x1 - (j + 0.5) * hw}" y="118" text-anchor="middle" font-size="13" fill="${DARK}">${h}</text>`; });
  });
  b += `<rect x="${tlR}" y="70" width="${nameW}" height="56" fill="${RED}"/><text x="${R - 14}" y="104" text-anchor="start" font-size="18" font-weight="700" fill="#fff">فعالیت / پروژه</text>`;
  let color = RED;
  GANTT.forEach(([name, s, e, c], i) => {
    const y = top + i * rowH;
    if (c) { color = c; b += `<rect x="${L}" y="${y}" width="${R - L}" height="${rowH}" fill="#F6F6F6"/><text x="${R - 14}" y="${y + 23}" text-anchor="start" font-size="17" font-weight="700" fill="${c}">${name}</text>`; return; }
    if (i % 2) b += `<rect x="${L}" y="${y}" width="${R - L}" height="${rowH}" fill="#FCFCFC"/>`;
    b += `<text x="${R - 28}" y="${y + 23}" text-anchor="start" font-size="15" fill="${DARK}">${name}</text>`;
    const x1 = tlR - (s - 1) * hw, x0 = tlR - e * hw;
    b += `<rect x="${x0 + 4}" y="${y + 8}" width="${x1 - x0 - 8}" height="${rowH - 16}" rx="5" fill="${color}"/>`;
  });
  for (let k = 0; k <= 10; k++) b += line(tlR - k * hw, 100, tlR - k * hw, top + GANTT.length * rowH, { c: k % 2 ? "#E2E2E2" : "#BDBDBD", w: 1 });
  b += line(L, top + GANTT.length * rowH, R, top + GANTT.length * rowH, { c: "#BDBDBD", w: 1 });
  b += `<text x="40" y="${H - 18}" font-size="14" fill="${MID}" text-anchor="end">کد مدرک: OP-01 | ویرایش ۰۰ | جهت زمان: از راست به چپ</text>`;
  return svg(W, H, b);
}

(async () => {
  const br = await chromium.launch();
  const page = await br.newPage({ deviceScaleFactor: 2 });
  for (const [name, s] of [["orgchart", orgChart()], ["processmap", processMap()], ["gantt", gantt()]]) {
    fs.writeFileSync(path.join(__dirname, name + ".svg"), s);
    await page.setContent(`<html><body style="margin:0">${s}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("svg").screenshot({ path: path.join(__dirname, name + ".png") });
    console.log(name + ".png");
  }
  await br.close();
})();
