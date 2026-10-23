const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function captureAll() {
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

  // 1. OPAC Kiosk
  console.log('1. Capturing 01_opac_kiosk.png');
  await page.screenshot({ path: path.join(outDir, '01_opac_kiosk.png') });

  // 2. Sirkulasi Desk
  const circBtn = page.locator('button:has-text("Sirkulasi & Pinjam-Kembali")').first();
  if (await circBtn.isVisible()) {
    await circBtn.click();
    await wait(2000);
    console.log('2. Capturing 07_meja_sirkulasi.png');
    await page.screenshot({ path: path.join(outDir, '07_meja_sirkulasi.png') });
  }

  // 3. Koleksi & Eksemplar
  const booksBtn = page.locator('button:has-text("Koleksi & Eksemplar")').first();
  if (await booksBtn.isVisible()) {
    await booksBtn.click();
    await wait(2500);
    console.log('3. Capturing 02_katalog_koleksi.png');
    await page.screenshot({ path: path.join(outDir, '02_katalog_koleksi.png') });

    // 4. Modal Scan ISBN & Auto DDC
    const scanBtn = page.locator('button:has-text("Input Buku (Scan ISBN)")').first();
    if (await scanBtn.isVisible()) {
      await scanBtn.click();
      await wait(2000);
      const isbnInput = page.locator('input[placeholder*="13 Digit"], input[placeholder*="ISBN"]').first();
      if (await isbnInput.isVisible()) {
        await isbnInput.fill('9786022497653');
        await wait(600);
      }
      console.log('4. Capturing 03_scan_isbn_auto_ddc.png');
      await page.screenshot({ path: path.join(outDir, '03_scan_isbn_auto_ddc.png') });
      await page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last().click();
      await wait(1000);
    }

    // 5. Cetak Label Generator (Punggung 7.4x4 cm)
    const labelBtn = page.locator('button:has-text("Cetak Label")').first();
    if (await labelBtn.isVisible()) {
      await labelBtn.click();
      await wait(2000);
      const spineBtn = page.locator('button:has-text("Punggung SBTH")').first();
      if (await spineBtn.isVisible()) {
        await spineBtn.click();
        await wait(1000);
      }
      console.log('5. Capturing 04_cetak_label_punggung_sbth.png');
      await page.screenshot({ path: path.join(outDir, '04_cetak_label_punggung_sbth.png') });

      // Slip Dalam Buku (6x2.5 cm)
      const slipBtn = page.locator('button:has-text("Slip Dalam Buku")').first();
      if (await slipBtn.isVisible()) {
        await slipBtn.click();
        await wait(1500);
        console.log('6. Capturing 05_cetak_slip_dalam_buku.png');
        await page.screenshot({ path: path.join(outDir, '05_cetak_slip_dalam_buku.png') });
      }

      await page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last().click();
      await wait(1000);
    }

    // 6. Kelola Kategori & Warna DDC
    const catBtn = page.locator('button:has-text("Kategori & Warna")').first();
    if (await catBtn.isVisible()) {
      await catBtn.click();
      await wait(2000);
      console.log('7. Capturing 06_kelola_kategori_warna_eddc.png');
      await page.screenshot({ path: path.join(outDir, '06_kelola_kategori_warna_eddc.png') });
      await page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last().click();
      await wait(1000);
    }
  }

  // 7. Portal Siswa
  const portalBtn = page.locator('button:has-text("Portal Siswa")').first();
  if (await portalBtn.isVisible()) {
    await portalBtn.click();
    await wait(2000);
    console.log('8. Capturing 08_portal_siswa_kiosk.png');
    await page.screenshot({ path: path.join(outDir, '08_portal_siswa_kiosk.png') });
    await page.locator('div[class*="fixed inset-0"] button:has(.lucide-x)').last().click();
    await wait(1000);
  }

  await browser.close();
  console.log('🎉 All high-res screenshots captured successfully!');
}

captureAll().catch(console.error);
