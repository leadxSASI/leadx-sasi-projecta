const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let sock;
let isConnected = false;

async function connectWA() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // QR code terminal එකේ print වෙනවා
    syncFullHistory: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
      if (shouldReconnect) connectWA();
    } else if (connection === 'open') {
      console.log('WhatsApp Connected!');
      isConnected = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

connectWA();

// API: Get Profile Picture
app.post('/get-dp', async (req, res) => {
  const { number } = req.body;
  
  if (!number || !/^\d{10,15}$/.test(number)) {
    return res.json({ success: false, error: "Invalid number! Use country code (e.g., 94771234567)" });
  }

  if (!isConnected) {
    return res.json({ success: false, error: "WhatsApp not connected yet. Wait 30s and retry." });
  }

  try {
    const jid = `${number}@s.whatsapp.net`;
    const profilePicUrl = await sock.profilePictureUrl(jid, 'image');
    
    res.json({ 
      success: true, 
      url: profilePicUrl,
      number: number
    });
  } catch (err) {
    console.log("Error:", err.message);
    res.json({ 
      success: false, 
      error: "No profile picture or private account" 
    });
  }
});

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open this link to scan QR: http://localhost:${PORT}`);
});
