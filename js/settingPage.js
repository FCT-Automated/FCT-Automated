$(async function() {
    var redis = require('../js/redis')
    //------redis連線---------
    const client = redis.connectRedis(15) //設定擋資料
    const client2 = redis.connectRedis(14) //腳本資料
    //取得redis 'LanguageID','Currency','GameID' 資料 並監聽btn
    const datalist = ['LanguageID','Currency','GameID']
    datalist.forEach(function(element){
        let btnEdit = document.getElementById(element+'Edit')
        let btnUpdate = document.getElementById(element+'Update')
        btnEdit.addEventListener("click",async () =>{ 
            redis.dataEdit(element,client)
        })
        btnUpdate.addEventListener("click",async () =>{ 
            redis.updatePath(element,'json',client)
        })
        
        client.hgetall(element, (error, result) => {
            if (!error) {
                var ele = document.getElementById(element)
                if (result!= null){
                    ele.innerHTML = JSON.stringify(result)
                }
                if(element == 'GameID'){
                    let selects = document.getElementsByClassName(element)
                    for (let select of selects) {
                        $.each(result,function(key,value){
                            var opt = document.createElement('option')
                            opt.value = value
                            opt.innerHTML = key+':'+value
                            select.appendChild(opt)
                        })
                    }
                }
            }
            else{
                console.log(error)
            }
        })
    })

    //chromePathUpdate
    // var path;
    // var PathbtnUpdate = document.getElementById('chromePathUpdate');
    // PathbtnUpdate.addEventListener("click",async () =>{ 
    //     sqlite.updatePath('chromePath',document.getElementById('chromePathbody').value);
    //     document.getElementById('chromePathUpdateMes').innerHTML = '更新成功' ;
    // });
    // sqlite.getPath('chromePath');

    //取得redis腳本清單 並監聽btn
    updateTable()
    

    //-----------------------------------------------------
    //宣告
    const addBtn = document.getElementById('addBtn')
    const editAddBtn = document.getElementById('editAddBtn')
    const saveScriptBtn = document.getElementById('scriptSave')
    const scriptUpdate = document.getElementById('scriptUpdate')
    const openDemoBtns = document.getElementsByClassName('OpenDemoBtn')
    var api = require('../js/api')
    var open = require('../js/openChrome')
    var addTable = document.getElementById('addTable')
    var editTable = document.getElementById('editTable')
    //--------------------

    //開啟demo帳號按鈕
    for (let demoBtn of openDemoBtns){
        let typeName = demoBtn.className.split(" ")[0]
        demoBtn.addEventListener('click', async function(){
            let gameid = document.getElementById(typeName+"DemoGameID").value
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
    }
    
    //--------------------
    //掛機腳本設定
    addRowFunction(0,null,addTable)
    addBtn.addEventListener('click',function(){
        let rows = addTable.rows.length
        addRowFunction(rows,null,addTable)
    })
    editAddBtn.addEventListener('click',function(){
        let rows = editTable.rows.length
        addRowFunction(rows,null,editTable)
    })
    function addRowFunction(rows,data,table){
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
        btn.onclick = function(){delTableRowFunction(btn,table)} 
        btnicon.className = "fas fa-trash-alt"
        btn.appendChild(btnicon)
        delBtn.appendChild(btn)
        if (data){
            select.value = Object.keys(data)[0].split("_")[1]
            input.value = Object.values(data)[0]
            if (select.value == 'kickout'){
                input.disabled = true
                input.placeholder = ""
            }
        }
    }
    //--------------------
    //確定新增按鈕
    saveScriptBtn.addEventListener('click',async function(){
        let rowLength = addTable.rows.length
        let scriptName = document.getElementById('scriptName').value
        if (rowLength != 0 && scriptName != ''){
            let scriptdata = {}
            let key
            let value
            for (let i = 0; i < rowLength; i++){
                key = (i+1).toString()+"_" +addTable.rows.item(i).cells[1].children[0].value 
                value = addTable.rows.item(i).cells[2].children[0].value
                scriptdata[key] = value
            }
            //儲存至redis
            redis.scriptSave(scriptName,scriptdata,client2)
            updateTable()
        }else{
            console.log("至少新增一列且腳本名稱必填!!")
        }
        
    })
    //確定修改
    scriptUpdate.addEventListener('click',async function(){
        let rowLength = editTable.rows.length
        let scriptName = document.getElementById('editScriptName').value
        if (rowLength != 0 && scriptName != ''){
            let scriptdata = {}
            let key
            let value
            for (let i = 0; i < rowLength; i++){
                key = (i+1).toString()+"_" +editTable.rows.item(i).cells[1].children[0].value 
                value = editTable.rows.item(i).cells[2].children[0].value
                scriptdata[key] = value
            }
            //儲存至redis
            redis.scriptSave(scriptName,scriptdata,client2)
            updateTable()
        }else{
            console.log("至少新增一列且腳本名稱必填!!")
        }
    })
    //--------------------

    async function updateTable(){
        let scriptlist = document.getElementById('scriptlist')
        scriptlist.innerHTML = ""
        let keys = await redis.getScriptList(client2)
        keys.forEach(function(name,ind){
            let row = scriptlist.insertRow(0)
            let id = row.insertCell(0)
            let edit = row.insertCell(1)
            let del = row.insertCell(2)
            id.innerHTML = name
            //編輯按鈕
            let btn = document.createElement('Button')
            let btnicon = document.createElement('i')
            btn.className = "btn btn-default"
            btn.type = "button"
            btn.id = 'edit_'+name
            btn.dataset.target="#editScriptModal"
            btn.dataset.toggle="modal"
            btnicon.className = "fas fa-edit"
            btn.appendChild(btnicon)
            edit.appendChild(btn)
            btn.onclick = async function(){
                document.getElementById('editScriptName').value = name
                let datas = await redis.getScriptListData(btn.id.split("_")[1],client2)
                editTable.innerHTML = ""
                for (let key in datas){
                    let rows = editTable.rows.length
                    let data = {}
                    data[key] = datas[key]
                    addRowFunction(rows,data,editTable)
                }
            } 
            
            //刪除按鈕
            let btn2 = document.createElement('Button')
            let btnicon2 = document.createElement('i')
            btn2.className = "btn btn-default"
            btn2.type = "button"
            btn2.id = 'del_'+name
            btnicon2.className = "fas fa-trash-alt"
            btn2.appendChild(btnicon2)
            del.appendChild(btn2)
            btn2.onclick = async function(){
                await redis.delscriptlistRow(btn2.id,client2)
                updateTable()
            } 
        
        })
    }

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

function delTableRowFunction(btnHtml,table){
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

