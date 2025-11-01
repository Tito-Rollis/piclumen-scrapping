import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PROMPTS = ['animal', 'robot', 'plant', 'number'];
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
// await page.click(generate_btn_selector, { delay: 2000 });

// images

// 1st Image
const first_img_selector =
    '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child .virtual-item-img:first-child';
await page.hover(first_img_selector);

// Download button
const download_first_img_btn_selector =
    '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child .virtual-item-img:first-child div.action-bar.bottom-mask .action-item:nth-child(2)';
await page.waitForSelector(download_first_img_btn_selector);
// await page.click(download_first_img_btn_selector);

await delay(3000);

// 2nd Image
const second_img_selector =
    '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child .virtual-item-img:nth-child(2)';
await page.hover(second_img_selector);

// Download button
const download_second_img_btn_selector =
    '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child .virtual-item-img:nth-child(2) div.action-bar.bottom-mask .action-item:nth-child(2)';
await page.waitForSelector(download_second_img_btn_selector);
// await page.click(download_second_img_btn_selector);

console.log('✅ Download sukses!!!');
// const buttons = await page.waitForSelector(bottom_btns_selector, { timeout: 0 });

const matchingImageHandles = [];
const imagesContainer = await page.$$('.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view');

// Logic for mapping images to matchingImageHandles
for (const [index, container] of imagesContainer.entries()) {
    const promptEl = await container.$('.prompt');
    const promptText = await promptEl.evaluate((el) => el.textContent);

    const isMatching = PROMPTS.includes(promptText);

    if (isMatching) {
        const imageElement = await container.$$('.virtual-item-img');
        for (const [idx, img] of imageElement.entries()) {
            matchingImageHandles.push(img);

            await img.screenshot({ path: `img-${index}-${idx}.png` });
        }
    }
}

console.log(matchingImageHandles);

// const tes = await page.$$eval(
//     '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view .prompt',
//     (divs) =>
//         divs.map(async (div) => {
//             const getImage = await page.waitForSelector(`${div.className} `);
//         })
// );
// const tes = await page.waitForSelector(
//     '.vue-recycle-scroller__item-wrapper > .vue-recycle-scroller__item-view:first-child .prompt'
// );
// Screenshot hasil login
// await tes.screenshot({ path: 'login-success.png' });
// console.log(tes);

console.log('✅ Login sukses! Screenshot disimpan di login-success.png');
