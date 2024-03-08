const {
   contextBridge,
   ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('ipc', {
   sendPhoneNumber: (phoneNumber) => ipcRenderer.send('get-phone-number', phoneNumber),
   sendSmsConfirm: (smsCode) => ipcRenderer.send('get-sms-confirm', smsCode),
   send2FAPass: (twoFactorPass) => ipcRenderer.send('get-2fa-pass', twoFactorPass),
});

ipcRenderer.on('get-phone-number', (event, data) => {
    window.dispatchEvent(new CustomEvent('get-phone-number', { detail: data }));
});
ipcRenderer.on('get-sms-confirm', (event, data) => {
    window.dispatchEvent(new CustomEvent('get-sms-confirm', { detail: data }));
});
ipcRenderer.on('get-2fa-pass', (event, data) => {
    window.dispatchEvent(new CustomEvent('get-2fa-pass', { detail: data }));
});