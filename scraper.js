const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
const sites = require('./sites.json');

async function getDirectVideoUrl(url) {
  const domain = new URL(url).hostname.replace('www.', '');
  const config = sites[domain] || {};

  try {
    // METHOD 1: Direct HTML scrape
    if (!config.puppeteer) {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': new UserAgent().toString() },
        timeout: 15000
      });
      const $ = cheerio.load(data);

      // Selector method
      if (config.selector) {
        const src = $(config.selector).first().attr('src');
        if (src && src.includes('http')) return src;
      }

      // Regex method
      if (config.regex) {
        const match = data.match(new RegExp(config.regex));
        if (match) {
          let src = match[1];
          if (config.replace) src = src.replace(/\\\//g, '/');
          return src;
        }
      }

      // XVideos API
      if (config.api) {
        const id = url.split('/').pop();
        const res = await axios.get(config.api + id);
        return res.data.hd || res.data.sd;
      }
    }

    // METHOD 2: Puppeteer (for JS-heavy sites)
    if (config.puppeteer || domain.includes('bangbros') || domain.includes('naughtyamerica')) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setUserAgent(new UserAgent().toString());
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const videoUrl = await page.evaluate(() => {
        const video = document.querySelector('video source, video');
        return video ? video.src || video.currentSrc : null;
      });

      await browser.close();
      if (videoUrl) return videoUrl;
    }

    // METHOD 3: Fallback – Network intercept (last resort)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let videoUrl = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.mp4') && response.status() === 200) {
        videoUrl = url;
      }
    });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
    await browser.close();

    return videoUrl;

  } catch (err) {
    console.error('Scrape failed:', err.message);
    return null;
  }
}

module.exports = { getDirectVideoUrl };
