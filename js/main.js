const electron = require('electron')
const {app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
let win
const { fork } = require('child_process')
const ps = fork(`${__dirname}\\server.js`)

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }

})
app.allowRendererProcessReuse = false;

function createWindow() {
    win = new BrowserWindow({
        width: 1010, 
        height: 840,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    electron.Menu.setApplicationMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../page/apiPage.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open DevTools.
    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

ipcMain.on('result',(event,arg) =>{
    event.reply('re', arg)
})

ipcMain.on('addScriptMes',(event,arg) =>{
    event.reply('addScriptMes', arg)
})

ipcMain.on('addGameMes',(event,arg) =>{
    event.reply('addGameMes', arg)
})

ipcMain.on('gameSettingMes',(event,arg) =>{
    event.reply('gameSettingMes', arg)
})

ipcMain.on('updateGameMes',(event,arg) =>{
    event.reply('updateGameMes', arg)
})

ipcMain.on('addCurrencyMes',(event,arg) =>{
    event.reply('addCurrencyMes', arg)
})

ipcMain.on('currencySettingMes',(event,arg) =>{
    event.reply('currencySettingMes', arg)
})

ipcMain.on('updateCurrencyMes',(event,arg) =>{
    event.reply('updateCurrencyMes', arg)
})