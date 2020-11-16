//jshint esversion: 8

const puppeteer = require('puppeteer');

async function openUrl(url) {
    const browser = await puppeteer.launch({headless: false}); // {headless: false}
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36");
        await page.setViewport({
            width: 1920,
            height: 948,
            deviceScaleFactor: 1,
        });
    await page.goto(url, {waitUntil: 'networkidle2'});
    // await page.addScriptTag({url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'});
    // await browser.close();

    return page;
}

module.exports = openUrl;