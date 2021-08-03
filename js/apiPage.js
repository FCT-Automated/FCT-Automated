$(function() {
    var sqlite = require('../js/sqlite')
    //----------------Loading---------------
    //呼叫redis連線
    const client =  sqlite.connectRedis(15)
    //get redis datas
    const datalist = ['LanguageID','Currency','GameID']
    datalist.forEach(element =>
        client.hgetall(element, (error, res) => {
            if (!error) {
                const selects = document.getElementsByClassName(element)
                for (let select of selects) {
                    $.each(res,function(key,value){
                        var opt = document.createElement('option')
                        opt.value = value
                        opt.innerHTML = key+':'+value
                        select.appendChild(opt)
                    })
                }
            }else{
                console.log(error)
            }
        })
    )
    //-------監聽button並回傳-------------
    var apiJs = require('../js/api')
    var open = require('../js/openChrome')
    const SendApiBtn = document.getElementById('SendApiBtn')
    let {ipcRenderer} = require('electron')
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
                client.get('chromePath', async function(err,path){
                    mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']
                    if (!err) {    
                        await open.openChrome(response.Url,path,args['GameID'],"Normal")
                        ipcRenderer.send('result',mes+" 登入成功!! ]")
                    }else{
                        console.log(err)
                        ipcRenderer.send('result',mes+" 登入失敗，請查看console訊息!! ]")
                    }
                })
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
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+' '+time;
        return dateTime
    }

    const result = document.getElementById("result")
    ipcRenderer.on('re', (event, arg) => {
        result.innerHTML = arg
    })
    //-------field Show or Hide--------
    var selectElement = document.getElementById('API')
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
    //-------event--------
    var attend = document.getElementById('attend')
    var notattend = document.getElementById('notattend')
    var eventlist = document.getElementById('Event')
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
                    var opt = document.createElement('option')
                    opt.value = datas['eventID']
                    opt.innerHTML = datas['eventID']
                    eventlist.appendChild(opt)
                })
            }
        }
    })
    notattend.addEventListener('change',function(){
        if (this.checked){
            eventlist.disabled=true
        }
    })

    
})
