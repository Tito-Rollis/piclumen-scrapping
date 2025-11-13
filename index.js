import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import dotenv from 'dotenv';

import path from 'path';

import fs from 'node:fs';
import { cwd } from 'node:process';

dotenv.config();

const promptFilePath = path.join(cwd(), 'prompts.txt');

const PROMPTS = fs
    .readFileSync(promptFilePath, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((prompt) => prompt.trim())
    .filter(Boolean);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Or import puppeteer from 'puppeteer-core';

const url = 'https://www.piclumen.com/app/account/login';

puppeteer.use(StealthPlugin());

// Launch the browser and open a new blank page.

const browser = await puppeteer.launch({ headless: false });

const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

// Tunggu halaman login selesai — misalnya redirect ke dashboard

await page.locator('input[type="email"]').fill(process.env.EMAIL_INPUT);

await page.locator('input[type="password"]').fill(process.env.PASS_INPUT);

await page.locator('.n-button').click();

await page.waitForNavigation({ timeout: 0 });

await page.locator('a[href="/app/create"]').click();

await page.waitForNavigation({ timeout: 0 });

// Button Resolusi

const res_selector = '.resolution-item:first-child';

await page.waitForSelector(res_selector);

await page.click(res_selector, { delay: 3000 });

// Button Batch

const batch_selector = '.batch-item:nth-child(1)';

await page.waitForSelector(batch_selector);

await page.click(batch_selector, { delay: 3000 });

const prompt_input_selector = 'textarea[placeholder="Describe the piece you want to create..."]';

await page.waitForSelector(prompt_input_selector);

const generate_btn_selector = '.n-button:last-child';

// Logic for looping generating prompts

for (const prompt of PROMPTS) {
    try {
        await page.type(prompt_input_selector, prompt);

        await page.waitForSelector(generate_btn_selector);

        await page.click(generate_btn_selector);

        await delay(9000);

        await page.type(prompt_input_selector, '');

        await delay(3000);

        // Download section

        const first_new_image_container =
            '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child';

        const download_first_img_btn_selector = 'div.action-bar.bottom-mask .action-item:nth-child(2)';

        // Get first generated image container
        const container = await page.$(first_new_image_container);

        if (!container) {
            console.error(`[ERROR] Gagal menemukan container hasil generate untuk ${prompt}.`);
            break;
        }

        // Get the image
        const imageElement = await container.$('.virtual-item-img');

        // Then hover it
        await imageElement.hover();
        await delay(500);

        const download_btn_el = await container.$(download_first_img_btn_selector);
        download_btn_el.click();

        console.log(`   [SUCCESS] Gambar (${prompt}) berhasil di-klik. Mengunduh...`);
        await delay(3000); // Jeda antar klik
    } catch (e) {
        console.error(`[CRITICAL ERROR] Gagal memproses prompt ${prompt}:`, e.message);
        break;
    }
}
