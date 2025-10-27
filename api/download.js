const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url || !url.includes('http')) {
    return res.status(400).json({ success: false, error: 'Invalid URL!' });
  }

  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    let videoUrl = null;

    // Method 1: <video><source src="...">
    videoUrl = $('video source').first().attr('src');
    if (videoUrl && videoUrl.includes('http')) {
      return res.json({ success: true, downloadUrl: videoUrl });
    }

    // Method 2: <video src="...">
    videoUrl = $('video').attr('src');
    if (videoUrl && videoUrl.includes('http')) {
      return res.json({ success: true, downloadUrl: videoUrl });
    }

    // Method 3: JSON in script
    const scripts = data.match(/\{.*"video_url".*\}/g) || [];
    for (const script of scripts) {
      try {
        const json = JSON.parse(script);
        if (json.video_url || json.hls || json.sources) {
          videoUrl = json.video_url || json.hls || json.sources?.[0]?.src;
          if
