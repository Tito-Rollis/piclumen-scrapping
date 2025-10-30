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

await page.locator('.resolution-item:last-child').click();

await page.locator('.batch-item:nth-child(2)').click();

// Screenshot hasil login
await text.screenshot({ path: 'login-success.png' });

console.log('✅ Login sukses! Screenshot disimpan di login-success.png');
