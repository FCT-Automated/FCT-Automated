$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron')
    const net = electron.remote.net;
    var apiJs = require('./api');
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var eventlist = document.getElementById('Event');
    var open = require('./openChrome');
    const addScriptMes = document.getElementById("addScriptMes")

    const addBtn = document.getElementById('addBtn');
    const saveScriptBtn = document.getElementById('scriptSave');
    const openDemoBtn = document.getElementById('OpenDemoBtn');
    // const AutoStartBtn = document.getElementById('AutoStartBtn')
    var table = document.getElementById('addScriptTable');
    var DemoGameID = document.getElementById("DemoGameID");    

    var obj = await getLocalhostApi('/getCurrencyList');
    var select = document.getElementById("Currency");

    //-------init---------------
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    obj = await getLocalhostApi('/getGameList');
    select = document.getElementById("GameID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        DemoGameID.appendChild(opt)
    }
    obj = await getLocalhostApi('/getLanguageList');
    select = document.getElementById("LanguageID");
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = obj[key]
        opt.innerHTML = key+':'+obj[key]
        select.appendChild(opt)
    }
    getScriptKeys();

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
    // ------------------------

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

    function psotLocalhostApi(path,data){
        return new Promise((resv, rej) => {
            var body = JSON.stringify(data);
            const request = net.request({
                method: 'POST',
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
            request.write(body, 'utf-8');
            request.end();
        })

    }

    //--------------------
    //掛機腳本設定
    addBtn.addEventListener('click',function(){
        let rows = table.rows.length
        addRowFunction(rows)
    })
    function addRowFunction(rows){
        let row = table.insertRow(-1)
        let id = row.insertCell(0)
        let action = row.insertCell(1)
        let actiontext = row.insertCell(2)
        let delBtn = row.insertCell(3)
        id.innerHTML = String(rows+1)
        //建立select+option
        let scriptSelect = document.createElement('select')
        let opts={
            "click":"滑鼠點擊",
            "wait":"等待",
            "setpoints-normal":"轉點-轉帳錢包",
            "setpoints-seamless":"轉點-單一錢包",
            "refresh":"重整"
        }
        scriptSelect.id ="actionList"+String(rows+1)
        for (const [key, value] of Object.entries(opts)) {
            let opt = document.createElement('option')
            opt.value = key
            opt.innerHTML = value
            scriptSelect.appendChild(opt)
        }
        scriptSelect.onchange = function(){actionListFunction(scriptSelect)} 
        action.appendChild(scriptSelect) 
        //建立input
        let input = document.createElement('input')
        input.id = "actionText"+String(rows+1)
        input.placeholder = "請輸入座標位置> {x: ,y: }"
        input.required = true;
        actiontext.appendChild(input)
        //建立delBtn
        let btn = document.createElement('Button')
        let btnicon = document.createElement('i')
        btn.className = "btn btn-default"
        btn.type = "button"
        btn.id = "delBtn"+String(rows+1)
        btn.onclick = function(){delRowFunction(btn)} 
        btnicon.className = "fas fa-trash-alt"
        btn.appendChild(btnicon)
        delBtn.appendChild(btn)
    }
    //開啟demo帳號按鈕
    openDemoBtn.addEventListener('click', async function(){
        let response;
        let args ={
            API : 'GetDemoUrl',
            Currency : "CNY",
            GameID : DemoGameID.value,
            LanguageID : 2,
            AgentCode : "FCT"
            }
        response = await apiJs.requestAPI(args)
        await open.openChrome(response.Url,await getLocalhostApi('/getChromePath'),args['GameID'],"Demo")
        
    })


//     //開始跑自動腳本
//     AutoStartBtn.addEventListener('click', async function(event){
        //event.preventDefault();
//         let args ={
//             API : document.getElementById("API").value,
//             Currency : document.getElementById("Currency").value,
//             GameID : document.getElementById("GameID").value,
//             AgentCode : document.getElementById("AgentCode").value,
//             MemberAccount : document.getElementById("MemberAccount").value,
//             LanguageID : document.getElementById("LanguageID").value
//         }
        
//         let url = await api.requestAPI(args)
//         client.get('chromePath', async function(err,path){
//             if (!err) {
//                 let datas = await getScriptListData(document.getElementById('scriptlist').value,client2)
//                 await open.openChrome(url.Url,path,args['GameID'],datas)
//             }else{
//                 console.log(err)
//             }
//         })  
//     })



    //--------------------
    //確定新增按鈕
    saveScriptBtn.addEventListener('click',async function(event){
        event.preventDefault();
        let rowLength = table.rows.length
        let eleScriptName = document.getElementById('scriptName');
        let scriptName = eleScriptName.value.replaceAll(" ","");
        if (rowLength !=0) {
            if(eleScriptName.checkValidity()){
                let scriptdata = {};
                scriptdata[scriptName] = {};
                let key;
                let value;
                for (let i = 0; i < rowLength; i++){
                    key = (i+1).toString()+"_" +table.rows.item(i).cells[1].children[0].value 
                    value = table.rows.item(i).cells[2].children[0].value.replaceAll(" ","")
                    if (value !="" | key.includes('refresh')){
                        scriptdata[scriptName][key] = value
                    }else{
                        break
                    }                
                }
                if (Object.keys(scriptdata[scriptName]).length == rowLength){
                    let response = await psotLocalhostApi('/addScript',scriptdata)
                    if (response['returnObject'] == null){
                        console.log("新增成功");
                        getScriptKeys();
                        $(this).prev().click()
                        eleScriptName.value = "";
                        $("#addScriptTable tr").remove();
                    }else{
                        ipcRenderer.send('addScriptMes',response['returnObject']);
                    }
                }else{
                    ipcRenderer.send('addScriptMes',"內容不可空白!");
                }
                
            }else{
                ipcRenderer.send('addScriptMes',"腳本名稱不可空白!");
            }
        }else{
            ipcRenderer.send('addScriptMes',"至少新增一列!");
        }
        
    })

    async function getScriptKeys(){
        select = document.getElementById("scriptlist");
        select.options.length = 0;
        obj = await getLocalhostApi('/getScriptKeys');
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = obj[key]
            select.appendChild(opt)
        }
    }
    ipcRenderer.on('addScriptMes', (event, arg) => {
        addScriptMes.innerHTML = arg
    })
})

function actionListFunction(selectHtml){
    let target = selectHtml.parentElement.parentElement.getElementsByTagName('td')[2].firstElementChild
    target.disabled = false
    target.value = "";
    switch (selectHtml.value){
        case 'click':
            target.setAttribute('required',"")
            target.placeholder = "請輸入座標位置：{x: ,y: }"
            break
        case 'wait':
            target.setAttribute('required',"")
            target.placeholder = "請輸入等待時間(秒)：5"
            break
        case 'setpoints-normal':
            target.setAttribute('required',"")
            target.placeholder = "請輸入點數：10000"
            break
        case 'setpoints-seamless':
            target.setAttribute('required',"")
            target.placeholder = "請輸入點數：10000"
            break
        case 'refresh':
            target.placeholder = ""
            target.disabled = true
            target.removeAttribute('required')
            break
    }
}

function delRowFunction(btnHtml){
    let targetRow = parseInt(btnHtml.id.split('delBtn')[1])-1
    let table = document.getElementById("addScriptTable")
    table.deleteRow(targetRow)
    table.rows.forEach(function(ele,ind){
        let target = ele.getElementsByTagName('td')[0]
        if (target.innerHTML != String(ind+1)){
            document.getElementById("actionList"+String(target.innerHTML)).id = "actionList"+String(ind+1)
            document.getElementById("actionText"+String(target.innerHTML)).id = "actionText"+String(ind+1)
            document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind+1)
            target.innerHTML = String(ind+1)
        }
    })
}

// function updateScriptList(keys){
//     let selects = document.getElementById('scriptlist')
//     if (selects.options.length > 0){
//         selects.querySelectorAll('option').forEach(o => o.remove())
//     }
//     for(let i = 0 ,len = keys.length ; i < len ; i++){
//         let opt = document.createElement('option')
//         opt.value = keys[i]
//         opt.innerHTML = keys[i]
//         selects.appendChild(opt)
//     }
// }

