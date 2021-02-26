const electron = require('electron')
const {app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

let win

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

function createWindow() {
    win = new BrowserWindow({
        width: 1010, 
        height: 650,
        webPreferences: {
            nodeIntegration: true
        }
    })
    electron.Menu.setApplicationMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'APIpage.html'),
        protocol: 'file:',
        slashes: true
    }))
    

    // Open DevTools.
    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

ipcMain.on('formData',(event,arg) =>{
    event.reply('re', arg)
})
