const { App } = require('@slack/bolt');

require('dotenv').config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
    // you still need to listen on some port!
    port: process.env.PORT || 3000
});

const botId = "marketing"
const userId = "1822"
message = "Hi"
const URL = "https://admin.coach.app/api/bots/chat"

// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message(async ({ message, say }) => {

    await say(`_Who's there?_`);
});

(async () => {
    // Start your app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})()