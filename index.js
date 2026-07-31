// & "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
//  http://localhost:9222/json/version

import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import dotenv from 'dotenv';

import path from 'path';

import fs from 'node:fs';
import { cwd } from 'node:process';

dotenv.config();

const ws = 'ws://localhost:9222/devtools/browser/fe055fcb-4eba-40d3-9717-2c2350b2ba3d';

const promptFilePath = path.join(cwd(), 'prompts.txt');

const PROMPTS = fs
    .readFileSync(promptFilePath, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((prompt) => prompt.trim())
    .filter(Boolean);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Or import puppeteer from 'puppeteer-core';
const piclumen_url = 'https://www.piclumen.com/ai-image/';
const leonardi_url = 'https://app.leonardo.ai/generate';
const gemini_url = 'https://gemini.google.com';

puppeteer.use(StealthPlugin());

// Launch the browser and open a new blank page.

// --------- For Leonarno
const browser = await puppeteer.connect({
    browserWSEndpoint: ws,
});

// --------- For Piclumen
// const browser = await puppeteer.launch({
//     headless: false,
//     userDataDir: 'C:UsersouvalAppDataLocalGoogleChromeUser Data',
// });

const page = await browser.newPage();

const dimensions = await page.evaluate(() => {
    return {
        width: window.screen.width,
        height: window.screen.height,
    };
});

await page.setViewport(dimensions);

// Leonardo AI Variables
// dimensions
const leonardo_robot_fn = async () => {
    await page.goto(leonardi_url, { waitUntil: 'networkidle2', timeout: 0 });

    // SETTINGS SELECTOR
    const square_dimension = await page.waitForSelector('button[value="1:1"]');
    const landscape_dimension = await page.waitForSelector('button[value="16:9"]');
    const potrait_dimension = await page.waitForSelector('button[value="2:3"]');
    const select_model_trigger = await page.waitForSelector('button[data-testid="model-selector-trigger"]');
    const generate_number = await page.locator('button').filter((btn) => btn.textContent === '1');
    const select_style_trigger = await page.waitForSelector('button[role="combobox"]:nth-child(2)');
    const select_style_input = await page.waitForSelector('div > select');

    // MODELS
    const seedDream_selector = 'button[data-testid="seedream-4.5"]';
    const chatgpt_2_selector = 'button[data-testid="gpt-image-2"]';

    // Select select input
    await select_style_trigger.click();
    await delay(2000);
    await page.evaluate(
        (sel, val) => {
            const selectElement = document.querySelector(sel);

            if (selectElement) {
                // 1. Change the actual value
                selectElement.value = val;

                // 2. Dispatch a 'change' event to trigger website listeners
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
            }
        },
        'button[role="combobox"]:nth-child(2) + select',
        '5bdc3f2a-1be6-4d1c-8e77-992a30824a2c',
    );

    await delay(5000);

    await landscape_dimension.click();

    // await page.keyboard.press('Backspace');

    await delay(2000);

    // await generate_number.screenshot({ path: 'number.png' });

    const loop_fn = async (prompts) => {
        for (const prompt of prompts) {
            try {
                const textarea_input = await page.waitForSelector('textarea#prompt-textarea');
                await textarea_input.click({ clickCount: 3 });
                await textarea_input.type(prompt);
                await delay(2000);
                const generate_button = await page.waitForSelector('button[data-tour-id="gen-tour-generate-button"]');
                // Click Generate
                await generate_button.click().catch(() => console.log('current prompt: ', prompt));

                // const upgrade_button = await page
                //     .waitForSelector('button[data-tracking-id="upgrade_modal_close_button"]', {
                //         visible: true,
                //         timeout: 3000,
                //     })
                //     .catch(() => null);

                // if (upgrade_button) {
                //     const currentIdx = PROMPTS.findIndex((val) => val === prompt);
                //     console.log('Limit of generating image is reached');
                //     console.log('Current prompt is: ', prompt);
                //     console.log(currentIdx);
                //     const slicedPrompts = PROMPTS.slice(currentIdx, PROMPTS.length - 1);
                //     const convertedSlicedPrompts = slicedPrompts.join('\n');
                //     fs.writeFileSync('prompts.txt', convertedSlicedPrompts, 'utf8');

                //     break;
                // }
                await delay(8000);
                // const selected_image_container = await page.waitForSelector('div[data-index="1"] a', { timeout: 0 });
                // await selected_image_container.screenshot({ path: './container.png' });
                // await selected_image_container.scrollIntoView();
                // await selected_image_container.hover();
                // await selected_image_container.screenshot({ path: './hovered.png' });

                // const make_private_button = await page.waitForSelector('button[aria-label="Make Image Private"]', {
                //     timeout: 0,
                // });

                // await make_private_button.click();

                // await selected_image_container.hover();
                const selected_image_container = await page.waitForSelector('div[data-index="1"] div.cursor-pointer', {
                    timeout: 0,
                });
                await selected_image_container.hover();
                await delay(2000);

                const download_button = await page.waitForSelector('button[aria-label="Download image"]', {
                    timeout: 0,
                });
                await download_button
                    .click()
                    .catch(() => console.log(`   [SUCCESS] Gambar (${prompt}) berhasil di-klik. Mengunduh...`));
            } catch (error) {
                console.log(error);
            } finally {
                await textarea_input.scrollIntoView();
                await textarea_input.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');
            }
        }
    };

    // loop_fn(PROMPTS);
};

const gemini_robot_fn = async () => {
    await page.goto(gemini_url, { waitUntil: 'networkidle2', timeout: 0 });

    const text_input = await page.waitForSelector('rich-textarea.text-input-field_textarea');
    await text_input.type('hello world');
    delay(2000);
    const generate_btn = await page.waitForSelector('button[aria-label="Kirim pesan"]');

    await generate_btn.screenshot({ path: 'button.png' });
};

const piclumen_robot_fn = async () => {
    await page.goto(piclumen_url, { waitUntil: 'networkidle2', timeout: 0 });
    // await page.locator('a[href="/app/create/image"]').click();

    // await page.waitForNavigation({ timeout: 0 });

    // Button Resolusi
    const selector = 'textarea.n-input__textarea-el';
    const textarea = await page.waitForSelector(selector, { timeout: 0 });

    await textarea.screenshot({ path: 'image.png' });

    const res_selector = '.resolution-item:nth-child(3)';

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

            // Generate button
            await page.click(generate_btn_selector).catch(() => {
                console.log('current prompt: ', prompt);
            });

            const modal = await page
                .waitForSelector('.modal-content', { visible: true, timeout: 3000 })
                .catch(() => null);
            if (modal) {
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

            await delay(1000);

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
            browser.close();
            break;
        }
    }
};

leonardo_robot_fn();
