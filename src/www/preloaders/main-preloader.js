const {
   contextBridge,
   ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('ipc', {
   getChatPhoto: (chatId) => ipcRenderer.send('get-chat-photo', chatId),
   getAllChats: () => ipcRenderer.send('get-all-chats'),
   getMyProfilePhoto: () => ipcRenderer.send('get-my-profile-photo'),
});

ipcRenderer.on('get-chat-photo', (event, data) => {
   window.dispatchEvent(new CustomEvent('get-chat-photo', { detail: data }));
});
ipcRenderer.on('get-all-chats', (event, data) => {
   window.dispatchEvent(new CustomEvent('get-all-chats', { detail: data }));
});
ipcRenderer.on('get-my-profile-photo', (event, data) => {
   window.dispatchEvent(new CustomEvent('get-my-profile-photo', { detail: data }));
});