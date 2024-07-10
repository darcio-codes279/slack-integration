const showdown = require("https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js");
const converter = new showdown.Converter();

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

let userId = "{$userId}";
const botId = "{$botId}";

const render = "{$render}";

const msger = get(".msger");
const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerSendBtn = get(".msger-send-btn");
const msgerChat = get(".msger-chat");

const chatURL = "https://admin.coach.app/api/bots/chat";
const newUserChatURL = "https://admin.coach.app/api/bots/chat-new-user";
const BOT_IMG = "https://coach-admin-images.s3.eu-west-2.amazonaws.com/avatar.png";
const PERSON_IMG = "https://coach-admin-images.s3.eu-west-2.amazonaws.com/avatar-generic.png";
const BOT_NAME = "Rob";
const PERSON_NAME = "Me";

msgerForm.addEventListener("submit", event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    sendMessageToAPI(msgText)

    msgerInput.value = "";
});

function initialiseChatOnAPI() {
    let url = newUserChatURL

    const data = {
        bot_id: botId,
    };

    if (userId !== '') {
        data['user_id'] = userId;
        url = chatURL;
    }

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.json();
        })
        .then(response => {
            console.log(response)

            if (response.user !== undefined) {
                userId = response.user.id;

                if (window.history.replaceState) {
                    window.history.replaceState(null, document.title, "/personality-quiz/?userId=" + userId)
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
        })
}

function sendMessageToAPI(messageText) {
    const data = {
        user_id: userId,
        bot_id: botId,
        message: messageText,
    };

    fetch(chatURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        timeout: 300
    })
        .then(function (response) {
            return response.json();
        })
        .then(response => {
            response.chat.forEach(
                (response) => {
                    const message = returnMessage(response);
                    botResponse(message);
                }
            );
        })
}

function appendMessage(name, img, side, text, date = new Date()) {
    let html = converter.makeHtml(text);
    html = replaceAppLinksWithWeb(html);

    const msgHTML = '<div class="msg ' + side + '-msg">' +
        '<div class="msg-img" style="background-image: url(' + img + ')"></div>' +

        '<div class="msg-bubble">' +
        '<div class="msg-text">' + html + '</div>' +
        '</div>' +
        '</div>';

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);

    let messagesOnSide = msgerChat.getElementsByClassName(side + '-msg');

    if (messagesOnSide.length > 1) {
        messagesOnSide[messagesOnSide.length - 2].getElementsByClassName('msg-img')[0].style.visibility = 'hidden';
    }

    msgerChat.scrollTop += 500;
    msgerChat.scrollTo(0, msgerChat.scrollHeight);
}

function botResponse(message) {
    const msgText = message.text;
    const delay = 200;

    setTimeout(() => {
        appendMessage(BOT_NAME, BOT_IMG, "left", msgText, message.createdAt);
        handleQuickReplies(message.quickReplies);
    }, delay);
}

// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

function formatDate(date) {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();

    return h.slice(-2) + ':' + m.slice(-2);
}

function buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
        Object.keys(data).forEach(key => {
            buildFormData(formData, data[key], parentKey ? parentKey + "[" + key + "]" : key);
        });
    } else {
        const value = data == null ? '' : data;

        formData.append(parentKey, value);
    }
}

function returnMessage(message) {
    const quickReplies = (message.type === 'single-choice')
        ? {
            type: 'radio',
            keepIt: true,
            values: message.choices,
        }
        : null;

    return {
        _id: (new Date()).getTime(),
        text: message.text,
        image: message.image,
        createdAt: new Date(),
        user: {
            _id: 0,
        },
        quickReplies: quickReplies,
    };
}

function replaceAppLinksWithWeb(html) {
    return html.replace(/(coach:\/\/chat\/)((?:(?!").)*)/gm, "https://coach.app/experiencecoach/?userId=" + userId + `&botId=$2`);
}

function handleQuickReplies(quickReplies) {
    if (quickReplies === null) {
        return;
    }

    const quickRepliesElement = document.createElement('div');
    quickRepliesElement.classList.add('quick-replies');

    quickReplies.values.forEach(quickReply => {
        const quickReplyButton = document.createElement('button');
        quickReplyButton.innerHTML = quickReply.title;
        quickReplyButton.style.margin = '0px 10px 0px 0px';

        quickReplyButton.addEventListener('click', () => {
            toggleHideElement(msgerInput);
            toggleHideElement(msgerSendBtn);
            quickRepliesElement.remove();

            sendMessageToAPI(quickReply.value);
            appendMessage(PERSON_NAME, PERSON_IMG, "right", quickReply.value);
        });

        quickRepliesElement.appendChild(quickReplyButton);
    });

    toggleHideElement(msgerSendBtn);
    toggleHideElement(msgerInput);
    msgerForm.appendChild(quickRepliesElement);
}

function require(url) {
    if (url.toLowerCase().substr(-3) !== '.js') url += '.js'; // to allow loading without js suffix;
    if (!require.cache) require.cache = []; //init cache
    var exports = require.cache[url]; //get from cache
    if (!exports) { //not cached
        try {
            exports = {};
            var X = new XMLHttpRequest();
            X.open("GET", url, 0); // sync
            X.send();
            if (X.status && X.status !== 200) throw new Error(X.statusText);
            var source = X.responseText;
            // fix (if saved form for Chrome Dev Tools)
            if (source.substr(0, 10) === "(function(") {
                var moduleStart = source.indexOf('{');
                var moduleEnd = source.lastIndexOf('})');
                var CDTcomment = source.indexOf('//@ ');
                if (CDTcomment > -1 && CDTcomment < moduleStart + 6) moduleStart = source.indexOf(`\n`, CDTcomment);
                source = source.slice(moduleStart + 1, moduleEnd - 1);
            }
            // fix, add comment to show source on Chrome Dev Tools
            source = "//@ sourceURL=" + window.location.origin + url + `\n` + source;
            //------
            var module = { id: url, uri: url, exports: exports }; //according to node.js modules 
            var anonFn = new Function("require", "exports", "module", source); //create a Fn with module code, and 3 params: require, exports & module
            anonFn(require, exports, module); // call the Fn, Execute the module
            require.cache[url] = exports = module.exports; //cache obj exported by module
        } catch (err) {
            throw new Error("Error loading module " + url + ": " + err);
        }
    }
    return exports; //require returns object exported by module
}

function toggleHideElement(element) {
    if (element.style.display === "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}

initialiseChatOnAPI();