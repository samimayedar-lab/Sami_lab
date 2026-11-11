// نمودار یکپارچگی سیستم‌ها — اجرا: node venn.js
const fs = require("fs"), path = require("path"), { chromium } = require("playwright");
const FONTS = path.join(__dirname, "../../ISO-9001_Kala-Tejarat-Roozbeh/build/fonts");
const b64 = (f) => fs.readFileSync(path.join(FONTS, f)).toString("base64");
const CSS = `@font-face{font-family:V;src:url(data:font/woff2;base64,${b64("Vazirmatn-NL-Regular.woff2")});font-weight:400}
@font-face{font-family:V;src:url(data:font/woff2;base64,${b64("Vazirmatn-NL-Bold.woff2")});font-weight:700}
text{font-family:V;direction:rtl;unicode-bidi:plaintext}`;
const t = (x, y, s, o = {}) => s.split("|").map((l, i) => `<text x="${x}" y="${y + i * (o.fs || 20) * 1.35}" text-anchor="middle" font-size="${o.fs || 20}" font-weight="${o.b ? 700 : 400}" fill="${o.c || "#1E1E1E"}">${l}</text>`).join("");
const W = 1500, H = 1000;
let b = t(W / 2, 56, "سیستم مدیریت یکپارچه (IMS) – کالا تجارت روزبه", { fs: 32, b: 1, c: "#C8102E" });
const C = [[600, 400, "#C8102E", "کیفیت|ISO 9001:2015", [430, 300]], [900, 400, "#1F6FB2", "ایمنی و بهداشت شغلی|ISO 45001:2018", [1070, 300]], [750, 640, "#2E7D32", "محیط زیست|ISO 14001:2015", [750, 735]]];
C.forEach(([x, y, c]) => (b += `<circle cx="${x}" cy="${y}" r="260" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="4"/>`));
C.forEach(([, , c, l, [x, y]]) => (b += t(x, y, l, { fs: 24, b: 1, c })));
b += t(430, 380, "رضایت مشتری|کنترل محصول و خدمت|تأمین‌کنندگان|طراحی خدمات", { fs: 16 });
b += t(1070, 380, "خطرات و ریسک‌های شغلی|مشاوره و مشارکت کارکنان|بررسی حوادث|سلامت کارکنان", { fs: 16 });
b += t(750, 812, "جنبه‌ها و پیامدهای زیست‌محیطی|مدیریت پسماند و انرژی", { fs: 16 });
b += `<circle cx="750" cy="490" r="120" fill="#1E1E1E"/>` + t(750, 440, "عناصر مشترک|خط‌مشی یکپارچه|ریسک و فرصت|الزامات قانونی|آموزش، مدارک|ممیزی و بازنگری|اقدام اصلاحی", { fs: 15, c: "#fff" });
b += `<rect x="1180" y="560" width="270" height="150" rx="14" fill="#fff" stroke="#E07B00" stroke-width="3"/>` + t(1315, 615, "ISO 10002:2018|رسیدگی به شکایات|و رضایت مشتری", { fs: 18, b: 1, c: "#E07B00" });
b += `<line x1="1180" y1="635" x2="860" y2="470" stroke="#E07B00" stroke-width="3" stroke-dasharray="8 6"/>`;
b += `<text x="40" y="${H - 18}" font-size="14" fill="#6B6B6B" text-anchor="end">کد مدرک: IMS-01 | ویرایش ۰۰</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${CSS}</style><rect width="${W}" height="${H}" fill="#fff"/>${b}</svg>`;
(async () => { const br = await chromium.launch(); const p = await br.newPage({ deviceScaleFactor: 2 }); await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.evaluate(() => document.fonts.ready); await p.locator("svg").screenshot({ path: path.join(__dirname, "venn.png") }); await br.close(); console.log("venn"); })();
