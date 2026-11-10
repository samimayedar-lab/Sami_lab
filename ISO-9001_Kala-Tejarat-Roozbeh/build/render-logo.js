const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:640,height:400},deviceScaleFactor:2});
await p.setContent(`<html><body style="margin:0;background:transparent">${require('fs').readFileSync(__dirname+'/logo.svg','utf8')}</body></html>`);
await p.locator('svg').screenshot({path:__dirname+'/../logo.png',omitBackground:true});await b.close();})();
