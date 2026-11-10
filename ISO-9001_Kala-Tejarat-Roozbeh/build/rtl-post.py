# پس‌پردازش: جهت راست‌به‌چپ برای بخش (sectPr) و زبان پیش‌فرض فارسی
import sys, zipfile, shutil, re, os
for f in sys.argv[1:]:
    tmp = f + ".tmp"
    with zipfile.ZipFile(f) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
        for it in zi.infolist():
            if it.filename.endswith("/"): continue
            data = zi.read(it.filename)
            if it.filename == "word/document.xml":
                x = data.decode("utf-8")
                if "<w:bidi/><w:docGrid" not in x:
                    x = x.replace("<w:docGrid", "<w:bidi/><w:docGrid")
                data = x.encode("utf-8")
            if it.filename == "word/styles.xml":
                x = data.decode("utf-8")
                x = re.sub(r'<w:lang [^>]*/>', '', x)
                x = re.sub(r'(<w:rPrDefault><w:rPr>.*?)(</w:rPr></w:rPrDefault>)', lambda m: m.group(1) + '<w:rtl/><w:lang w:val="fa-IR" w:bidi="fa-IR" w:eastAsia="en-US"/>' + m.group(2), x, count=1, flags=re.S)
                data = x.encode("utf-8")
            zo.writestr(it, data)
    shutil.move(tmp, f)
    print("ok", os.path.basename(f))
