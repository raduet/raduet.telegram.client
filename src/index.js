const fs = require('fs').promises
const path = require('path')

const { app, BrowserWindow, ipcMain } = require('electron')

const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const { NewMessage } = require('telegram/events')

const apiId = 22216703
const apiHash = "cc8c5624f781abfd90a95467502dfa2a"

let signinWindow
const createSigninWindow = () => {
  signinWindow = new BrowserWindow({
    resizable: false,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  signinWindow.loadFile('src/www/signin.html')
  // signinWindow.openDevTools()
}

function waitForIpcEventSignin(eventName) {
    return new Promise((resolve, reject) => {
        ipcMain.once(eventName, (event, data) => {
            resolve(data);
        });
        signinWindow.webContents.send(eventName);
    });
}

let client
async function init() {

  const storageDirectory = app.getPath('userData')
  const sessionStorage = path.join(storageDirectory, '.session')
  let stringSession
  try {
    stringSession = new StringSession(await fs.readFile(sessionStorage, 'utf8'))
  } catch (err) {
    stringSession = new StringSession("")
  }

  createSigninWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createSigninWindow()
  })
  
  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    requestRetries: 5,
    autoReconnect: true
  })
  await client.start({
    phoneNumber: async () => await waitForIpcEventSignin('get-phone-number'),
    phoneCode: async () => await waitForIpcEventSignin('get-sms-confirm'),
    password: async () => await waitForIpcEventSignin('get-2fa-pass'),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // save this string to avoid logging in again

}

app.whenReady().then(async () => await init())
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})