const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "lw4H2DAD#e7W5lyXxZKpVRoJHWXdMuyvw1xXwYQeQPVugLkBwRUA",
ALIVE_IMG: process.env.ALIVE_IMG || "Enter The Image URL",
ALIVE_MSG: process.env.ALIVE_MSG || "HELLO IM SASI MD CREATED BY Leadx SASI <NOW ALIVE> ",
};
