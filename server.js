const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const TOKEN = process.env.WHAPI_TOKEN || 'YOUR_TOKEN_HERE';
const API_URL = 'https://gate.whapi.cloud/profilepic';

app.post('/get-dp', async (req, res) => {
  const { number } = req.body;
  if (!/^\d{10,15}$/.test(number)) {
    return res.json({ success: false, error: "Invalid number!" });
  }

  try {
    const { data } = await axios.get(API_URL, {
      params: { phone: number, token: TOKEN },
      timeout: 10000
    });
    data.url ? res.json({ success: true, url: data.url }) 
             : res.json({ success: false, error: "No DP or private" });
  } catch (err) {
    res.json({ success: false, error: "Server error. Try again." });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));
