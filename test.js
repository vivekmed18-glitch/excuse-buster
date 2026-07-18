const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    channel: 'chrome', // Uses the user's pre-installed Google Chrome to avoid downloading binaries
    headless: true 
  });
  
  const page = await browser.newPage();
  
  console.log('Navigating to live site...');
  await page.goto('https://vivekmed18-glitch.github.io/excuse-buster/');
  
  console.log('Verifying page title...');
  const title = await page.title();
  console.log(`Page title: "${title}"`);
  if (title !== 'Excuse Buster — Banish Procrastination Instantly') {
    throw new Error('Title verification failed!');
  }
  
  console.log('Typing procrastination excuse...');
  await page.fill('#excuse-input', 'I will start coding tomorrow.');
  
  console.log('Selecting "Brutal" mode...');
  await page.click('#tone-brutal');
  
  console.log('Submitting excuse form...');
  await page.click('#btn-bust');
  
  console.log('Waiting for result panel to transition and reveal...');
  // Wait for the .hidden class to be removed
  await page.waitForSelector('#result-panel:not(.hidden)', { timeout: 15000 });
  
  console.log('Reading resulting card details...');
  const excuse = (await page.textContent('#res-excuse')).trim();
  const callout = (await page.textContent('#res-callout')).trim();
  const action = (await page.textContent('#res-action')).trim();
  
  console.log('\n======================================');
  console.log('  EXCUSE BUSTER RESULTS (TEST)');
  console.log('======================================');
  console.log(`[Named Excuse] : ${excuse}`);
  console.log(`[Callout]      : ${callout}`);
  console.log(`[5-Min Action] : ${action}`);
  console.log('======================================\n');
  
  if (!excuse || !callout || !action) {
    throw new Error('Test failed: One or more card fields are empty.');
  }
  
  console.log('E2E Test completed successfully!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('E2E Test Execution Failed:', err);
  process.exit(1);
});
