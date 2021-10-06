$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron')
    const net = electron.remote.net;
    var apiJs = require('../js/api');
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var eventlist = document.getElementById('Event');
    var open = require('../js/openChrome');
    const addScriptMes = document.getElementById("addScriptMes");
    const scriptPageMes = document.getElementById("scriptPageMes");
    

    var mes = '';
    var chromePath = await getLocalhostApi('/getChromePath');
    var apiUrl = await getLocalhostApi('/getApiUrl');
    var seamlessApiUrl = await getLocalhostApi('/getSeamlessApiUrl');

    const addScriptListRow = document.getElementById('addScriptListRow');
    const addScriptBtn = document.getElementById('addScript');
    const openDemoBtn = document.getElementById('OpenDemoBtn');
    const autoStartBtn = document.getElementById('autoStartBtn')
    var table = document.getElementById('addScriptTable');
    var DemoGameID = document.getElementById("DemoGameID");    
    
    //-------init---------------
    var returnObject = await getLocalhostApi('/getCurrencyList');
    var obj = returnObject['returnObject'];
    var select = document.getElementById("Currency");
    if (obj != null){
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            select.appendChild(opt)
        }
    }else{
        select.innerHTML = '<option>查無資料</option>'
    }
    
    
    returnObject = await getLocalhostApi('/getGameList');
    obj = returnObject['returnObject'];
    select = document.getElementById("GameID");
    if (obj != null){
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            select.appendChild(opt)
        }
    }else{
        select.innerHTML = '<option>查無資料</option>'
    }
    if (obj != null){
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            DemoGameID.appendChild(opt)
        }
    }else{
        DemoGameID.innerHTML = '<option>查無資料</option>'
    }

    returnObject = await getLocalhostApi('/getLanguageList');
    obj = returnObject['returnObject'];
    select = document.getElementById("LanguageID");
    if (obj != null){
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            select.appendChild(opt)
        }
    }else{
        select.innerHTML = '<option>查無資料</option>'
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
            if(chromePath == ''){
                mes += "chromePaht 不可空白</br>"
            }
            if(apiUrl == ''){
                mes += "apiUrl 不可空白</br>"
            }
            if(seamlessApiUrl == ''){
                mes += "seamlessApiUrl 不可空白</br>"
            }
            if(chromePath == '' | apiUrl == '' | seamlessApiUrl == ''){
                ipcRenderer.send('scriptPageMes',mes)
            }else{
                let Eventresult = await apiJs.requestAPI(args,apiUrl)
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
    addScriptListRow.addEventListener('click',function(){
        let rows = table.rows.length
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
    })
 
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
        if(chromePath == ''){
            mes += "chromePaht 不可空白</br>"
        }
        if(apiUrl == ''){
            mes += "apiUrl 不可空白</br>"
        }
        if(seamlessApiUrl == ''){
            mes += "seamlessApiUrl 不可空白</br>"
        }
        if(chromePath == '' | apiUrl == '' | seamlessApiUrl == ''){
            ipcRenderer.send('scriptPageMes',mes)
        }else{
            response = await apiJs.requestAPI(args,apiUrl)
            await open.openChrome(response.Url,chromePath,args['GameID'],"Demo")
        }
        
        
    })


//  開始跑自動腳本
    autoStartBtn.addEventListener('click', async function(event){
        event.preventDefault();
        if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
            let response;
            let data;
            let scriptName = $("#scriptlist option:selected").text();
            let args ={
                API : document.getElementById("API").value,
                Currency : document.getElementById("Currency").value,
                GameID : document.getElementById("GameID").value,
                AgentCode : document.getElementById("AgentCode").value,
                MemberAccount : document.getElementById("MemberAccount").value,
                LanguageID : document.getElementById("LanguageID").value
            }
            
            if(chromePath == ''){
                mes += "chromePaht 不可空白</br>"
            }
            if(apiUrl == ''){
                mes += "apiUrl 不可空白</br>"
            }
            if(seamlessApiUrl == ''){
                mes += "seamlessApiUrl 不可空白</br>"
            }
            if(chromePath == '' | apiUrl == '' | seamlessApiUrl == ''){
                ipcRenderer.send('scriptPageMes',mes)
            }else{
                response = await apiJs.requestAPI(args,apiUrl);
                data = await psotLocalhostApi('/getScript',scriptName);
                data['user'] = args
                data['apiUrl'] = apiUrl
                data['seamlessApiUrl'] = seamlessApiUrl
                await open.openChrome(response.Url,chromePath,args['GameID'],data);
            } 
        }else{
            ipcRenderer.send('scriptPageMes',"有欄位未填寫!");
        }
    })



    //--------------------
    //確定新增按鈕
    addScriptBtn.addEventListener('click',async function(event){
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
                        ipcRenderer.send('scriptPageMes',scriptName+"新增成功!");
                        getScriptKeys();
                        $(this).prev().click()
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

    function delRowFunction(btnHtml){
        let targetRow = parseInt(btnHtml.id.split('delBtn')[1])-1
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

    ipcRenderer.on('addScriptMes', (event, arg) => {
        addScriptMes.innerHTML = arg
    })

    ipcRenderer.on('scriptPageMes', (event, arg) => {
        scriptPageMes.innerHTML = arg
    })

})





