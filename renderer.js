var api = require('./api')
var open = require('./openChromium')

//---------------HtmlListener---------------
let {ipcRenderer} = require('electron')

const btn = document.getElementById('SendApi')
const result = document.getElementById("result")

btn.addEventListener("click",async () =>{ 
    let args ={
        API : document.getElementById("API").value,
        Currency : document.getElementById("Currency").value,
        GameID : document.getElementById("GameID").value,
        AgentCode : document.getElementById("AgentCode").value,
        MemberAccount : document.getElementById("MemberAccount").value,
        LanguageID : document.getElementById("LanguageID").value
    }
    let url = await api.requestAPI(args)
    await open.openChromium(url.Url)
    ipcRenderer.send('formData',url.Url)
})

ipcRenderer.on('re', (event, arg) => {
    result.innerHTML = arg
  })
