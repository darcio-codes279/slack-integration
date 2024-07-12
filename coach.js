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
messages = "Hi"
const URL = "https://admin.coach.app/api/bots/chat";
const newUserChatURL = "https://admin.coach.app/api/bots/chat-new-user"

// const name = "John"

// // Keep track of conversations
let conversations = {}

// Listens to incoming messages that contain "new-user"
app.message(async ({ message, say }) => {

    // Make an API call to the coach app API endpoint for new chat user
    const response = await fetch(URL, {
        method: 'POST', // or 'GET', 'PUT', 'DELETE', etc.
        headers: {
            'Content-Type': 'application/json',
            // Add any required headers
        },
        body: JSON.stringify({
            // Add any data you need to send to the API
            bot_id: botId,
            user_id: userID,
            message: message.text // Add the bot_id from the message
        }),
    });

    const data = await response.json();

    // Do something with the API response
    function returnMessage(message) {
        console.log(message);
        return `${message.text}`;
    }
    const chatMessages = data.chat.map((message) => returnMessage(message));
    await say(chatMessages.join('\n'));
    console.log(chatMessages.join('\n'));
    // Initialize conversation state
    conversations[message.user] = { step: 'askFirstName' };
});
