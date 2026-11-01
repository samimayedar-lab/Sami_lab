// Book mapping for the 72 lesson days.
// Murphy = English Grammar in Use (Intermediate, 5th edition) unit numbers.
const murphy = [
  // W1
  '1, 2, 3, 4', '5, 6, 15', '7, 8, 13, 14', '9, 10, 11, 12', '18, 61', '19, 20, 23, 24',
  // W2
  '31, 32, 33, 35', '27, 28, 29', '49, 50, 52', '136, 137', '17', '37',
  // W3
  '105, 106, 107, 108', '98, 99, 104', '92, 93, 94, 95', '96, 97, 68', '102, 103', '100, 101',
  // W4
  '25, 114, 115', '38, 39', '40', '39, 40 (مرور)', '41, 59', '33, 34, 35',
  // W5
  '42, 43, 44', '45', '46', '47, 48', '50, 55', '112, 113',
  // W6
  '53, 54, 55', '56, 57, 58', '138, 139', '129, 130, 131, 132', '72, 73, 74, 75', '87, 88, 89, 91',
  // W7
  '51', '29, 30, 104', '111, 112', '140, 141', '5, 6, 15, 16 (مرور)', '49, 52 (مرور)',
  // W8
  '20, 36', '16', '', '', '51 (مرور)', '',
  // W9
  '26, 27', '116', '142, 143', '64, 65', '69, 70', '45, 47 (مرور)',
  // W10
  '117, 118', '109, 110', '62', '42, 43, 44 (مرور)', '98, 100 (مرور)', '6, 15, 16 (مرور)',
  // W11
  '144, 145', '133, 134, 135', '136–145 (مرور انتخابی)', '119, 120', '50 (مرور)', '77, 78',
  // W12
  '23, 24 (مرور)', '38, 115 (مرور)', '92, 95 (مرور)', '', '', 'Additional exercises (انتهای کتاب)',
];

// A business phrase for every lesson day (for a future trader).
const biz = [
  'What line of business are you in?|در چه زمینه‌ای کار می‌کنید؟',
  'We specialise in importing textiles.|ما در واردات منسوجات تخصص داریم.',
  'Let me introduce our company.|اجازه بدهید شرکتمان را معرفی کنم.',
  'We\'ve been in this business for ten years.|ده سال است در این کار هستیم.',
  'Could you send me your price list?|می‌توانید لیست قیمتتان را برایم بفرستید؟',
  'We\'re looking for a reliable supplier.|دنبال یک تأمین‌کنندهٔ قابل اعتماد هستیم.',
  'What\'s your minimum order quantity?|حداقل مقدار سفارش شما چقدر است؟',
  'Is that price negotiable?|آن قیمت قابل مذاکره است؟',
  'Could you give us a quote?|می‌توانید برایمان پیش‌فاکتور (قیمت) بدهید؟',
  'What are your payment terms?|شرایط پرداختتان چیست؟',
  'We usually pay 30% in advance.|ما معمولاً ۳۰٪ را پیش‌پرداخت می‌کنیم.',
  'When can you deliver the goods?|کی می‌توانید کالا را تحویل دهید؟',
  'Our prices are very competitive.|قیمت‌های ما بسیار رقابتی است.',
  'We offer a 5% discount for bulk orders.|برای سفارش‌های عمده ۵٪ تخفیف می‌دهیم.',
  'Can we arrange a video call next week?|می‌توانیم هفتهٔ آینده یک تماس تصویری بگذاریم؟',
  'I\'ll get back to you by Friday.|تا جمعه به شما جواب می‌دهم.',
  'Let\'s put that in writing.|بیایید آن را مکتوب کنیم.',
  'Could you send us a sample?|می‌توانید یک نمونه برایمان بفرستید؟',
  'Shipping costs are included in the price.|هزینهٔ حمل در قیمت لحاظ شده است.',
  'Who will cover the shipping costs?|هزینهٔ حمل را چه کسی می‌پردازد؟',
  'The goods were damaged during shipping.|کالا در حین حمل آسیب دید.',
  'We need the goods by the end of the month.|تا آخر ماه به کالا نیاز داریم.',
  'Can you guarantee the quality?|می‌توانید کیفیت را تضمین کنید؟',
  'What\'s the delivery time?|زمان تحویل چقدر است؟',
  'We\'d like to place an order.|می‌خواهیم سفارش بدهیم.',
  'Please confirm the order in writing.|لطفاً سفارش را کتبی تأیید کنید.',
  'The invoice is attached.|فاکتور پیوست است.',
  'Payment is due within 30 days.|پرداخت باید ظرف ۳۰ روز انجام شود.',
  'There seems to be a mistake in the invoice.|به نظر می‌رسد فاکتور اشتباهی دارد.',
  'Can we discuss the contract terms?|می‌توانیم دربارهٔ شرایط قرارداد صحبت کنیم؟',
  'That\'s our best offer.|این بهترین پیشنهاد ماست.',
  'I\'m afraid that\'s a bit higher than our budget.|متأسفانه کمی بالاتر از بودجهٔ ماست.',
  'If you increase the order, we can lower the price.|اگر سفارش را بیشتر کنید، می‌توانیم قیمت را پایین بیاوریم.',
  'We\'re interested in a long-term partnership.|به یک همکاری بلندمدت علاقه‌مندیم.',
  'Who is your target market?|بازار هدف شما کیست؟',
  'Demand for this product is growing fast.|تقاضا برای این محصول به‌سرعت در حال رشد است.',
  'Let\'s get down to business.|بیایید برویم سر اصل مطلب.',
  'I see your point, but we need better terms.|منظورتان را می‌فهمم، اما ما به شرایط بهتری نیاز داریم.',
  'Could you be a bit more flexible on the price?|می‌توانید در قیمت کمی انعطاف بیشتری داشته باشید؟',
  'Let\'s meet halfway.|بیایید هر دو کوتاه بیاییم.',
  'It\'s a deal!|قبول، معامله انجام شد!',
  'Thank you for your time today.|از وقتی که امروز گذاشتید متشکرم.',
  'We\'ve had a few delays with production.|در تولید چند تأخیر داشته‌ایم.',
  'We had to postpone the shipment.|مجبور شدیم ارسال را به تعویق بیندازیم.',
  'What really matters to us is quality.|چیزی که برای ما واقعاً مهم است کیفیت است.',
  'Not only is it cheaper, but it\'s also faster.|نه تنها ارزان‌تر است، بلکه سریع‌تر هم هست.',
  '"We need it urgently." "So do we."|«فوراً لازمش داریم.» «ما هم همین‌طور.»',
  'We\'re expanding into new markets.|داریم وارد بازارهای جدید می‌شویم.',
  'We can track the shipment online.|می‌توانیم محموله را آنلاین پیگیری کنیم.',
  'Due to rising costs, we have to raise our prices.|به دلیل افزایش هزینه‌ها، مجبوریم قیمت‌ها را بالا ببریم.',
  'Our profit margin is quite small.|حاشیهٔ سود ما نسبتاً کم است.',
  'We need to cut costs.|باید هزینه‌ها را کاهش دهیم.',
  'We\'d like to resolve this issue quickly.|می‌خواهیم این مشکل را سریع حل کنیم.',
  'According to the market report, prices will rise.|بر اساس گزارش بازار، قیمت‌ها بالا خواهد رفت.',
  'Further to our phone call, I\'m sending the details.|در ادامهٔ تماس تلفنی‌مان، جزئیات را می‌فرستم.',
  'I\'d like to follow up on our meeting.|می‌خواهم جلسه‌مان را پیگیری کنم.',
  'We would appreciate a prompt reply.|از پاسخ سریع شما سپاسگزار خواهیم بود.',
  'Sales increased by 20% last quarter.|فروش در فصل گذشته ۲۰٪ افزایش یافت.',
  'Our customers are very satisfied with the product.|مشتریان ما از محصول بسیار راضی هستند.',
  'Let me walk you through the figures.|اجازه بدهید ارقام را برایتان توضیح بدهم.',
  'We\'re trying to break even this year.|امسال تلاش می‌کنیم به نقطهٔ سر به سر برسیم.',
  'Who is the decision-maker in your company?|تصمیم‌گیرنده در شرکت شما کیست؟',
  'We can\'t afford to lose this client.|نمی‌توانیم این مشتری را از دست بدهیم.',
  'Could you clarify what you mean by "flexible"?|می‌توانید توضیح بدهید منظورتان از «منعطف» چیست؟',
  'We look forward to doing business with you.|مشتاق همکاری تجاری با شما هستیم.',
  'Thank you for choosing our company.|از اینکه شرکت ما را انتخاب کردید متشکریم.',
  'Today I\'d like to present our new product.|امروز می‌خواهم محصول جدیدمان را معرفی کنم.',
  'Would you consider an exclusive agreement?|آیا یک قرارداد انحصاری را در نظر می‌گیرید؟',
  'In the long run, this will save you money.|در درازمدت، این در هزینه‌های شما صرفه‌جویی می‌کند.',
  'Sorry, could you repeat the last figure?|ببخشید، می‌شود عدد آخر را تکرار کنید؟',
  'In short, our offer is the best value for money.|خلاصه اینکه پیشنهاد ما بهترین ارزش را در برابر پول دارد.',
  'I\'m confident we can work well together.|مطمئنم که می‌توانیم با هم خوب همکاری کنیم.',
];

// Vocabulary / reading tracks computed from lesson index k (0..71)
function vocabTask(k) {
  if (k < 36) return { book: 'English Vocabulary in Use — Upper-Intermediate', task: `Unit ${k + 1}` };
  const j = k - 36, wk = Math.floor(j / 6), d = j % 6;
  if (d % 2 === 0) return { book: 'English Vocabulary in Use — Upper-Intermediate', task: `Unit ${37 + wk * 3 + d / 2}` };
  return { book: 'Oxford Word Skills — Idioms & Phrasal Verbs (Intermediate)', task: 'یونیت بعدی به ترتیب کتاب (هر جلسه ۱ یونیت)' };
}
const irPlan = (() => {
  const steps4 = ['شروع یونیت + Reading 1 (یک بار سریع برای ایدهٔ کلی، یک بار با دقت)', 'تمرین‌های Reading 1 + بخش Reading Skill', 'Reading 2 + سؤال‌های درک مطلب', 'بخش‌های Vocabulary Activities + مرور واژه‌های آکادمیک یونیت'];
  const steps3 = ['شروع یونیت + Reading 1 + تمرین‌هایش', 'بخش Reading Skill + Reading 2 + درک مطلب', 'بخش‌های Vocabulary Activities + مرور واژه‌های یونیت'];
  const out = [];
  [2, 3].forEach(level => {
    for (let u = 1; u <= 10; u++) {
      const s = u <= 6 ? steps4 : steps3;
      s.forEach((st, i) => out.push({ level, unit: u, step: `${i + 1}/${s.length}`, task: st }));
    }
  });
  return out; // length 72
})();

module.exports = { murphy, biz, vocabTask, irPlan };
