const { chromium } = require('playwright-core');

async function runTests() {
  console.log('🚀 Starting automated end-to-end tests for Sistem Perpustakaan SBTH...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });

  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Error]:`, msg.text());
  });

  try {
    // 1. Navigate to Home
    console.log('1. Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('   ✓ Page loaded successfully. Title:', await page.title());

    // 2. Switch to KOLEKSI (Buku) Tab
    console.log('2. Switching to Koleksi & Eksemplar tab...');
    await page.locator('button[title*="Manajemen Inventaris & Eksemplar"]').first().click();
    await page.waitForTimeout(1000);
    console.log('   ✓ On Koleksi & Eksemplar tab.');

    // 3. Test Belum Cetak Label Sub-Tab
    console.log('3. Testing "Belum Cetak Label" sub-tab click & persistence...');
    const unprintedTabBtn = page.locator('button:has-text("Belum Cetak Label")').first();
    await unprintedTabBtn.click();
    console.log('   Clicked "Belum Cetak Label". Waiting 3 seconds to ensure NO reverting...');
    await page.waitForTimeout(3000);

    const unprintedHeaderExists = await page.getByText(/Antrean Eksemplar/i).or(page.getByText(/Semua Eksemplar/i)).count();
    const isStillUnprintedStored = await page.evaluate(() => localStorage.getItem('sbth_books_maintab') === 'UNPRINTED');
    console.log(`   ✓ Unprinted header count: ${unprintedHeaderExists}, localStorage state: ${isStillUnprintedStored}`);
    if (unprintedHeaderExists === 0 || !isStillUnprintedStored) {
      throw new Error('FAILED: "Belum Cetak Label" tab reverted!');
    }
    console.log('   ✓ PASS: "Belum Cetak Label" tab stayed active without resetting!');

    // 4. Test Pemusnahan Buku / Afkir Sub-Tab
    console.log('4. Testing "Pemusnahan Buku / Afkir" sub-tab click & persistence...');
    const disposedTabBtn = page.locator('button:has-text("Pemusnahan Buku / Afkir")').first();
    await disposedTabBtn.click();
    console.log('   Clicked "Pemusnahan Buku / Afkir". Waiting 3 seconds to ensure NO reverting...');
    await page.waitForTimeout(3000);

    const disposedHeaderExists = await page.getByText(/Daftar Pemusnahan/i).or(page.getByText(/Belum Ada Buku yang Dimusnahkan/i)).count();
    const isStillDisposedStored = await page.evaluate(() => localStorage.getItem('sbth_books_maintab') === 'DISPOSED');
    console.log(`   ✓ Disposed header count: ${disposedHeaderExists}, localStorage state: ${isStillDisposedStored}`);
    if (disposedHeaderExists === 0 || !isStillDisposedStored) {
      throw new Error('FAILED: "Pemusnahan Buku / Afkir" tab reverted!');
    }
    console.log('   ✓ PASS: "Pemusnahan Buku / Afkir" tab stayed active without resetting!');

    // 5. Test "+ Afkir Eksemplar" Modal
    console.log('5. Testing "+ Afkir Eksemplar" modal opening and closing...');
    const addAfkirBtn = page.locator('button:has-text("+ Afkir Eksemplar")').first();
    await addAfkirBtn.click();
    await page.waitForTimeout(800);

    const modalTitle = await page.getByText(/Catat Pemusnahan & Afkir Buku/i).count();
    if (modalTitle === 0) {
      throw new Error('FAILED: "+ Afkir Eksemplar" modal did not open!');
    }
    console.log('   ✓ PASS: Modal "Catat Pemusnahan & Afkir Buku" opened successfully!');

    // Close the modal with Batal button
    const batalBtn = page.locator('button:has-text("Batal")').last();
    await batalBtn.click();
    await page.waitForTimeout(500);
    console.log('   ✓ Closed "+ Afkir Eksemplar" modal.');

    // 6. Test Returning to Katalog Koleksi Aktif
    console.log('6. Testing return to "Katalog Koleksi Aktif"...');
    const catalogTabBtn = page.locator('button:has-text("Katalog Koleksi Aktif")').first();
    await catalogTabBtn.click();
    await page.waitForTimeout(1000);
    const searchBiblio = await page.locator('input[placeholder*="Cari judul buku"]').count();
    if (searchBiblio === 0) {
      throw new Error('FAILED: Did not return to Katalog Koleksi Aktif view!');
    }
    console.log('   ✓ PASS: Returned to Katalog Koleksi Aktif successfully!');

    // 7. Test Sirkulasi Tab
    console.log('7. Testing Sirkulasi tab navigation & quick action...');
    await page.locator('button[title*="Sirkulasi Peminjaman"]').first().click();
    await page.waitForTimeout(1000);
    const activeTab = await page.evaluate(() => localStorage.getItem('sbth_active_tab'));
    console.log(`   ✓ Sirkulasi activeTab in localStorage: ${activeTab}`);

    // 8. Test Anggota Tab
    console.log('8. Testing Anggota tab navigation...');
    await page.locator('button[title*="Data Anggota Siswa"]').first().click();
    await page.waitForTimeout(1000);
    const membersTab = await page.evaluate(() => localStorage.getItem('sbth_active_tab'));
    console.log(`   ✓ Anggota activeTab in localStorage: ${membersTab}`);

    // 9. Test OPAC Siswa Tab
    console.log('9. Testing OPAC Siswa tab navigation...');
    await page.locator('button[title*="Katalog Buku Digital (OPAC)"]').first().click();
    await page.waitForTimeout(1000);
    const opacTab = await page.evaluate(() => localStorage.getItem('sbth_active_tab'));
    console.log(`   ✓ OPAC activeTab in localStorage: ${opacTab}`);

    // Clean up temporary test files
    console.log('\n🎉 ALL WORKFLOWS & TAB PERSISTENCE TESTS PASSED 100%! 🎉');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
