$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron')
    const net = electron.remote.net;
    var apiJs = require('../js/api');
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var eventlist = document.getElementById('Event');
    var selectElement = document.getElementById('API');
    var open = require('../js/openChrome')
    const SendApiBtn = document.getElementById('SendApiBtn')
    const result = document.getElementById("result")


    var obj = await localhostApi('/getCurrencyList');
    var select = document.getElementById("Currency");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    obj = await localhostApi('/getGameList');
    select = document.getElementById("GameID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    obj = await localhostApi('/getLanguageList');
    select = document.getElementById("LanguageID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }

    

    
    selectElement.addEventListener('change', function(){
        changeAPIForm(document.getElementById('API').value)
    })
    function changeAPIForm(curAPI){
        switch (curAPI) {
            case 'Login':
                $('.field_Login').show()
                $('.field_SetPoints').hide()
                break
            case 'SetPoints':
                $('.field_SetPoints').show()
                $('.field_Login').hide()
                break
            case 'KickOut':
                $('.field_SetPoints').hide()
                $('.field_Login').hide()
                break
        }
    }

    
    attend.addEventListener('change',async function(){
        if (this.checked){
            eventlist.disabled=false
            let args ={
                API : 'GetEvents',
                Currency : document.getElementById("Currency").value,
                AgentCode : document.getElementById("AgentCode").value,
            }
            let Eventresult = await apiJs.requestAPI(args)
            if (Eventresult['Data'] != null){
                console.log(Eventresult['Data'])
                Eventresult['Data'].forEach(function(datas){
                    let opt = document.createElement('option')
                    opt.value = datas['eventID']
                    opt.className = 'eventOption'
                    opt.innerHTML = datas['eventID']
                    eventlist.appendChild(opt)
                })
            }else{
                let opt = document.createElement('option')
                opt.className = 'eventOption'
                opt.innerHTML = '查無活動'
                eventlist.appendChild(opt)
            }
        }
    })
    //待處理remove options
    notAttend.addEventListener('change',function(){
        if(eventlist.childNodes.length > 0){
            let options = document.getElementsByClassName('eventOption');
            for(let option of options){
                option.remove();
            }
        }
        if (this.checked){
            eventlist.disabled=true
        }
    })


    function localhostApi(path){
        return new Promise((resv, rej) => {
            const request = net.request({
                method: 'GET',
                protocol: 'http:',
                hostname: '127.0.0.1',
                port: 9000,
                path: path
            });
            request.setHeader('Content-Type', 'application/json');
            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    resv(JSON.parse(chunk))
                });
            });
            request.on('abort', () => {
                console.log('Request is Aborted')
            });
            request.on('error', (error) => {
                console.log(`ERROR: ${JSON.stringify(error)}`)
            });
            request.end();
        })

    }
    
    SendApiBtn.addEventListener("click",async () => { 
        let api = document.getElementById("API").value
        let args
        let response
        let mes
        switch (api) {
            case 'Login':
                args ={
                    API : api,
                    Currency : document.getElementById("Currency").value,
                    GameID : document.getElementById("GameID").value,
                    AgentCode : document.getElementById("AgentCode").value,
                    MemberAccount : document.getElementById("MemberAccount").value,
                    LanguageID : document.getElementById("LanguageID").value
                }
                response = await apiJs.requestAPI(args)
                mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']
                await open.openChrome(response.Url,await localhostApi('/getChromePath'),args['GameID'],"Normal")
                //待處理-訊息可做再開啟那
                ipcRenderer.send('result',mes+" 登入成功!! ]")
                break

            case 'SetPoints':
                let wallet = document.getElementById("Wallet")
                if (wallet.options[wallet.selectedIndex].id == "seamlessWallet"){
                    args = {
                        API : 'SetJson',
                        Currency : document.getElementById("Currency").value,
                        AgentCode : document.getElementById("AgentCode").value,
                        MemberAccount : document.getElementById("MemberAccount").value,
                        Points : document.getElementById("Points").value
                    }
                    response = await apiJs.requestSeamlessAPI(args)
                    mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]
                    if (response.Result == "0"){
                        ipcRenderer.send('result',mes+" 轉點成功!! 餘額: "+response.Points+"]")
                    }else{
                        ipcRenderer.send('result',mes+" 轉點失敗!! - result:"+response.Result+"]")
                    }
                }else{
                    args = {
                        API : api,
                        Currency : document.getElementById("Currency").value,
                        AgentCode : document.getElementById("AgentCode").value,
                        MemberAccount : document.getElementById("MemberAccount").value,
                        Points : document.getElementById("Points").value
                    }
                    response = await apiJs.requestAPI(args)
                    mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]
                    if (response.Result == "0"){
                        ipcRenderer.send('result',mes+" 轉點成功!! 餘額: "+response.AfterPoint+"]")
                    }else{
                        ipcRenderer.send('result',mes+" 轉點失敗!! - result:"+response.Result+"]")
                    }
                }         
                break
            //待處理
            case 'KickOut':
                args ={
                    API : api,
                    Currency : document.getElementById("Currency").value,
                    AgentCode : document.getElementById("AgentCode").value,
                    MemberAccount : document.getElementById("MemberAccount").value,
                }
                response = await apiJs.requestAPI(args)
                debugger
                break
        }        
        
    })

    function getCurrentDateTime(){
        let today = new Date();
        return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    }

    
    ipcRenderer.on('re', (event, arg) => {
        result.innerHTML = arg
    })


    
})
