const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function captureLightShowcase() {
  const docsDir = path.resolve(__dirname, '../docs/screenshots');
  const artifactDir = 'C:\\Users\\prase\\.gemini\\antigravity-ide\\brain\\62ddfd95-a89c-4079-82d0-57d033ab429a\\.tempmediaStorage';

  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const wait = (ms) => page.waitForTimeout(ms);

  const saveShot = async (filename) => {
    const docsPath = path.join(docsDir, filename);
    const artPath = path.join(artifactDir, filename);
    await page.screenshot({ path: docsPath, fullPage: false });
    fs.copyFileSync(docsPath, artPath);
    console.log(`📸 Saved: ${filename}`);
  };

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await wait(2000);

  // Force Light mode & Pustakawan
  await page.evaluate(() => {
    localStorage.setItem('sbth_library_theme_v1', 'light');
    localStorage.setItem('sbth_app_mode', 'PUSTAKAWAN');
    localStorage.setItem('sbth_active_tab', 'CIRCULATION');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await wait(2500);

  // 1. Beranda / Sirkulasi (Light Mode)
  await saveShot('light_01_beranda_sirkulasi.png');

  // 2. Koleksi & Eksemplar
  const booksBtn = page.locator('button:has-text("Koleksi & Eksemplar")').first();
  if (await booksBtn.isVisible()) {
    await booksBtn.click();
    await wait(2000);
    await saveShot('light_02_koleksi_buku.png');

    // 3. Open Cetak Label Modal
    const labelBtn = page.locator('button:has-text("Cetak Label")').first();
    if (await labelBtn.isVisible()) {
      await labelBtn.click();
      await wait(2000);

      // Default is SLIP_DALAM_SBTH (or click Slip Dalam Buku)
      const slipBtn = page.locator('button:has-text("Slip Dalam Buku")').first();
      if (await slipBtn.isVisible()) {
        await slipBtn.click();
        await wait(1200);
      }
      await saveShot('light_03_cetak_label_slip_dalam_3x10.png');

      // 4. Punggung SBTH Lanskap
      const spineBtn = page.locator('button:has-text("Punggung SBTH")').first();
      if (await spineBtn.isVisible()) {
        await spineBtn.click();
        await wait(1200);

        // Ensure Landscape
        const lskpBtn = page.locator('button:has-text("Lanskap (7.4 × 4 cm)")').first();
        if (await lskpBtn.isVisible()) {
          await lskpBtn.click();
          await wait(1000);
        }
        await saveShot('light_04_cetak_label_punggung_lanskap_2x6.png');

        // 5. Punggung SBTH Potret
        const ptrtBtn = page.locator('button:has-text("Potret (4 × 7.4 cm)")').first();
        if (await ptrtBtn.isVisible()) {
          await ptrtBtn.click();
          await wait(1000);
          await saveShot('light_05_cetak_label_punggung_potret_4x3.png');
        }
      }

      // Close modal
      const closeBtn = page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await wait(1000);
      }
    }
  }

  // 6. Katalog Siswa / OPAC
  const opacBtn = page.locator('button:has-text("Katalog Visual"), button:has-text("Katalog Siswa"), button:has-text("Katalog Siswa (OPAC)")').first();
  if (await opacBtn.isVisible()) {
    await opacBtn.click();
    await wait(2000);
    await saveShot('light_06_katalog_siswa_opac.png');
  }

  // 7. Open Edit/Detail Buku Modal
  // Go back to books tab
  await page.evaluate(() => {
    localStorage.setItem('sbth_active_tab', 'BOOKS');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await wait(2000);

  // Click edit button on the first book row
  const editBtn = page.locator('table tbody tr button:has(.lucide-edit), table tbody tr button:has(.lucide-square-pen)').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await wait(1500);
    await saveShot('light_07_edit_buku_modal.png');
  }

  await browser.close();
  console.log('🎉 Light showcase capture finished!');
}

captureLightShowcase().catch(console.error);
