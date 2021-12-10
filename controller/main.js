// const electron = require('electron')
const {app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
let win
const { fork } = require('child_process')
const ps = fork(`${__dirname}//server.js`)

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
        maxWidth : 804, 
        minWidth : 804,
        maxHeight : 600,
        minHeight :600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    // electron.Menu.setApplicationMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../view/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open DevTools.
    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
        ps.kill();
    })
}


