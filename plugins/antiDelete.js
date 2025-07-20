const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'antiDelete',
  event: 'message-update', // Listen to message update events
  async handler(sock, update) {
    const msg = update;

    if (!msg.message && msg.messageStubType === 1) {
      const chat = msg.key.remoteJid;
      const messageId = msg.key.id;

      try {
        const originalMessage = await sock.loadMessage(chat, messageId);
        if (originalMessage) {
          const sender = originalMessage.key.participant || originalMessage.key.remoteJid;
          const time = new Date(originalMessage.messageTimestamp * 1000).toLocaleString();
          const messageContent = JSON.stringify(originalMessage.message, null, 2);

          const logData = {
            from: sender,
            chat: chat,
            time: time,
            content: originalMessage.message,
          };

          // ✅ Save to JSON file
          const logFile = path.join(__dirname, '../deletedMessages.json');
          const existing = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile)) : [];
          existing.push(logData);
          fs.writeFileSync(logFile, JSON.stringify(existing, null, 2));

          // 🧾 Send preview to the chat
          const preview = `🚫 *Message Deleted!*\n👤 From: @${sender.split('@')[0]}\n🕓 Time: ${time}\n\n🗒️ Content:\n${messageContent}`;
          await sock.sendMessage(chat, {
            text: preview,
            mentions: [sender],
          });

          console.log('🛡️ Deleted message saved to log.');
        }
      } catch (err) {
        console.error('❌ Error retrieving deleted message:', err);
      }
    }
  },
};
