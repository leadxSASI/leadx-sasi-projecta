// plugins/autoreact.js

export async function before(m, { conn }) {
  // Auto-react emoji (change this to what you want)
  const emoji = '😎';

  // Only react to incoming messages from other users (not self)
  if (!m.fromMe && m.chat && m.key && m.key.id) {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      });
    } catch (e) {
      console.error('Auto-react error:', e.message);
    }
  }
}
