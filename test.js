const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    channel: 'chrome', // Uses the user's pre-installed Google Chrome to avoid downloading binaries
    headless: true 
  });
  
  const page = await browser.newPage();
  
  const targetUrl = process.env.TEST_URL || 'https://vivekmed18-glitch.github.io/excuse-buster/';
  console.log(`Navigating to target URL: ${targetUrl}...`);
  await page.goto(targetUrl);
  


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
  
  console.log('Waiting for result wrapper to transition and reveal...');
  await page.waitForSelector('#result-active-wrapper:not(.hidden)', { timeout: 15000 });
  
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
  
  console.log('--- Step 2: Testing 3-Step Habit Roadmap Mode ---');
  console.log('Ticking 3-Step Habit Roadmap checkbox...');
  await page.click('#roadmap-mode-toggle');
  
  console.log('Typing second excuse for roadmap...');
  await page.fill('#excuse-input', 'I will clean my room tomorrow.');
  
  console.log('Selecting "Stoic Philosopher" mode...');
  await page.click('#tone-stoic');
  
  console.log('Submitting excuse form for roadmap...');
  await page.click('#btn-bust');
  
  console.log('Waiting for roadmap list items to populate...');
  await page.waitForSelector('#res-roadmap li', { timeout: 15000 });
  
  console.log('Reading resulting roadmap steps...');
  const steps = await page.$$eval('#res-roadmap li .step-text', el => el.map(x => x.textContent.trim()));
  console.log(`[Roadmap Steps] :\n- ${steps.join('\n- ')}`);
  
  if (steps.length !== 3) {
    throw new Error('Test failed: Roadmap does not contain exactly 3 steps!');
  }
  
  console.log('E2E Test completed successfully across both modes!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('E2E Test Execution Failed:', err);
  process.exit(1);
});
