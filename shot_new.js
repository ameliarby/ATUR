const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport:{width:560,height:1100} });
  const errs=[];
  page.on('pageerror', e=>errs.push('PAGEERR: '+e.message));
  page.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await page.goto('file://' + path.resolve('atur.html'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const phone = page.locator('.phone');

  // Budget (from home card)
  await page.click('[data-screen="budget"]');
  await page.waitForTimeout(550);
  await phone.screenshot({ path: 'n_budget.png' });
  await page.click('#backBtn'); await page.waitForTimeout(450);

  // Profile -> sources (onboarding)
  await page.click('#avaBtn'); await page.waitForTimeout(500);
  await page.click('[data-go="sources"]'); await page.waitForTimeout(550);
  await phone.screenshot({ path: 'n_sources.png' });
  await page.click('#backBtn'); await page.waitForTimeout(400);
  await page.click('#backBtn'); await page.waitForTimeout(450);

  // Switch to Berdua, show approval banner + open approval
  await page.click('button.seg-b'); await page.waitForTimeout(800);
  await phone.screenshot({ path: 'n_berdua_home.png' });
  // scroll down to ledger/approval banner
  await page.evaluate(() => { document.querySelector('.scroll').scrollTop = 9999; });
  await page.waitForTimeout(400);
  await page.click('[data-screen="approval"]'); await page.waitForTimeout(550);
  await phone.screenshot({ path: 'n_approval.png' });

  // FAB empty state
  await page.click('#backBtn'); await page.waitForTimeout(450);
  await page.evaluate(() => { document.querySelector('.scroll').scrollTop = 0; });
  await page.waitForTimeout(200);
  await page.click('#fab'); await page.waitForTimeout(450);
  await page.click('.fab-action[data-act="estmt"]'); await page.waitForTimeout(550);
  await phone.screenshot({ path: 'n_empty.png' });

  await browser.close();
  console.log(errs.length? errs.join('\n') : 'NO ERRORS');
})();
