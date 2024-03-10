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
      preload: path.join(__dirname, '/www/preloaders/signin-preloader.js')
    }
  })
  signinWindow.loadFile('src/www/signin.html')
  // signinWindow.openDevTools()
  return new Promise((resolve) => {
    signinWindow.once('ready-to-show', resolve);
  });
}
const destroySigninIfOpened = () => {
  return new Promise((resolve) => {
    const allWindows = BrowserWindow.getAllWindows();
    const signinWindowIndex = allWindows.indexOf(signinWindow);
    if (signinWindowIndex !== -1) {
      signinWindow.on('closed', () => {
        resolve();
      });
      allWindows[signinWindowIndex].close();
    } else {
      resolve();
    }
  });
}

let mainWindow
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    resizable: false,
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '/www/preloaders/main-preloader.js')
    }
  })
  mainWindow.loadFile('src/www/main.html')
  mainWindow.openDevTools()
  return new Promise((resolve) => {
    mainWindow.once('ready-to-show', resolve);
  });  
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

  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    requestRetries: 5,
    autoReconnect: true
  })

  try {
    await client.start({
      onError: (err) => {
        throw new Error(err.message)
      },
    })
  } catch (err) {

    await createSigninWindow()
    await client.start({
      phoneNumber: async () => await waitForIpcEventSignin('get-phone-number'),
      phoneCode: async () => await waitForIpcEventSignin('get-sms-confirm'),
      password: async () => await waitForIpcEventSignin('get-2fa-pass'),
      onError: (err) => console.log(err),
    });

  } finally {
    console.log("You should now be connected.");  
    await fs.writeFile(sessionStorage, client.session.save())

    await destroySigninIfOpened()        
    await createMainWindow()
  }

}

/**
 * [gotTheLock description]
 * Second instance restriction
 */
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      const existingWindow = allWindows[0]
      existingWindow.isMinimized() ? existingWindow.restore() : null
      existingWindow.focus()
    }
  })
}

/**
 * Application start
 */
app.whenReady().then(async () => {
  await init()
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await init()
    }
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/**
 * Messenger API
 */
function serializeAllObjects(obj) {
    const visited = new WeakSet();

    function serialize(value) {
        if (typeof value !== 'object' || value === null) {
            return value; // Примитивное значение
        }

        if (visited.has(value)) {
            return '[Circular]'; // Обработка зацикливания
        }

        visited.add(value);

        if (Array.isArray(value)) {
            return value.map(item => serialize(item)); // Обработка массива
        }

        const serializedObj = {};
        for (const key in value) {
            serializedObj[key] = serialize(value[key]); // Рекурсивный обход объекта
        }
        return serializedObj;
    }

    return serialize(obj);
}
ipcMain.on('get-all-chats', async (e) => {
  const chats = await client.getDialogs();
  const serializedObj = serializeAllObjects(chats);
  const jsonString = JSON.stringify(serializedObj);
  e.sender.send('get-all-chats', jsonString);
})