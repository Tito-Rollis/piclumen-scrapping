import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
dotenv.config();
// Or import puppeteer from 'puppeteer-core';
const url = 'https://www.piclumen.com/app/account/login';
puppeteer.use(StealthPlugin());

// Launch the browser and open a new blank page.
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
// await page.goto('https://affiliate.shopee.co.id/dashboard', { waitUntil: 'networkidle2' });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

//  browser.waitForTarget(target => target.opener() === page.target());
// await page.locator('.WMXxSA .VAy83y .iXeFvH form .W2x2F8 .YxyuDT input').fill(process.env.EMAIL_INPUT);
// await page.locator('.WMXxSA .VAy83y .iXeFvH form .wIH_BM .YxyuDT input').fill(process.env.PASS_INPUT);
// await page.locator('.WMXxSA .VAy83y .iXeFvH form .b5aVaf').click();

// Tunggu halaman login selesai — misalnya redirect ke dashboard
await page.locator('input[type="email"]').fill(process.env.EMAIL_INPUT);
await page.locator('input[type="password"]').fill(process.env.PASS_INPUT);
await page.locator('.n-button').click();

await page.waitForNavigation({ timeout: 0 });

await page.locator('a[href="/app/create"]').click();

await page.waitForNavigation({ timeout: 0 });

// Button Resolusi
const res_selector = '.resolution-item:last-child';
await page.waitForSelector(res_selector);
await page.click(res_selector, { delay: 3000 });

// Button Batch
const batch_selector = '.batch-item:nth-child(2)';
await page.waitForSelector(batch_selector);
await page.click(batch_selector, { delay: 3000 });

// textarea
const prompt_input_selector = 'textarea[placeholder="Describe the piece you want to create..."]';
await page.waitForSelector(prompt_input_selector);
await page.type(prompt_input_selector, 'animal', { delay: 1000 });

// button
const generate_btn_selector = '.n-button:last-child';
await page.waitForSelector(generate_btn_selector);
await page.click(generate_btn_selector, { delay: 2000 });

// images
const img = await page.waitForSelector('.task-item', { timeout: 0 });
// Screenshot hasil login
await img.screenshot({ path: 'login-success.png' });
// console.log(btn);

console.log('✅ Login sukses! Screenshot disimpan di login-success.png');
