// use & "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug" on cli
// then get ws url from http://localhost:9222/json/version

import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import dotenv from 'dotenv';

import path from 'path';

import fs from 'node:fs';
import { cwd } from 'node:process';

dotenv.config();

const ws = 'ws://localhost:9222/devtools/browser/c242d268-946a-4399-9b5a-58dcfe63ea3f';

const promptFilePath = path.join(cwd(), 'prompts.txt');

const PROMPTS = fs
    .readFileSync(promptFilePath, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((prompt) => prompt.trim())
    .filter(Boolean);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Or import puppeteer from 'puppeteer-core';
const piclumen_url = 'https://www.piclumen.com/app/feed/creation';
const leonardi_url = 'https://app.leonardo.ai/image-generation';

const url = leonardi_url;

puppeteer.use(StealthPlugin());

// Launch the browser and open a new blank page.

const browser = await puppeteer.connect({
    browserWSEndpoint: ws,
});

const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

// Leonardo AI Variables
// dimensions
const square_dimension = await page.waitForSelector('button[value="1:1"]');
const landscape_dimension = await page.waitForSelector('button[value="16:9"]');

const textarea_input = await page.waitForSelector('textarea#prompt-textarea');
await textarea_input.click({ clickCount: 3 });
await page.keyboard.press('Backspace');

// LOGIC FLOW
await square_dimension.click();

await delay(2000);

for (const prompt of PROMPTS) {
    try {
        await textarea_input.type(prompt);
        await delay(2000);
        const generate_button = await page.waitForSelector('button[data-tour-id="generate-button"]');

        // Click Generate
        await generate_button.click().catch(() => console.log('current prompt: ', prompt));

        const upgrade_button = await page
            .waitForSelector('button[data-tracking-id="upgrade_modal_close_button"]', { visible: true, timeout: 3000 })
            .catch(() => null);

        if (upgrade_button) {
            const currentIdx = PROMPTS.findIndex((val) => val === prompt);
            console.log('Limit of generating image is reached');
            console.log('Current prompt is: ', prompt);
            console.log(currentIdx);
            const slicedPrompts = PROMPTS.slice(currentIdx, PROMPTS.length - 1);
            const convertedSlicedPrompts = slicedPrompts.join('\n');
            fs.writeFileSync('prompts.txt', convertedSlicedPrompts, 'utf8');
            browser.close();
            break;
        }
        await delay(9000);
        const selected_image_container = await page.waitForSelector('div[data-index="1"] a');
        await selected_image_container.scrollIntoView();
        await selected_image_container.hover();
        await delay(2000);
        const download_button = await page.waitForSelector('button[aria-label="Download image"]', { timeout: 0 });
        await download_button
            .click()
            .catch(() => console.log(`   [SUCCESS] Gambar (${prompt}) berhasil di-klik. Mengunduh...`));
    } catch (error) {
        console.log(error);
    } finally {
        await textarea_input.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');
    }
}

// Tunggu halaman login selesai — misalnya redirect ke dashboard

// await page.locator('input[type="email"]').fill(process.env.EMAIL_INPUT);

// await page.locator('input[type="password"]').fill(process.env.PASS_INPUT);

// await page.locator('.n-button').click();

// await page.waitForNavigation({ timeout: 0 });

// ----Uncomment this next usage

// await page.locator('a[href="/app/create/image"]').click();

// await page.waitForNavigation({ timeout: 0 });

// Button Resolusi
// const selector = 'textarea#prompt-textarea';
// const textarea = await page.waitForSelector(selector, { timeout: 0 });

// await textarea.screenshot({ path: 'image.png' });

// const res_selector = '.resolution-item:nth-child(3)';

// await page.waitForSelector(res_selector);

// await page.click(res_selector, { delay: 3000 });

// Button Batch

// const batch_selector = '.batch-item:nth-child(1)';

// await page.waitForSelector(batch_selector);

// await page.click(batch_selector, { delay: 3000 });

// const prompt_input_selector = 'textarea[placeholder="Describe the piece you want to create..."]';

// await page.waitForSelector(prompt_input_selector);

// const generate_btn_selector = '.n-button:last-child';

// Logic for looping generating prompts

// for (const prompt of PROMPTS) {
//     try {
//         await page.type(prompt_input_selector, prompt);

//         await page.waitForSelector(generate_btn_selector);

//         // Generate button
//         await page.click(generate_btn_selector).catch(() => {
//             console.log('current prompt: ', prompt);
//         });

//         const modal = await page.waitForSelector('.modal-content', { visible: true, timeout: 3000 }).catch(() => null);
//         if (modal) {
//             const currentIdx = PROMPTS.findIndex((val) => val === prompt);
//             console.log('Limit of generating image is reached');
//             console.log('Current prompt is: ', prompt);
//             console.log(currentIdx);
//             const slicedPrompts = PROMPTS.slice(currentIdx, PROMPTS.length - 1);
//             const convertedSlicedPrompts = slicedPrompts.join('\n');
//             fs.writeFileSync('prompts.txt', convertedSlicedPrompts, 'utf8');
//             browser.close();
//             break;
//         }

//         await delay(1000);

//         await page.type(prompt_input_selector, '');

//         await delay(3000);

//         // Download section

//         const first_new_image_container =
//             '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child';

//         const download_first_img_btn_selector = 'div.action-bar.bottom-mask .action-item:nth-child(2)';

//         // Get first generated image container
//         const container = await page.$(first_new_image_container);

//         if (!container) {
//             console.error(`[ERROR] Gagal menemukan container hasil generate untuk ${prompt}.`);
//             break;
//         }

//         // Get the image
//         const imageElement = await container.$('.virtual-item-img');

//         // Then hover it
//         await imageElement.hover();
//         await delay(500);

//         const download_btn_el = await container.$(download_first_img_btn_selector);
//         download_btn_el.click();

//         console.log(`   [SUCCESS] Gambar (${prompt}) berhasil di-klik. Mengunduh...`);
//         await delay(3000); // Jeda antar klik
//     } catch (e) {
//         console.error(`[CRITICAL ERROR] Gagal memproses prompt ${prompt}:`, e.message);
//         browser.close();
//         break;
//     }
// }
