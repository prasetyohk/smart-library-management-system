const { chromium } = require('playwright-core');

async function testPaginationAndSidebar() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Set ke PUSTAKAWAN dan tab BOOKS
  await page.evaluate(() => {
    localStorage.setItem('sbth_app_mode', 'PUSTAKAWAN');
    localStorage.setItem('sbth_active_tab', 'BOOKS');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Screenshot 1: Halaman Koleksi awal (Paginasi Atas terlihat)
  await page.screenshot({ path: 'docs/screenshots/verify_pagination_top.png' });
  console.log('Saved verify_pagination_top.png');

  // Cek teks info paginasi
  const topText = await page.evaluate(() => {
    const textNodes = Array.from(document.querySelectorAll('div')).filter(d => d.textContent.includes('Menampilkan') && d.textContent.includes('Judul Buku'));
    return textNodes.map(t => t.innerText.trim())[0];
  });
  console.log('Pagination info text:', topText);

  // Scroll ke bawah 700px
  console.log('Scrolling window down 700px ...');
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1000);

  // Cek posisi sidebar dan tombol Back to Top
  const status = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const asideRect = aside ? aside.getBoundingClientRect() : null;
    const backToTopBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ke Atas') || b.getAttribute('title')?.includes('Back to Top'));
    return {
      scrollY: window.scrollY,
      asideTop: asideRect ? asideRect.top : null,
      asideHeight: asideRect ? asideRect.height : null,
      hasBackToTop: Boolean(backToTopBtn),
    };
  });
  console.log('Scroll state after scroll:', status);

  // Screenshot 2: Saat di-scroll ke bawah (Sidebar tetap sticky di kiri, tombol Ke Atas melayang)
  await page.screenshot({ path: 'docs/screenshots/verify_sidebar_sticky_and_backtotop.png' });
  console.log('Saved verify_sidebar_sticky_and_backtotop.png');

  // Klik ganti batasan item menjadi 10
  console.log('Testing limit change to 10 ...');
  const clicked10 = await page.evaluate(() => {
    const btn10 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '10');
    if (btn10) {
      btn10.click();
      return true;
    }
    return false;
  });
  console.log('Clicked limit 10 button:', clicked10);
  await page.waitForTimeout(1000);

  // Cek nomor halaman yang muncul
  const pageNumbers = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => /^[0-9]+$/.test(b.textContent.trim()));
    return btns.map(b => b.textContent.trim());
  });
  console.log('Detected page buttons:', pageNumbers);

  // Scroll ke paling bawah untuk melihat paginasi bawah
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/verify_pagination_bottom.png' });
  console.log('Saved verify_pagination_bottom.png');

  // Klik tombol Back to Top
  console.log('Testing Back to Top button click ...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ke Atas') || b.getAttribute('title')?.includes('Back to Top'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(1000);

  const finalScrollY = await page.evaluate(() => window.scrollY);
  console.log('ScrollY after clicking Back to Top:', finalScrollY);

  await browser.close();
  console.log('Test completed successfully!');
}

testPaginationAndSidebar().catch(console.error);
