$(async function() {
    //----------------Loading---------------
    //呼叫redis連線
    const client = await connectRedis(15)
    const client2 = await connectRedis(14)
    //get redis datas
    const datalist = ['LanguageID','Currency','GameID']
    datalist.forEach(element =>
        client.hgetall(element, (error, res) => {
            if (!error) {
                let selects = document.getElementsByClassName(element)
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
    //取得所有腳本
    var keys = await getScriptList(client2)
    updateScriptList(keys)
    
    //-----------------------------------------------------
    //宣告
    const addBtn = document.getElementById('addBtn')
    const saveScriptBtn = document.getElementById('scriptSave')
    const openDemoBtn = document.getElementById('OpenDemoBtn')
    const AutoStartBtn = document.getElementById('AutoStartBtn')
    var api = require('./js/api')
    var open = require('./js/openChrome')
    var table = document.getElementById('addTable')
    //--------------------

    //開始跑自動腳本
    AutoStartBtn.addEventListener('click', async function(){
        let args ={
            API : document.getElementById("API").value,
            Currency : document.getElementById("Currency").value,
            GameID : document.getElementById("GameID").value,
            AgentCode : document.getElementById("AgentCode").value,
            MemberAccount : document.getElementById("MemberAccount").value,
            LanguageID : document.getElementById("LanguageID").value
        }
        
        let url = await api.requestAPI(args)
        client.get('chromePath', async function(err,path){
            if (!err) {
                let datas = await getScriptListData(document.getElementById('scriptlist').value,client2)
                await open.openChrome(url.Url,path,args['GameID'],datas)
            }else{
                console.log(err)
            }
        })  
    })

    //開啟demo帳號按鈕
    openDemoBtn.addEventListener('click', async function(){
        let gameid = document.getElementById("DemoGameID").value
        let args = {}
        args ={
            API : 'GetDemoUrl',
            Currency : "CNY",
            GameID : gameid,
            LanguageID : 2,
            AgentCode : "FCT"
            }
        let url = await api.requestAPI(args)
        client.get('chromePath', async function(err,path){
            if (!err) {
                await open.openChrome(url.Url,path,args['GameID'],"Demo")
            }else{
                console.log(err)
            }
        })  
    })
    //--------------------
    //掛機腳本設定
    addRowFunction(0)
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
        let select = document.createElement('select')
        let opts={
            "click":"滑鼠點擊",
            "wait":"等待",
            "setpoints-normal":"轉點-轉帳錢包",
            "setpoints-seamless":"轉點-單一錢包",
            "kickout":"重整"
        }
        select.id ="actionList"+String(rows+1)
        for (const [key, value] of Object.entries(opts)) {
            let opt = document.createElement('option')
            opt.value = key
            opt.innerHTML = value
            select.appendChild(opt)
        }
        select.onchange = function(){actionListFunction(select)} 
        action.appendChild(select) 
        //建立input
        let input = document.createElement('input')
        input.id = "actionText"+String(rows+1)
        input.placeholder = "請輸入座標位置> {x: ,y: }"
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
    //--------------------
    //確定新增按鈕
    saveScriptBtn.addEventListener('click',async function(){
        let rowLength = table.rows.length
        let scriptName = document.getElementById('scriptName').value
        if (rowLength !=0 && scriptName != '') {
            let scriptdata = {}
            let key
            let value
            for (let i = 0; i < rowLength; i++){
                key = (i+1).toString()+"_" +table.rows.item(i).cells[1].children[0].value 
                value = table.rows.item(i).cells[2].children[0].value
                scriptdata[key] = value
            }
            //儲存至redis
            scriptSave(scriptName,scriptdata,client2)
            keys = await getScriptList(client2)
            updateScriptList(keys)
        }else{
            console.log("至少新增一列且腳本名稱必填!!")
        }
        
    })
    //--------------------
})

function actionListFunction(selectHtml){
    let target = selectHtml.parentElement.parentElement.getElementsByTagName('td')[2].firstElementChild
    target.disabled = false
    switch (selectHtml.value){
        case 'click':
            target.placeholder = "請輸入座標位置：{x: ,y: }"
            break
        case 'wait':
            target.placeholder = "請輸入等待時間(秒)：5"
            break
        case 'setpoints-normal':
            target.placeholder = "請輸入點數：10000"
            break
        case 'setpoints-seamless':
            target.placeholder = "請輸入點數：10000"
            break
        case 'kickout':
            target.placeholder = ""
            target.disabled = true
            break
    }
}

function delRowFunction(btnHtml){
    let targetRow = parseInt(btnHtml.id.split('delBtn')[1])-1
    let table = document.getElementById("addTable")
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

function updateScriptList(keys){
    let selects = document.getElementById('scriptlist')
    if (selects.options.length > 0){
        selects.querySelectorAll('option').forEach(o => o.remove())
    }
    for(let i = 0 ,len = keys.length ; i < len ; i++){
        let opt = document.createElement('option')
        opt.value = keys[i]
        opt.innerHTML = keys[i]
        selects.appendChild(opt)
    }
}

