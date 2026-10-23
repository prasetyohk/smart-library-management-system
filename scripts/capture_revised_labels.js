const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function captureRevisedLabels() {
  const outDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: ['--disable-gpu', '--no-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const wait = (ms) => page.waitForTimeout(ms);

  await page.goto('http://localhost:3000');
  await wait(3500);

  // Navigate to Koleksi & Eksemplar
  const booksBtn = page.locator('button:has-text("Koleksi & Eksemplar")').first();
  if (await booksBtn.isVisible()) {
    await booksBtn.click();
    await wait(2000);

    // Open Cetak Label
    const labelBtn = page.locator('button:has-text("Cetak Label")').first();
    if (await labelBtn.isVisible()) {
      await labelBtn.click();
      await wait(2000);

      // 1. Punggung SBTH (7.4 x 4 cm Kotak)
      const spineBtn = page.locator('button:has-text("Punggung SBTH")').first();
      if (await spineBtn.isVisible()) {
        await spineBtn.click();
        await wait(1200);
      }
      console.log('Capturing 04_cetak_label_punggung_sbth.png...');
      await page.screenshot({ path: path.join(outDir, '04_cetak_label_punggung_sbth.png') });

      // 2. Slip Dalam Buku (6 x 2.5 cm Kotak dengan Barcode 4 Digit)
      const slipBtn = page.locator('button:has-text("Slip Dalam Buku")').first();
      if (await slipBtn.isVisible()) {
        await slipBtn.click();
        await wait(1500);
      }
      console.log('Capturing 05_cetak_slip_dalam_buku.png...');
      await page.screenshot({ path: path.join(outDir, '05_cetak_slip_dalam_buku.png') });

      await page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last().click();
      await wait(1000);
    }
  }

  await browser.close();
  console.log('✅ Revised screenshots captured successfully!');
}

captureRevisedLabels().catch(console.error);
