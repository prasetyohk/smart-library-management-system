const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  const page = await context.newPage();

  const outDir = 'C:/Users/prase/.gemini/antigravity-ide/brain/62ddfd95-a89c-4079-82d0-57d033ab429a/.tempmediaStorage';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Set Light theme
  await page.evaluate(() => {
    localStorage.setItem('sbth_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.waitForTimeout(500);

  // 1. Capture Koleksi Buku (Catalog) with 44 items
  const booksNav = page.locator('button:has-text("Koleksi"), button:has-text("Books")');
  if (await booksNav.count() > 0) {
    await booksNav.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'light_01_koleksi_buku_44_items.png') });
    console.log('Captured: light_01_koleksi_buku_44_items.png');
  }

  // 2. Open Category & Color Management Modal
  const categoryBtn = page.locator('button:has-text("Kategori & Warna")');
  if (await categoryBtn.count() > 0) {
    await categoryBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'light_02_eddc_category_colors_modal.png') });
    console.log('Captured: light_02_eddc_category_colors_modal.png');
    // Close modal
    const closeBtn = page.locator('button:has-text("Tutup"), button:has-text("Close")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(500);
    }
  }

  // 3. Open Label Print Generator Modal with preselected items
  const printBtn = page.locator('button:has-text("Cetak Label")');
  if (await printBtn.count() > 0) {
    await printBtn.first().click();
    await page.waitForTimeout(1000);

    // Select all available copies if not selected
    const selectAllBtn = page.locator('button:has-text("Pilih Semua"), button:has-text("Select All")');
    if (await selectAllBtn.count() > 0) {
      await selectAllBtn.first().click();
      await page.waitForTimeout(500);
    }

    // Capture 3: Slip Dalam Buku (3x10 Grid on A4)
    const slipTab = page.locator('button:has-text("Slip Dalam Buku")');
    if (await slipTab.count() > 0) {
      await slipTab.first().click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, 'light_03_slip_dalam_3x10_grid.png') });
      console.log('Captured: light_03_slip_dalam_3x10_grid.png');
    }

    // Capture 4: Punggung Buku Lanskap (2x6 Grid on A4)
    const spineTab = page.locator('button:has-text("Punggung SBTH")');
    if (await spineTab.count() > 0) {
      await spineTab.first().click();
      await page.waitForTimeout(800);

      // Ensure Lanskap orientation is active
      const lanskapBtn = page.locator('button:has-text("Lanskap")');
      if (await lanskapBtn.count() > 0) {
        await lanskapBtn.first().click();
        await page.waitForTimeout(600);
      }
      await page.screenshot({ path: path.join(outDir, 'light_04_spine_lanskap_2x6_grid.png') });
      console.log('Captured: light_04_spine_lanskap_2x6_grid.png');

      // Capture 5: Punggung Buku Potret (4x3 Grid on A4)
      const potretBtn = page.locator('button:has-text("Potret")');
      if (await potretBtn.count() > 0) {
        await potretBtn.first().click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, 'light_05_spine_potret_4x3_grid.png') });
        console.log('Captured: light_05_spine_potret_4x3_grid.png');
      }
    }

    // Capture 6: TJ-103 Grid on A4
    const tjTab = page.locator('button:has-text("Tom & Jerry No. 103")');
    if (await tjTab.count() > 0) {
      await tjTab.first().click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, 'light_06_tj103_3x4_grid.png') });
      console.log('Captured: light_06_tj103_3x4_grid.png');
    }
  }

  await browser.close();
  console.log('All light theme showcase screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
