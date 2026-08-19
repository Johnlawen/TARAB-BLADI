const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log("Navigating to admin...");
  await page.goto('https://tarab-bladi.vercel.app/admin.html', { waitUntil: 'networkidle0' });
  
  console.log("Typing password...");
  await page.type('#admin-password', 'john99mn');
  await page.click('button[onclick="checkAdminPassword()"]');
  
  console.log("Waiting for navigation to dashboard...");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log("Current URL:", page.url());
  
  // Wait a few seconds for Supabase to fetch
  await new Promise(r => setTimeout(r, 3000));
  
  const trackCount = await page.$$eval('.track-row', rows => rows.length);
  console.log(`FOUND ${trackCount} TRACK ROWS!`);
  
  const headerText = await page.$eval('.admin-header p', el => el.innerHTML);
  console.log(`HEADER TEXT: ${headerText}`);
  
  const html = await page.content();
  if (html.includes('No Pending Submissions')) {
    console.log("Empty state SVG is visible.");
  }
  
  await browser.close();
})();
