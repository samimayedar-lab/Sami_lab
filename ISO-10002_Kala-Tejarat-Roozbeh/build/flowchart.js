// فلوچارت فرایند رسیدگی به شکایات و چرخه رضایت مشتری — اجرا: node flowchart.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const FONTS = path.join(__dirname, "../../ISO-9001_Kala-Tejarat-Roozbeh/build/fonts");
const b64 = (f) => fs.readFileSync(path.join(FONTS, f)).toString("base64");
const CSS = `@font-face{font-family:V;src:url(data:font/woff2;base64,${b64("Vazirmatn-NL-Regular.woff2")});font-weight:400}
@font-face{font-family:V;src:url(data:font/woff2;base64,${b64("Vazirmatn-NL-Bold.woff2")});font-weight:700}
text{font-family:V;direction:rtl;unicode-bidi:plaintext}`;
const RED = "#C8102E", DARK = "#1E1E1E", MID = "#6B6B6B", LIGHT = "#F3F3F3";

const txt = (cx, cy, label, o = {}) => {
  const lines = label.split("|"), fs_ = o.fs || 19, lh = fs_ * 1.35;
  const y0 = cy - ((lines.length - 1) * lh) / 2 + fs_ * 0.35;
  return lines.map((l, i) => `<text x="${cx}" y="${y0 + i * lh}" text-anchor="middle" font-size="${fs_}" font-weight="${o.bold ? 700 : 400}" fill="${o.color || DARK}">${l}</text>`).join("");
};
const rect = (cx, cy, w, h, label, o = {}) => `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${o.rx ?? 10}" fill="${o.fill || "#fff"}" stroke="${o.stroke || DARK}" stroke-width="2.5"/>` + (o.n ? `<circle cx="${cx + w / 2}" cy="${cy - h / 2}" r="17" fill="${RED}"/><text x="${cx + w / 2}" y="${cy - h / 2 + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${o.n}</text>` : "") + txt(cx, cy, label, o);
const diamond = (cx, cy, w, h, label) => `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="#FFF4E5" stroke="#E07B00" stroke-width="2.5"/>` + txt(cx, cy, label, { fs: 17, bold: true });
const term = (cx, cy, w, h, label, fill) => `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>` + txt(cx, cy, label, { color: "#fff", bold: true });
const arrow = (pts, label, lx, ly) => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${MID}" stroke-width="2.5" marker-end="url(#ar)"/>` + (label ? `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="16" font-weight="700" fill="${label === "خیر" ? RED : "#2E7D32"}">${label}</text>` : "");

function flow() {
  const W = 1500, X = 860, SX = 300, BW = 520, BH = 84, G = 128;
  let y = 120, b = `<text x="${W / 2}" y="54" text-anchor="middle" font-size="32" font-weight="700" fill="${RED}">فلوچارت فرایند رسیدگی به شکایات مشتریان – کالا تجارت روزبه</text>`;
  const ys = {};
  const step = (k, el) => { ys[k] = y; b += el(y); y += G; };
  step("s", (y) => term(X, y, 420, 64, "شروع: دریافت شکایت", DARK));
  step("1", (y) => rect(X, y, BW, BH, "دریافت از کانال‌ها|(تلفن، حضوری، وب‌سایت، پیام‌رسان، ایمیل، مراجع بیرونی)", { n: "۱", fs: 17 }));
  step("2", (y) => rect(X, y, BW, BH, "ثبت در سامانه (CF-02) و|تخصیص کد رهگیری", { n: "۲" }));
  step("3", (y) => rect(X, y, BW, BH, "اعلام وصول به شاکی (CF-03)|حداکثر ۱ روز کاری", { n: "۳" }));
  step("d1", (y) => diamond(X, y, 420, 118, "در دامنه و|قابل پذیرش است؟"));
  step("4", (y) => rect(X, y, BW, BH, "ارزیابی اولیه (CF-04): دسته‌بندی و|تعیین اولویت الف / ب / ج", { n: "۴" }));
  step("5", (y) => rect(X, y, BW, BH, "بررسی و تحقیق توسط واحد مسئول|(فوری‌ها: حداکثر ۲۴ ساعت)", { n: "۵" }));
  step("6", (y) => rect(X, y, BW, BH, "تعیین راه‌حل: اصلاح، جبران،|توضیح یا رد مستدل", { n: "۶" }));
  step("7", (y) => rect(X, y, BW, BH, "اعلام تصمیم به شاکی (CF-05)|حداکثر ۷ روز کاری", { n: "۷" }));
  step("d2", (y) => diamond(X, y, 420, 118, "شاکی تصمیم را|پذیرفت؟"));
  step("8", (y) => rect(X, y, BW, BH, "اجرای تصمیم و بستن پرونده", { n: "۸" }));
  step("9", (y) => rect(X, y, BW, BH, "نظرسنجی رضایت از رسیدگی (CF-08)", { n: "۹" }));
  step("10", (y) => rect(X, y, BW, BH, "تحلیل ماهانه، اقدام اصلاحی و بهبود|(CF-10 و PR-04)", { n: "۱۰" }));
  step("e", (y) => term(X, y, 420, 64, "پایان", RED));
  // جریان اصلی
  const order = ["s", "1", "2", "3", "d1", "4", "5", "6", "7", "d2", "8", "9", "10", "e"];
  const half = (k) => (k.startsWith("d") ? 59 : k === "s" || k === "e" ? 32 : BH / 2);
  for (let i = 0; i < order.length - 1; i++) {
    const a = order[i], c = order[i + 1];
    b += arrow([[X, ys[a] + half(a)], [X, ys[c] - half(c) - 2]], a.startsWith("d") ? "بله" : "", X + 30, ys[a] + half(a) + 26);
  }
  // شاخه عدم پذیرش
  b += rect(SX, ys.d1, 400, 96, "توضیح دلیل به شاکی و|راهنمایی به مرجع صالح", { fill: LIGHT });
  b += arrow([[X - 210, ys.d1], [SX + 202, ys.d1]], "خیر", X - 250, ys.d1 - 12);
  b += arrow([[SX, ys.d1 + 48], [SX, ys["4"] + 20 - 32 - 2]]);
  b += term(SX, ys["4"] + 20, 380, 64, "ثبت در CF-02 و بستن پرونده", MID);
  // شاخه عدم پذیرش تصمیم
  b += rect(SX, ys.d2, 400, 104, "تشدید به کمیته رسیدگی (CF-06)|و بازنگری تصمیم", { fill: "#FDECEE", stroke: RED });
  b += arrow([[X - 210, ys.d2], [SX + 202, ys.d2]], "خیر", X - 250, ys.d2 - 12);
  b += rect(SX, ys.d2 + 150, 400, 96, "در صورت عدم توافق: ارجاع به|حل اختلاف بیرونی (CF-07)", { fill: LIGHT });
  b += arrow([[SX, ys.d2 + 52], [SX, ys.d2 + 100]]);
  b += arrow([[SX + 200, ys.d2 - 20], [SX + 250, ys.d2 - 20], [SX + 250, ys["7"]], [X - BW / 2 - 2, ys["7"]]]);
  b += `<text x="${SX + 268}" y="${(ys.d2 + ys["7"]) / 2 - 10}" font-size="15" fill="${MID}" text-anchor="start">تصمیم بازنگری‌شده</text>`;
  // نوار اولویت
  const py = y - 20;
  b += `<rect x="60" y="${py}" width="${W - 120}" height="120" rx="12" fill="${LIGHT}"/>`;
  b += `<text x="${W - 90}" y="${py + 38}" font-size="20" font-weight="700" fill="${DARK}" text-anchor="start">مهلت‌ها بر اساس اولویت:</text>`;
  [["الف – فوری (ایمنی خودرو، جانبازان، ارجاع مراجع قانونی)", "بررسی ۲۴ ساعت | پاسخ ۳ روز کاری", RED], ["ب – مهم (تأخیر تحویل، نقص فنی، گارانتی)", "پاسخ ۵ روز کاری", "#E07B00"], ["ج – عادی (سایر موارد)", "پاسخ ۷ روز کاری", "#2E7D32"]].forEach(([t, d, c], i) => {
    const x = W - 90 - i * 450;
    b += `<rect x="${x - 16}" y="${py + 58}" width="16" height="16" fill="${c}"/><text x="${x - 26}" y="${py + 72}" font-size="15" font-weight="700" fill="${DARK}" text-anchor="start">${t}</text><text x="${x - 26}" y="${py + 98}" font-size="15" fill="${MID}" text-anchor="start">${d}</text>`;
  });
  const H = py + 150;
  b += `<text x="60" y="${H - 14}" font-size="14" fill="${MID}" text-anchor="end">کد مدرک: CH-03 | ویرایش ۰۰</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${CSS}</style><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${MID}"/></marker></defs><rect width="${W}" height="${H}" fill="#fff"/>${b}</svg>`;
}

// چرخه رضایت مشتری
function cycle() {
  const W = 1500, H = 900, cx = 750, cy = 470, R = 300;
  let b = `<text x="${W / 2}" y="54" text-anchor="middle" font-size="32" font-weight="700" fill="${RED}">چرخه مدیریت رضایت مشتری و رسیدگی به شکایات</text>`;
  const items = [["۱. شنیدن صدای مشتری", "نظرسنجی، شکایت، پیشنهاد"], ["۲. ثبت و رسیدگی", "CH-03"], ["۳. سنجش رضایت", "CSAT، NPS، شاخص رضایت"], ["۴. تحلیل داده‌ها", "پارتو، روند، علل ریشه‌ای"], ["۵. اقدام و بهبود", "اقدام اصلاحی، پروژه بهبود"], ["۶. بازخورد به مشتری", "«شما گفتید، ما انجام دادیم»"]];
  b += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#E2E2E2" stroke-width="36"/>`;
  b += `<circle cx="${cx}" cy="${cy}" r="150" fill="${DARK}"/>` + txt(cx, cy, "مشتری|در مرکز", { color: "#fff", bold: true, fs: 30 });
  items.forEach(([t, d], i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
    const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    b += `<rect x="${x - 170}" y="${y - 52}" width="340" height="104" rx="14" fill="${i % 2 ? "#fff" : RED}" stroke="${RED}" stroke-width="3"/>`;
    b += txt(x, y - 14, t, { bold: true, fs: 21, color: i % 2 ? DARK : "#fff" }) + txt(x, y + 22, d, { fs: 16, color: i % 2 ? MID : "#fde" });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${CSS}</style><rect width="${W}" height="${H}" fill="#fff"/>${b}</svg>`;
}

(async () => {
  const br = await chromium.launch();
  const page = await br.newPage({ deviceScaleFactor: 2 });
  for (const [n, s] of [["flowchart", flow()], ["cycle", cycle()]]) {
    await page.setContent(`<html><body style="margin:0">${s}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("svg").screenshot({ path: path.join(__dirname, n + ".png") });
    console.log(n);
  }
  await br.close();
})();
