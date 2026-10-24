const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('Launching browser with:', executablePath);
  const browser = await chromium.launch({
    executablePath,
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000/koleksi ...');
  await page.goto('http://localhost:3000/koleksi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click on "Cetak Label" button or trigger label generator
  // Let's inspect page or find the Cetak Label button
  const cetakBtn = page.locator('button:has-text("Cetak Label"), button:has-text("Label")').first();
  if (await cetakBtn.isVisible()) {
    console.log('Clicking Cetak Label button...');
    await cetakBtn.click();
    await page.waitForTimeout(1000);
  }

  const outDir = 'C:\\Users\\prase\\.gemini\\antigravity-ide\\brain\\62ddfd95-a89c-4079-82d0-57d033ab429a\\.tempmediaStorage';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Check if modal opened
  const modal = page.locator('div[role="dialog"], div.fixed.inset-0').first();
  if (await modal.isVisible()) {
    console.log('Modal is visible! Taking screenshot...');
    await page.screenshot({ path: path.join(outDir, '08_label_generator_modal.png'), fullPage: true });

    // Look for Template Select buttons
    // e.g., Punggung SBTH Lanskap / Slip Dalam
    const slipBtn = page.locator('button:has-text("Slip Dalam Buku")').first();
    if (await slipBtn.isVisible()) {
      await slipBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, '09_slip_dalam_multisheet.png'), fullPage: true });
    }

    const spineBtn = page.locator('button:has-text("Punggung SBTH (7.4 × 4 cm)")').first();
    if (await spineBtn.isVisible()) {
      await spineBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, '10_spine_sbth_multisheet.png'), fullPage: true });
    }
    console.log('Screenshots saved successfully!');
  } else {
    console.log('Modal not found, taking fallback page screenshot...');
    await page.screenshot({ path: path.join(outDir, '08_fallback_page.png') });
  }

  await browser.close();
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
