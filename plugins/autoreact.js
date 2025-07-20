// plugins/autoreact.js

export async function before(m, { conn }) {
  const emoji = '😎';

  if (!m?.fromMe && m?.chat && m?.key?.id) {
    try {
      console.log(`[AUTO-REACT] reacting to: ${m.key.id}`);
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      });
    } catch (e) {
      console.error('[AUTO-REACT ERROR]', e);
    }
  }
}
