const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function verifyGridA4Labels() {
  const artifactDir = 'C:\\Users\\prase\\.gemini\\antigravity-ide\\brain\\62ddfd95-a89c-4079-82d0-57d033ab429a\\.tempmediaStorage';
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--window-size=1440,1050'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const wait = (ms) => page.waitForTimeout(ms);

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await wait(3000);

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

      // Select 1: Punggung SBTH Lanskap (2x6 Grid)
      const spineBtn = page.locator('button:has-text("Punggung SBTH")').first();
      if (await spineBtn.isVisible()) {
        await spineBtn.click();
        await wait(1200);
      }
      console.log('Capturing a4_spine_landscape_2x6.png...');
      await page.screenshot({ path: path.join(artifactDir, 'a4_spine_landscape_2x6.png') });

      // Select Potret
      const portraitToggle = page.locator('button:has-text("Potret")').first();
      if (await portraitToggle.isVisible()) {
        await portraitToggle.click();
        await wait(1200);
      }
      console.log('Capturing a4_spine_portrait_4x3.png...');
      await page.screenshot({ path: path.join(artifactDir, 'a4_spine_portrait_4x3.png') });

      // Select 2: Slip Dalam Buku (3x10 Grid)
      const slipBtn = page.locator('button:has-text("Slip Dalam Buku")').first();
      if (await slipBtn.isVisible()) {
        await slipBtn.click();
        await wait(1500);
      }
      console.log('Capturing a4_slip_dalam_3x10.png...');
      await page.screenshot({ path: path.join(artifactDir, 'a4_slip_dalam_3x10.png') });

      // Check TJ-103
      const tjBtn = page.locator('button:has-text("TJ-103")').first();
      if (await tjBtn.isVisible()) {
        await tjBtn.click();
        await wait(1200);
      }
      console.log('Capturing a4_tj103_grid.png...');
      await page.screenshot({ path: path.join(artifactDir, 'a4_tj103_grid.png') });
    }
  }

  await browser.close();
  console.log('✅ Grid A4 screenshots captured successfully!');
}

verifyGridA4Labels().catch(err => {
  console.error('Error running verifyGridA4Labels:', err);
  process.exit(1);
});
