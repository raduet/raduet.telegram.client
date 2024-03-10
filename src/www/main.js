const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const chatsList = document.getElementById('chats-list');

let isResizing = false;
let lastDownX = 0;
sidebar.addEventListener('mousedown', (e) => {
    isResizing = true;
    lastDownX = e.clientX;
})
document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const offsetRight = document.body.offsetWidth - (e.clientX - content.offsetLeft);
    sidebar.style.width = e.clientX + 'px';
    content.style.width = offsetRight + 'px';
})
document.addEventListener('mouseup', (e) => {
    isResizing = false;
})

/**
 * Messenger API
 */

// ----------------------------- Common extensions
/**
 * [deserializeAllObjects description]
 * Util function for decoding client objects
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function deserializeAllObjects(str) {
    const visited = new WeakSet();
    function deserialize(value) {
        if (typeof value !== 'object' || value === null) {
            return value; // Примитивное значение
        }
        if (visited.has(value)) {
            return '[Circular]'; // Обработка зацикливания
        }
        visited.add(value);
        if (Array.isArray(value)) {
            return value.map(item => deserialize(item)); // Обработка массива
        }
        const deserializedObj = {};
        for (const key in value) {
            deserializedObj[key] = deserialize(value[key]); // Рекурсивный обход объекта
        }
        return deserializedObj;
    }

    const parsedObj = JSON.parse(str);
    return deserialize(parsedObj);
}

// ----------------------------- Loading dialogs
/**
 * [loadChatPhoto description]
 * Loading every chat photo
 * @return {[type]} [description]
 */
function loadChatPhoto(chatId) {
    return new Promise((resolve) => {
        function handleChatPhoto(event) {
            const base64Image = event.detail;
            const imageUrl = `data:image/jpeg;base64,${base64Image}`;
            window.removeEventListener('get-chat-photo', handleChatPhoto)
            resolve(imageUrl)
        }
        window.addEventListener('get-chat-photo', handleChatPhoto)
        window.ipc.getChatPhoto(chatId)
    })
}
/**
 * [loadAllChats description]
 * Loading all user dialogs
 * @return {[type]} [description]
 */
function loadAllChats() {
    return new Promise((resolve) => {
        window.addEventListener('get-all-chats', async (event) => {
            const data = event.detail;
            const deserializedObj = deserializeAllObjects(data);

            chatsList.replaceChildren()
            for (chat of deserializedObj) {
                // console.log(chat)
                const imageUrl = await loadChatPhoto(chat.id)
                const listItem = document.createElement('li');
                listItem.id = chat.id
                listItem.classList.add('mb-3')
                listItem.innerHTML = 
                    `
                        <div class="row flex-nowrap">
                            <div class="col-3 text-end">
                                <img src="${imageUrl}" class="rounded-circle" width="50" height="50">                                
                            </div>           
                            <div class="text-col">
                                <div class="row align-items-baseline">
                                    <div class="col-8">
                                        <strong class="small-text">${chat.title}</strong>
                                    </div>
                                    <div class="col text-end">
                                        <p class="small-text m-0">23:50</p>
                                    </div>
                                </div>
                                <div class="row align-items-baseline">
                                    <div class="col-8">
                                        <p class="small-text m-0">${chat.message.message}</p>
                                    </div>
                                    <div class="col text-end">
                                        <p class="small-text m-0">Pin</p>
                                    </div>
                                </div>                                
                            </div>                 
                        </div>
                    `
                chatsList.appendChild(listItem)
            }

            resolve()
        });
        window.ipc.getAllChats();
    });
}

// ----------------------------- Loading user profile photo
/**
 * [loadMyProfilePhoto description]
 * Loading user profile photo
 * @return {[type]} [description]
 */
function loadMyProfilePhoto() {
    return new Promise((resolve) => {
        window.addEventListener('get-my-profile-photo', (event) => {
            const base64Image = event.detail;
            const imageUrl = `data:image/jpeg;base64,${base64Image}`;
            resolve(imageUrl)
        });
        window.ipc.getMyProfilePhoto();
    })
}

// ----------------------------- Starting initialization
/**
 * [init description]
 * Start entry
 * @return {[type]} [description]
 */
async function init() {
    await loadAllChats()
    await loadMyProfilePhoto()
}
init()