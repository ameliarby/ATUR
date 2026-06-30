const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport:{width:560,height:1000} });
  const errs=[];
  page.on('pageerror', e=>errs.push('PAGEERR: '+e.message));
  page.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await page.goto('file://' + path.resolve('atur.html'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const phone = page.locator('.phone');
  // open Catatan
  await page.click('[data-screen="catatan"]');
  await page.waitForTimeout(550);
  await phone.screenshot({ path: 's_catatan_top.png' });
  // expand first source
  await page.click('.src-hd[data-toggle="0"]');
  await page.waitForTimeout(500);
  await phone.screenshot({ path: 's_catatan_expand.png' });
  await browser.close();
  console.log(errs.length? errs.join('\n') : 'NO ERRORS');
})();
