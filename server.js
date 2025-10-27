const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { getDirectVideoUrl } = require('./scraper');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Create downloads folder
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('http')) {
    return res.json({ success: false, error: 'Invalid URL!' });
  }

  res.json({ success: true, status: 'extracting' });

  const videoUrl = await getDirectVideoUrl(url);
  if (!videoUrl) {
    return res.json({ success: false, error: 'Video not found! Try another link.' });
  }

  const filename = `video_${Date.now()}.mp4`;
  const filepath = path.join(DOWNLOAD_DIR, filename);

  try {
    const response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 0,
      headers: { 'Range': 'bytes=0-' }
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      res.json({
        success: true,
        file: filename,
        downloadUrl: `/downloads/${filename}`,
        size: fs.statSync(filepath).size
      });
    });

    writer.on('error', () => {
      res.json({ success: false, error: 'Download failed!' });
    });

  } catch (err) {
    res.json({ success: false, error: 'Stream error!' });
  }
});

app.use('/downloads', express.static(DOWNLOAD_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ULTIMATE DOWNLOADER LIVE: http://localhost:${PORT}`);
});
