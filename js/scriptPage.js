
$(function() {
    var addTable = document.getElementById('addTable');
    var addMessage = document.getElementById("addMessage");

    setList(parent.gameList,"DemoGameID");
    setKeys(parent.scriptList,"list");

    const submit = document.getElementById('submit');
    const addRowBtn = document.getElementById('addRowBtn');
    const demoBtn = document.getElementById('demoBtn');
    const addBtn = document.getElementById('addBtn');
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    

    attend.addEventListener('change',function(){
        isAttendCheck(this.checked);
    });

    notAttend.addEventListener('change',function(){
        isAttendCheck(false);
    });

    addRowBtn.addEventListener('click',function(){
        addRow();
    });

    demoBtn.addEventListener('click', async function(){
        runDemoAccount();
    });

    addBtn.addEventListener('click',async function(){
        addScript();
    });

    submit.addEventListener('click',function(event){
        run(event)
    });

    function addRow(){
        let rows = addTable.rows.length
        let row = addTable.insertRow(-1)
        let id = row.insertCell(0)
        let action = row.insertCell(1)
        let actiontext = row.insertCell(2)
        let delBtn = row.insertCell(3)
        id.innerHTML = String(rows+1)
        //建立select+option
        let select = document.createElement('select')
        //待改
        let opts={
            "click":"滑鼠點擊",
            "wait":"等待",
            "setpoints-normal":"轉點-轉帳錢包",
            "setpoints-seamless":"轉點-單一錢包",
            "refresh":"重整"
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
    
    async function runDemoAccount(){
        let response;
        let args ={
            API : 'GetDemoUrl',
            Currency : "DEM",
            GameID : document.getElementById("DemoGameID").value,
            LanguageID : 2,
            AgentCode : "FCDEM"
        }
        let mes = urlAndPathCheck();
        if(mes.length === 0){
            response = await parent.apiJs.requestAPI(args,parent.apiUrl)
            await parent.open.openChrome(response.Url,parent.chromePath,args['GameID'],"Demo")
        }
        parent.postMessage(JSON.parse(JSON.stringify(mes)),"*");
    }
    
    async function addScript(){
        let rowLength = addTable.rows.length
        let eleName = document.getElementById('name');
        if (rowLength !=0) {
            if(eleName.checkValidity()){
                let data = {};
                data[eleName.value] = {};
                let key;
                let value;
                for (let i = 0; i < rowLength; i++){
                    key = (i+1).toString()+"_" +addTable.rows.item(i).cells[1].children[0].value 
                    value = addTable.rows.item(i).cells[2].children[0].value.replaceAll(" ","")
                    if (value !="" || key.includes('refresh')){
                        data[eleName.value][key] = value
                    }else{
                        break
                    }                
                }
                if (Object.keys(data[eleName.value]).length == rowLength){
                    let response = await parent.psotLocalhostApi('/addScript',data)
                    if (response['returnObject'] == null){
                        parent.postMessage(JSON.parse(JSON.stringify(eleName.value+"新增成功!")),"*");
                        setKeys(await parent.getLocalhostApi('/getScriptKeys'),"list");
                    }else{
                        addMessage.innerHTML = response['returnObject'];
                    }
                }else{
                    addMessage.innerHTML = "內容不可空白!";
                }
                
            }else{
                addMessage.innerHTML ="腳本名稱不可空白!";
            }
        }else{
            addMessage.innerHTML ="至少新增一列!";
        }
    }
    
    function delRowFunction(btnHtml){
        let targetRow = parseInt(btnHtml.id.split('delBtn')[1])-1
        addTable.deleteRow(targetRow)
        Object.keys(addTable.rows).forEach(function(ind){
            ind = parseInt(ind);
            let target = addTable.rows[ind].getElementsByTagName('td')[0]
            if (target.innerHTML != String(ind+1)){
                document.getElementById("actionList"+String(target.innerHTML)).id = "actionList"+String(ind+1)
                document.getElementById("actionText"+String(target.innerHTML)).id = "actionText"+String(ind+1)
                document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind+1)
                target.innerHTML = String(ind+1)
            }
        })
    }

    async function run(event){
        event.preventDefault();
        let mes = '有欄位未填寫!';
        if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
            mes = urlAndPathCheck();
            if(mes.length === 0){
                let response;
                let data;
                let name = $("#list option:selected").text();
                let args ={
                    API : document.getElementById("API").value,
                    Currency : document.getElementById("Currency").value,
                    GameID : document.getElementById("GameID").value,
                    AgentCode : document.getElementById("AgentCode").value,
                    MemberAccount : document.getElementById("MemberAccount").value,
                    LanguageID : document.getElementById("LanguageID").value
                }
                response = await parent.apiJs.requestAPI(args,parent.apiUrl);
                data = await parent.psotLocalhostApi('/getScript',name);
                data['user'] = args
                data['apiUrl'] = parent.apiUrl
                data['seamlessApiUrl'] = parent.seamlessApiUrl
                await parent.open.openChrome(response.Url,parent.chromePath,args['GameID'],data);
            } 
        }
        parent.postMessage(JSON.parse(JSON.stringify(mes)),"*");  
    }

});

