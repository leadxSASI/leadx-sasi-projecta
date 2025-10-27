const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST only' });
  }

  const { url } = req.body || {};
  if (!url || !url.includes('http')) {
    return res.status(400).json({ success: false, error: 'URL required!' });
  }

  try {
    const { data } = await axios.get(url, {
      timeout: 7000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': url,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(data);
    let videoUrl = null;

    // 1. Direct <source> or <video> src
    videoUrl = $('video source').first().attr('src') || $('video').attr('src');
    if (videoUrl && videoUrl.startsWith('http')) {
      return res.json({ success: true, downloadUrl: videoUrl });
    }

    // 2. JSON in script tags
    const scripts = data.match(/\{[\s\S]*?"video_url"[\s\S]*?\}/g) || [];
    for (const script of scripts) {
      try {
        const json = JSON.parse(script.replace(/[\r\n]/g, '').trim());
        const src = json.video_url || json.hls || json.sources?.[0]?.src;
        if (src && src.startsWith('http')) {
          return res.json({ success: true, downloadUrl: src });
        }
      } catch {}
    }

    // 3. Regex fallback
    const patterns = [
      /"video_url":"([^"]+)"/,
      /streamURL\s*=\s*"([^"]+)"/,
      /video_src\s*=\s*"([^"]+)"/,
      /"hls":"([^"]+)"/,
      /"file":"([^"]+\.mp4)"/
    ];

    for (const pattern of patterns) {
      const match = data.match(pattern);
      if (match) {
        videoUrl = match[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
        if (videoUrl.startsWith('http')) {
          return res.json({ success: true, downloadUrl: videoUrl });
        }
      }
    }

    return res.json({ success: false, error: 'Video not found!' });

  } catch (err) {
    console.error('Error:', err.message);
    return res.json({ success: false, error: 'Try another link!' });
  }
};
