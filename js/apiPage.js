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

    var obj = await getLocalhostApi('/getCurrencyList');
    var select = document.getElementById("Currency");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = key
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    obj = await getLocalhostApi('/getGameList');
    select = document.getElementById("GameID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = key
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    obj = await getLocalhostApi('/getLanguageList');
    select = document.getElementById("LanguageID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = key
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }

    function getLocalhostApi(path){
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
    notAttend.addEventListener('change',function(){
        eventlist.options.length = 0;
        if (this.checked){
            eventlist.disabled=true
        }
        
    })
    
    SendApiBtn.addEventListener("click",async (event) => { 
        event.preventDefault();
        if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
            let api = document.getElementById("API").value
            let args
            let response
            let mes
            let code
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
                    code = response.Result;
                    if ( code == 0){
                        await open.openChrome(response.Url,await getLocalhostApi('/getChromePath'),args['GameID'],"Normal")
                        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入成功!! ]"
                    }else{
                        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入失敗 - Error Code："+code+"!! ]"
                    }
                    ipcRenderer.send('result',mes)
                    
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
                        code = response.Result;
                        if ( code == 0){
                            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.Points+"]"
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
                        code = response.Result;
                        if ( code == 0){
                            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.AfterPoint+"，BankID："+response.BankID+"]"
                        }
                    }
                    if(code !=0){
                        mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 轉點失敗!! - Error Code："+code+"]"
                    }
                    ipcRenderer.send('result',mes)
                    break

                case 'KickOut':
                    args ={
                        API : api,
                        Currency : document.getElementById("Currency").value,
                        AgentCode : document.getElementById("AgentCode").value,
                        MemberAccount : document.getElementById("MemberAccount").value,
                    }
                    response = await apiJs.requestAPI(args)
                    code = response.Result;
                    if ( code == 0){
                        mes = "Log:[ KickOut- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出成功!! ]"
                    }else{
                        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出失敗 - Error Code："+code+"!! ]"
                    }
                    ipcRenderer.send('result',mes)
                    break
            }    
        }else{
            ipcRenderer.send('result',"有欄位未填寫!");
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
