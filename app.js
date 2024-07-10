const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
    // you still need to listen on some port!
    port: process.env.PORT || 3000
});

const chatURL = "https://admin.coach.app/api/bots/chat";
const newUserChatURL = "https://admin.coach.app/api/bots/chat-new-user";
const BOT_IMG = "https://coach-admin-images.s3.eu-west-2.amazonaws.com/avatar.png";
const PERSON_IMG = "https://coach-admin-images.s3.eu-west-2.amazonaws.com/avatar-generic.png";
const BOT_NAME = "Rob";
const PERSON_NAME = "Me";

function initialiseChatOnAPI() {
    let url = newUserChatURL;

    const data = {
        bot_id: botId,
    };

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.json();
        })
        .then(response => {
            console.log(response);

            if (response.user !== undefined) {
                userId = response.user.id;

                if (window.history.replaceState) {
                    window.history.replaceState(null, document.title, "/personality-quiz/?userId=" + userId);
                }
            }

            response.chat.forEach(
                (response) => {
                    const message = returnMessage(response);
                    botResponse(message);
                }
            );
            if (render === "true") {
                toggleHideElement(msger);
            }
        });
}


// Listens to incoming messages that contain "hello"
app.message('Hello', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered

    await say(`Hello <@${message.user}>!`);
    await initialiseChatOnAPI
});


(async () => {
    // Start your app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})();

// simole fetch that calls api and gets response
