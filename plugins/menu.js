
const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const imageUrl = 'https://files.catbox.moe/ok0017.jpg';

cmd({
    pattern: "menu",
    react: "📜",
    alias: ["panel", "commands"],
    desc: "බොට් විධාන ලැයිස්තුව ලබා ගන්න",
    category: "main",
    use: '.menu',
    filename: __filename
},
async (conn, mek, m, { from, quoted, pushname, reply }) => {
    try {
        const selectionMessage = `
╭━━━━∙⋆⋅⋆∙━ ─┉─ • ─┉─⊷
*⇆ ʜɪɪ ᴍʏ ᴅᴇᴀʀ ғʀɪᴇɴᴅ ⇆*

     *${pushname}*
╰━━━━∙⋆⋅⋆∙━ ─┉─ • ─┉─⊷
┏━━━━━━━━━━━━━━━━━━━━━━━━━━
      *ғᴜʟʟ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ*
┗━━━━━━━━━━━━━━━━━━━━━━━━━━

*┌─〈 ${config.BOT_NAME} 〉─◆*
*│╭─────────────···▸*
*┴│▸*
*❖│▸* *ʀᴜɴᴛɪᴍᴇ* : ${runtime(process.uptime())}
*❖│▸* *ᴍᴏᴅᴇ* : *[${config.MODE}]*
*❖│▸* *ᴘʀᴇғɪx* : *[${config.PREFIX}]*
*❖│▸* *ʀᴀᴍ ᴜsᴇ* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
*❖│▸* *ɴᴀᴍᴇ ʙᴏᴛ* : *HASHAN-MD*
*❖│▸* *ᴄʀᴇᴀᴛᴏʀ* : *Mr Hashiya*
*❖│▸* *ᴠᴇʀsɪᴏɴs* : *ᴠ.1.0.0*
*❖│▸* *ᴍᴇɴᴜ ᴄᴍᴅ* : *ᴍᴇɴᴜ ʟɪsᴛ*
*┬│▸*
*│╰────────────···▸▸*
*└──────────────···▸*

*♡︎•━━━━━━━━━☻︎━━━━━━━━━•♡︎*

┌────────────────···▸*
*│╭─────────────···▸*
*┴│▸* 
*◈│▸* *1. DOWNLOAD MENU*
*◈│▸* *2. SEARCH MENU* 
*◈│▸* *3. AI MENU*
*◈│▸* *4. OWNER MENU*
*◈│▸* *5. GROUP MENU*
*◈│▸* *6. INFO MENU*
*◈│▸* *7. CONVERTER MENU*
*◈│▸* *8. RANDOM MENU*
*◈│▸* *9. WALLPAPERS MENU*
*◈│▸* *10. OTHER MENU*
*┬│▸*
*│╰────────────···▸▸*
*└────────────────···▸*

> ©POWERD BY HASHAN-MD
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: selectionMessage,
            contextInfo: { forwardingScore: 999, isForwarded: true },
        }, { quoted: mek });

        // පරිශීලක ප්‍රතිචාර ලබා ගැනීම
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const userResponse = msg.message.extendedTextMessage.text.trim();
            if (msg.message.extendedTextMessage.contextInfo &&
                msg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id) {

                let responseText;

                switch (userResponse) {
                    case '1': // DOWNLOAD MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *📥 DOWNLOADER-MENU 📥* *❒⁠⁠⁠⁠* 
*┋* *.FB*
*┋* *.SONG*
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '2': // SEARCH MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *🔎 SEARCH-MENU 🔍* *❒⁠⁠⁠⁠* 
*┋* *.ANIME*
*┋* *.ANIME2*
*┋* *.IMG*
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '3': // AI MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *🧠 AI-MENU 🧠* *❒⁠⁠⁠⁠* 
*┋* *.AI*
*┋* *.comming soon*
*┋* *.comming soon*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '4': // OWNER MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *👨‍💻 OWNER-MENU 👨‍💻* *❒⁠⁠⁠⁠* 
*┋* *.SETTINGS*
*┋* *.OWNER*
*┋* *.SYSTEM*
*┋* *.UNBLOCK*
*┋* *.SETPP*
*┋* *.RESTART*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '5': // GROUP MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *👥 GROUP-MENU 👥* *❒⁠⁠⁠⁠* 
*┋* *.REMOVE*
*┋* *.DELETE*
*┋* *.ADD*
*┋* *.KICK*
*┋* *.MUTE*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '6': // INFO MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *📃 INFO-MENU 📃* *❒⁠⁠⁠⁠* 
*┋* *.MENU*
*┋* *.ALIVE*
*┋* *.SYSTEM*
*┋* *.PING*
*┋* *.ANIME*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '7': // CONVERTER MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *🎡 CONVERTER-MENU 🎡* *❒⁠⁠⁠⁠* 
*┋* *.comming soon*
*┋* *.comming soon*
*┋* *.comming soon*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '8': // WALLPAPERS MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *⛱️ RANDOM-MENU ⛱️* *❒⁠⁠⁠⁠* 
*┋* *.ᴀɴɪᴍᴇ*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ1*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ2*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ3*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ4*
*┋* *.ᴀɴɪᴍᴇɢɪʀʟ5*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '9': // WALLPAPER MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *🏜️ WALLPAPERS-MENU 🏜️* *❒⁠⁠⁠⁠* 
*┋* *.ɪᴍɢ*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    case '10': // OTHER MENU
                        responseText = `
*╭────❒⁠⁠⁠⁠* *🌐 OTHER-MENU 🌐* *❒⁠⁠⁠⁠* 
*┋* *.HACK*
*╰───────────────────❒*

> ©POWERED BY HASHAN-MD
`;
                        break;
                    default:
                        responseText = "*❌ Invalid option. Please enter a valid number (1-10)*";
                }

                // තෝරාගත් මෙනුව WhatsApp chat එකට යවයි.
                await conn.sendMessage(from, { text: responseText }, { quoted: mek });
            }
        });

    } catch (e) {
        console.error(e);
        reply(`*⚠ An error occurred: ${e.message}*`);
    }
});
