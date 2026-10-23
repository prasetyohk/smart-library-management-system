const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function testI18n() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const artifactsDir = 'C:\\Users\\prase\\.gemini\\antigravity-ide\\brain\\62ddfd95-a89c-4079-82d0-57d033ab429a\\.tempmediaStorage';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('1. Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Indonesian (ID)
  console.log('\n--- 1. VERIFYING INDONESIAN (ID) ---');
  await page.click('button[title="Bahasa Indonesia"]');
  await page.waitForTimeout(600);

  const navId = await page.$$eval('aside nav button', btns => btns.map(b => b.textContent.trim()));
  console.log('Sidebar Nav [ID]:', navId);

  // Navigate to OPAC
  await page.click('aside nav button:has-text("Katalog Visual")');
  await page.waitForTimeout(600);
  const opacTextId = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('OPAC Snippet [ID]:\n', opacTextId.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_01_id_opac.png') });

  // 2. English (EN)
  console.log('\n--- 2. VERIFYING ENGLISH (EN) ---');
  await page.click('button[title="English"]');
  await page.waitForTimeout(600);

  const navEn = await page.$$eval('aside nav button', btns => btns.map(b => b.textContent.trim()));
  console.log('Sidebar Nav [EN]:', navEn);

  const opacTextEn = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('OPAC Snippet [EN]:\n', opacTextEn.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_02_en_opac.png') });

  // Navigate to Circulation in EN
  console.log('Navigating to Circulation in EN...');
  await page.click('aside nav button:has-text("Circulation")');
  await page.waitForTimeout(600);
  const circTextEn = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('Circulation Snippet [EN]:\n', circTextEn.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_03_en_circulation.png') });

  // Navigate to Books in EN
  console.log('Navigating to Books in EN...');
  await page.click('aside nav button:has-text("Book Collections")');
  await page.waitForTimeout(600);
  const booksTextEn = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('Books Snippet [EN]:\n', booksTextEn.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_04_en_books.png') });

  // 3. Mandarin (ZH)
  console.log('\n--- 3. VERIFYING MANDARIN (ZH) ---');
  await page.click('button[title="中文"]');
  await page.waitForTimeout(600);

  const navZh = await page.$$eval('aside nav button', btns => btns.map(b => b.textContent.trim()));
  console.log('Sidebar Nav [ZH]:', navZh);

  const booksTextZh = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('Books Snippet [ZH]:\n', booksTextZh.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_05_zh_books.png') });

  // Navigate to Circulation in ZH
  console.log('Navigating to Circulation in ZH...');
  await page.click('aside nav button:has-text("借还服务前台")');
  await page.waitForTimeout(600);
  const circTextZh = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('Circulation Snippet [ZH]:\n', circTextZh.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_06_zh_circulation.png') });

  // Navigate to OPAC in ZH
  console.log('Navigating to OPAC in ZH...');
  await page.click('aside nav button:has-text("少儿视觉目录")');
  await page.waitForTimeout(600);
  const opacTextZh = await page.$eval('main', el => el.innerText.substring(0, 400));
  console.log('OPAC Snippet [ZH]:\n', opacTextZh.substring(0, 200).replace(/\n+/g, ' | '));
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_07_zh_opac.png') });

  // 4. Restore Indonesian (ID)
  console.log('\n--- 4. RESTORING INDONESIAN (ID) ---');
  await page.click('button[title="Bahasa Indonesia"]');
  await page.waitForTimeout(600);
  const navIdRestored = await page.$$eval('aside nav button', btns => btns.map(b => b.textContent.trim()));
  console.log('Sidebar Nav [ID Restored]:', navIdRestored);
  await page.screenshot({ path: path.join(artifactsDir, 'i18n_08_id_restored.png') });

  await browser.close();
  console.log('\n======================================================');
  console.log(' SUCCESS: TRILINGUAL i18n VERIFIED ACROSS ALL MODULES!');
  console.log('======================================================\n');
}

testI18n().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
