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
const botIdSlack = "slack"
const userID = "1822"
const URL = "https://admin.coach.app/api/bots/chat";
const newUserChatURL = "https://admin.coach.app/api/bots/chat-new-user"


// Listens to incoming messages that contain "new-user"
app.message(async ({ message, say }) => {
    // Make an API call to the coach app API endpoint for new chat user
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bot_id: botId,
            user_id: userID,
            message: message.text,
        }),
    });

    let data = await response.json();

    // Do something with the API response

    const chatMessages = data.chat.map((message) => `_${message.text}_`);
    await say(chatMessages.join('\n'));
    console.log(chatMessages.join('\n'));


});

(async () => {
    // Start your app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})()
