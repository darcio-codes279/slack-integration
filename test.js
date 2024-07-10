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
app.message('hello', async ({ message, say }) => {

    conversations[message.user] = { step: 'start' };
    console.log(conversations)
    // Make an API call to the coach app API endpoint for new chat user
    const response = await fetch(newUserChatURL, {
        method: 'POST', // or 'GET', 'PUT', 'DELETE', etc.
        headers: {
            'Content-Type': 'application/json',
            // Add any required headers
        },
        body: JSON.stringify({
            // Add any data you need to send to the API
            bot_id: botId, // Add the bot_id from the message
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
app.message(async ({ message, say }) => {
    const user = message.user;
    const userConversation = conversations[user];
    console.log(user)
    console.log(conversations)
    if (userConversation) {
        if (userConversation.step === 'askFirstName') {
            // Save user's name and proceed to the next step
            userConversation.firstName = message.text;
            userConversation.step = 'askLastName';
            await say(`Nice to meet you, ${userConversation.firstName}. What is your last name?`);
        } else if (userConversation.step === 'askLastName') {
            // Save user's age and proceed to the next step
            userConversation.lastName = message.text;
            userConversation.step = 'completed';
            await say(`Thank you ${userConversation.firstName} ${userConversation.lastName}`);

            const payload = {
                bot_id: botId,
                user_id: userConversation.userId,
                first_name: userConversation.firstName,
                last_name: userConversation.lastName,
            };

            try {
                const response = await fetch('https://admin.coach.app/api/bots/chat-new-user', {
                    method: 'POST', // or 'GET', 'PUT', 'DELETE', etc.
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any required headers
                    },
                    body: JSON.stringify(payload),
                })
                const data = await response.json();
                console.log('API Response:', data);
                if (data.success) {
                    await say(`_Thanks for the information ${userConversation.firstName}!_`);
                } else {
                    await say(`_Oops ${userConversation.firstName}! There was an issue with your information. Please try again_`);
                }
            } catch (error) {
                console.error('Error:', error);
                await say('An error occurred. Please try again later.');

            }
        }
    }
});

// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message('k', async ({ message, say }) => {

    await say(`_Who's there?_`);
});

(async () => {
    // Start your app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})()