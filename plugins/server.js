// server.js
const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public")); // frontend files

const DOWNLOAD_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.post("/api/download", (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  // Generate unique filename
  const fileName = `video_${Date.now()}.mp4`;
  const filePath = path.join(DOWNLOAD_DIR, fileName);

  // yt-dlp command to download MP4
  const cmd = `yt-dlp -f mp4 -o "${filePath}" "${url}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: "Download failed", details: stderr });

    // Return download link
    res.json({ download_link: `/downloads/${fileName}` });
  });
});

// Serve downloads folder
app.use("/downloads", express.static(DOWNLOAD_DIR));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
