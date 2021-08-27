$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron');
    const net = electron.remote.net;
    const scriptListMes = document.getElementById("scriptListMes");
    const scriptSettingMes = document.getElementById("scriptSettingMes");
    const addScriptModal = document.getElementById("addScriptModal");
    const addScriptListRow = document.getElementById('addScriptListRow');
    const openDemoBtn = document.getElementById('OpenDemoBtn');
    var scriptList = document.getElementById("scriptList");

    var addScript = document.getElementById('addScript');
    var updateScript = document.getElementById('updateScript');
    var addTitle = document.getElementById('addTitle');
    var updateTitle = document.getElementById('updateTitle');

    var returnObject = await getLocalhostApi('/getGameList');
    var obj = returnObject['returnObject'];
    if (obj != null){
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            document.getElementById("DemoGameID").appendChild(opt)
        }
    }else{
        document.getElementById("DemoGameID").innerHTML = '<option>查無資料</option>'
    }

    obj = await getLocalhostApi('/getScriptKeys');
    var scriptTable = document.getElementById("scriptTable");
    for (let key in obj){
        let rows = scriptTable.rows.length
        let row = scriptTable.insertRow(-1)
        let id = row.insertCell(0)
        let scriptName = row.insertCell(1)
        let update = row.insertCell(2)
        let del = row.insertCell(3)
        id.innerHTML = String(rows)

        let scriptNameSpan = document.createElement('span')
        scriptNameSpan.id = obj[key]
        scriptNameSpan.innerHTML = obj[key]
        scriptName.appendChild(scriptNameSpan)

        //update
        let updateBtn = document.createElement('Button')
        let updateBtnIcon = document.createElement('i')
        updateBtnIcon.className = "fas fa-edit"
        updateBtn.className = "btn btn-default"
        updateBtn.type = "button"
        updateBtn.id = "update"+String(rows)
        updateBtn.dataset.target="#scriptModal"
        updateBtn.dataset.toggle="modal"
        updateBtn.onclick = async function(){
            addScript.style.display = "none";
            updateScript.style.display = "block";
            addTitle.style.display = "none";
            updateTitle.style.display = "block";
            document.getElementById("ScriptName").value = obj[key];
            document.getElementById("ScriptName").disabled = true;
            $("#scriptList tr").remove();
            let response = await psotLocalhostApi('/getScript',obj[key])
            for (let key in response['returnObject']){
                addRow(key.split("_")[1],response['returnObject'][key]);
            }
            ipcRenderer.send('scriptListMes', "");
        } 
        updateBtn.appendChild(updateBtnIcon)
        update.appendChild(updateBtn)

        //del
        let delBtn = document.createElement('Button')
        let delBtnIcon = document.createElement('i')
        delBtnIcon.className = "fas fa-trash-alt"
        delBtn.className = "btn btn-default"
        delBtn.type = "button"
        delBtn.id = "delBtn"+String(rows)
        delBtn.onclick = async function(){delFunction(obj[key],delBtn)} 
        delBtn.appendChild(delBtnIcon)
        del.appendChild(delBtn)
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

    async function delFunction(key,delBtn){
        let response = await psotLocalhostApi('/delScript',key)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            scriptTable.deleteRow(targetRow)
            scriptTable.rows.forEach(function(ele,ind){
                if(ele.rowIndex!=0){
                    let target = ele.getElementsByTagName('td')[0]
                    document.getElementById("update"+String(target.innerHTML)).id = "update"+String(ind)
                    document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind)
                    target.innerHTML = String(ind)
                }                
                
            })
            ipcRenderer.send('scriptSettingMes', key+"刪除成功!");
        }
    }

    function delRowFunction(btnHtml){
        let targetRow = parseInt(btnHtml.id.split('delBtn')[1])-1
        scriptList.deleteRow(targetRow)
        scriptList.rows.forEach(function(ele,ind){
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

    function addRow(key,value){
        let rows = scriptList.rows.length
        let row = scriptList.insertRow(-1)
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
        for (const [k, v] of Object.entries(opts)) {
            let opt = document.createElement('option')
            opt.value = k
            opt.innerHTML = v
            if( key == k ){
                opt.selected = "selected";
            }
            scriptSelect.appendChild(opt)
        }
        scriptSelect.onchange = function(){actionListFunction(scriptSelect)} 
        action.appendChild(scriptSelect) 
        //建立input
        let input = document.createElement('input')
        input.id = "actionText"+String(rows+1)
        input.placeholder = "請輸入座標位置> {x: ,y: }"
        input.required = true;
        if(key == "refresh"){
            input.disabled = true;
            input.value = "";
            input.placeholder = "";
            
        }else{
            input.value = value;
        }
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

    addScriptListRow.addEventListener('click',function(){
        addRow(null,null)
    })

    addScript.addEventListener('click',async function(event){
        event.preventDefault();
        let rowLength = scriptList.rows.length
        let eleScriptName = document.getElementById('ScriptName');
        let scriptName = eleScriptName.value.replaceAll(" ","");
        if (rowLength !=0) {
            if(eleScriptName.checkValidity()){
                let scriptdata = {};
                scriptdata[scriptName] = {};
                let key;
                let value;
                for (let i = 0; i < rowLength; i++){
                    key = (i+1).toString()+"_" +scriptList.rows.item(i).cells[1].children[0].value 
                    value = scriptList.rows.item(i).cells[2].children[0].value.replaceAll(" ","")
                    if (value !="" | key.includes('refresh')){
                        scriptdata[scriptName][key] = value
                    }else{
                        break
                    }                
                }
                if (Object.keys(scriptdata[scriptName]).length == rowLength){
                    let response = await psotLocalhostApi('/addScript',scriptdata)
                    if (response['returnObject'] == null){
                        $("#scriptModal").modal('hide');
                        location.reload();
                    }else{
                        ipcRenderer.send('scriptListMes',response['returnObject']);
                    }
                }else{
                    ipcRenderer.send('scriptListMes',"內容不可空白!");
                }
                
            }else{
                ipcRenderer.send('scriptListMes',"腳本名稱不可空白!");
            }
        }else{
            ipcRenderer.send('scriptListMes',"至少新增一列!");
        }
    })

    updateScript.addEventListener('click',async function(event){
        event.preventDefault();
        let rowLength = scriptList.rows.length
        let scriptName = document.getElementById('ScriptName').value;
        if (rowLength !=0) {
            let scriptdata = {};
            scriptdata[scriptName] = {};
            let key;
            let value;
            for (let i = 0; i < rowLength; i++){
                key = (i+1).toString()+"_" +scriptList.rows.item(i).cells[1].children[0].value 
                value = scriptList.rows.item(i).cells[2].children[0].value.replaceAll(" ","")
                if (value !="" | key.includes('refresh')){
                    scriptdata[scriptName][key] = value
                }else{
                    break
                }                
            }
            if (Object.keys(scriptdata[scriptName]).length == rowLength){
                let response = await psotLocalhostApi('/updateScript',scriptdata)
                if (response['returnObject'] == null){
                    $("#scriptModal").modal('hide');
                    ipcRenderer.send('scriptSettingMes', scriptName+"修改成功!");
                }else{
                    ipcRenderer.send('scriptListMes',response['returnObject']);
                }
            }else{
                ipcRenderer.send('scriptListMes',"內容不可空白!");
            }
        }else{
            ipcRenderer.send('scriptListMes',"至少新增一列!");
        }
    })

    addScriptModal.addEventListener('click',function(){
        $("#scriptList tr").remove();
        addScript.style.display = "block";
        updateScript.style.display = "none";
        addTitle.style.display = "block";
        updateTitle.style.display = "none";
        document.getElementById("ScriptName").value = "";
        document.getElementById("ScriptName").disabled = false;
        ipcRenderer.send('scriptListMes', "");

    })

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
            ipcRenderer.send('scriptListMes',mes)
        }else{
            response = await apiJs.requestAPI(args,apiUrl)
            await open.openChrome(response.Url,chromePath,args['GameID'],"Demo")
        }
        
        
    })

    ipcRenderer.on('scriptListMes', (event, arg) => {
        scriptListMes.innerHTML = arg
    });

    ipcRenderer.on('scriptSettingMes', (event, arg) => {
        scriptSettingMes.innerHTML = arg
    });
    
});





