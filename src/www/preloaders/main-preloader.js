const {
   contextBridge,
   ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('ipc', {
   getAllChats: () => ipcRenderer.send('get-all-chats'),
});

ipcRenderer.on('get-all-chats', (event, data) => {
   window.dispatchEvent(new CustomEvent('get-all-chats', { detail: data }));
});