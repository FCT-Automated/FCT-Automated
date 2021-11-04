$(async function() {
    var addTable = document.getElementById('addTable');
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    var message = document.getElementById("message");
    var DbTableName = document.title;

    const addRowBtn = document.getElementById('addRowBtn');
    const demoBtn = document.getElementById('demoBtn');
    const addBtn = document.getElementById('addBtn');
    const inputSearch = document.getElementById("search");
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");

    setList(parent.GameList,"DemoGameID");
    setListSetting();

    addRowBtn.addEventListener('click',function(){
        addRow(null,null);
    });

    demoBtn.addEventListener('click', function(){
        let DemoID = document.getElementById("DemoGameID").value;
        runDemoAccount(DemoID);
    });

    addBtn.addEventListener('click',function(event){
        addScript(event);
    });

    inputSearch.addEventListener('keyup',function(){
        search(inputSearch.value,showTable);
    });

    exportBtn.addEventListener('click', function(){
        myExport();
    });

    filesInput.onchange = function(){
        myImport();
    }

    
    async function setListSetting(){
        let obj = parent.scriptList;
        $('#table tbody').empty();
        for (let key in obj){
            let rows = showTable.rows.length+1
            let row = showTable.insertRow(-1)
            let id = row.insertCell(0)
            let Name = row.insertCell(1)
            let update = row.insertCell(2)
            let del = row.insertCell(3)
            id.innerHTML = String(rows)

            let NameSpan = document.createElement('span')
            NameSpan.id = obj[key]
            NameSpan.innerHTML = obj[key]
            Name.appendChild(NameSpan)

            //update
            let updateBtn = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateBtn.className = "btn btn-default"
            updateBtn.type = "button"
            updateBtn.id = "update"+String(rows)
            updateBtn.dataset.target="#addModal"
            updateBtn.dataset.toggle="modal"
            updateBtn.onclick = async function(){
                $(".modal-title")[0].innerHTML = "修改腳本";
                $("#addBtn")[0].innerHTML = "確定修改";
                $("#name")[0].disabled = true; 
                $("#name")[0].value = obj[key]; 
                $("#addTable tr").remove();
                let response = await parent.psotLocalhostApi('/getScript',obj[key])
                for (let k in response['returnObject']){
                    if(k.includes("width") || k.includes("height")){
                        $("#"+k)[0].value = response['returnObject'][k]
                    }else{
                        addRow(k.split("_")[1],response['returnObject'][k]);
                    }
                    
                }
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
            delBtn.onclick = async function(){delScript(obj[key],delBtn)} 
            delBtn.appendChild(delBtnIcon)
            del.appendChild(delBtn)
        }

    }
    
    async function delScript(key,delBtn){
        let response = await parent.psotLocalhostApi('/delScript',key)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            showTable.deleteRow(targetRow-1)
            showTable.rows.forEach(function(ele,ind){
                ind = ind + 1;
                let target = ele.getElementsByTagName('td')[0]
                document.getElementById("update"+String(target.innerHTML)).id = "update"+String(ind)
                document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind)
                target.innerHTML = String(ind)
                
            })
            message.innerHTML = key+"刪除成功!";
            parent.scriptList = await parent.getLocalhostApi('/getKeys');
            $("div.alert").show();
        }
    }

    function addRow(key,value){
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
        for (const [k, v] of Object.entries(opts)) {
            let opt = document.createElement('option')
            opt.value = k
            opt.innerHTML = v
            if( key == k ){
                opt.selected = "selected";
            }
            select.appendChild(opt)
        }
        select.onchange = function(){actionListFunction(select)} 
        action.appendChild(select) 
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
    
    async function runDemoAccount(DemoID){
        let response;
        let args ={
            API : 'GetDemoUrl',
            Currency : "DEM",
            GameID : DemoID,
            LanguageID : 2,
            AgentCode : "FCDEM"
        }
        let mes = urlAndPathCheck();
        if(mes.length === 0){
            response = await parent.apiJs.requestAPI(args,parent.apiUrl)
            await parent.browser.createBrowser(response.Url,parent.chromePath,"Demo")
        }
        parent.postMessage(JSON.parse(JSON.stringify(mes)),"*");
    }
    
    async function addScript(event){
        if($("#name")[0].checkValidity() && $("#width")[0].checkValidity() && $("#height")[0].checkValidity()){
            event.preventDefault();
            let rowLength = addTable.rows.length;
            if (rowLength !=0) {
                let eleName = document.getElementById('name');
                let width = document.getElementById('width');
                let height = document.getElementById('height');
                let addMessage = document.getElementById("addMessage");
                let data = {};
                data[eleName.value] = {};
                data[eleName.value]['width'] = width.value;
                data[eleName.value]['height'] = height.value;
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
                if (Object.keys(data[eleName.value]).length == rowLength+2){
                    let response;
                    if($("#addBtn")[0].innerHTML.includes("修改")){
                        response = await parent.psotLocalhostApi('/updateScript',data);
                        if (response['returnObject'] == null){
                            parent.scriptList = await parent.getLocalhostApi('/getKeys');
                            setListSetting();
                            message.innerHTML = eleName.value+"修改成功!";
                            $("div.alert").show();
                            $("#addModal").modal("hide");
                        }else{
                            addMessage.innerHTML = response['returnObject'];
                        }
                    }else{
                        response = await parent.psotLocalhostApi('/addScript',data);
                        if (response['returnObject'] == null){
                            parent.scriptList = await parent.getLocalhostApi('/getKeys');
                            setListSetting();
                            message.innerHTML = eleName.value+"新增成功!";
                            $("div.alert").show();
                            $("#addModal").modal("hide");
                        }else{
                            addMessage.innerHTML = response['returnObject'];
                        }
                    }
                }else{
                    addMessage.innerHTML = "內容不可空白!";
                }
            }else{
                addMessage.innerHTML ="至少新增一列!";
            }
            
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

    //待改
    function myExport(){
        var result = [];
        parent.scriptList.forEach(async function(key,ind){
            result.push({});
            let response = await parent.psotLocalhostApi('/getScript',key);
            result[ind][key] = await response['returnObject'];      
        });
        let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, DbTableName+".json");
    }

    async function myImport(){
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            let datas = {};
            datas['data'] = JSON.parse(this.result);
            datas['tableName'] = DbTableName;
            let response = await parent.psotLocalhostApi('/importList',datas);
            if (response['returnObject'] === null){
                // setListSetting(await parent.psotLocalhostApi('/getList',DbTableName));
                parent.window[DbTableName] = await parent.psotLocalhostApi('/getList',DbTableName);
                message.innerHTML = "成功匯入!";
                
            }else{
                message.innerHTML = response['returnObject'];
            }
            $("div.alert").show();
        };
        $("form").get(1).reset()
    }

});
