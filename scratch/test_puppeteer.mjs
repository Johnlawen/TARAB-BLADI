import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('https://tarab-bladi.vercel.app/track.html?id=8bfd9215-8f00-4301-96ec-cff50a28b630&from=browse');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Clicking play...");
  await page.click('#main-play-btn');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Clicking like...");
  await page.click('#like-btn');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Current URL:", page.url());
  
  await browser.close();
})();
