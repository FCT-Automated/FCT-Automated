$(async function() {
    var addTable = document.getElementById('addTable');
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    var message = document.getElementById("message");
    var DbTableName = document.title;
    var assign = document.getElementById('assign');
    var unassigned = document.getElementById('unassigned');
    var defaultGameWindows = document.getElementById('defaultGameWindows');
    var notDefaultGameWindows = document.getElementById('notDefaultGameWindows');
    var gameWindows = document.getElementById('gameWindows');
    

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

    demoBtn.addEventListener('click', function(event){
        let DemoID = document.getElementById("DemoGameID").value;
        runDemoAccount(DemoID,event);
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

    assign.addEventListener('change',function(){
        $("#version")[0].disabled = false;
    });

    unassigned.addEventListener('change',function(){
        $("#version")[0].disabled = true;
    });

    defaultGameWindows.addEventListener('change',function(){
        gameWindows.disabled = false;
        $("#width")[0].value = gameWindows.value.split(",")[0];
        $("#height")[0].value = gameWindows.value.split(",")[1];

    });

    notDefaultGameWindows.addEventListener('change',function(){
        gameWindows.disabled = true;
        $("#width")[0].value = "";
        $("#height")[0].value = "";
    });

    gameWindows.addEventListener('change',function(){
        $("#width")[0].value = gameWindows.value.split(",")[0];
        $("#height")[0].value = gameWindows.value.split(",")[1];
    })

    
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
                    let d = response['returnObject'][k];
                    if(k.includes("width") || k.includes("height") || k.includes("version")){
                        $("#"+k)[0].value = d
                        if(k === "version" && d === ""){
                            $("#version")[0].disabled = true;
                            $("#unassigned")[0].checked = true;
                        }else{
                            $("#assign")[0].checked = true;
                            $("#version")[0].disabled = false;
                        }
                    }else{
                        addRow(k.split("_")[1],d);
                    }
                    
                }
                $("#gameWindows option").each(function(i,item){
                    if(item.value.split(",")[0] === $("#width")[0].value && item.value.split(",")[1] === $("#height")[0].value){
                        gameWindows.disabled = false
                        defaultGameWindows.checked = true
                        item.selected = true
                        return false;
                    }else{
                        gameWindows.disabled = true
                        notDefaultGameWindows.checked = true
                    }
                });

            } 
            updateBtn.appendChild(updateBtnIcon)
            update.appendChild(updateBtn)

            //del
            let delBtn = document.createElement('Button');
            let delBtnIcon = document.createElement('i');
            delBtnIcon.className = "fas fa-trash-alt";
            delBtn.className = "btn";
            delBtn.id = "delBtn"+String(rows);
            delBtn.onclick = async function(){delScript(obj[key],delBtn)} 
            delBtn.appendChild(delBtnIcon);
            del.appendChild(delBtn);
        }

    }
    
    async function delScript(key,delBtn){
        let response = await parent.psotLocalhostApi('/delScript',key)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            showTable.deleteRow(targetRow-1)
            let tableRows = showTable.rows;
            tableRows.forEach(function(ele,ind){
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
        btn.className = "btn"
        btn.id = "delRowBtn"+String(rows+1)
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
    
    async function runDemoAccount(DemoID,event){
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
            if(await isAssign()){
                event.preventDefault();
                response = await parent.apiJs.requestAPI(args,parent.apiUrl)
                let object = {};
                if($("#assign")[0].checked){
                    object['version'] = $("#version")[0].value;
                }else{
                    object['version'] = "";
                }
                if(defaultGameWindows.checked){
                    object['width'] = gameWindows.value.split(",")[0];
                    object['height'] = gameWindows.value.split(",")[1];
                    await parent.browser.createBrowser(response.Url,parent.chromePath,await setUpBrowerArgs("Demo",object));
                }else{
                    await parent.browser.createBrowser(response.Url,parent.chromePath,await setUpBrowerArgs("Demo",object));
                }
            }
        }
        message.innerHTML = mes;
    }
    
    async function addScript(event){
        if(await isAssign()){
            if($("#name")[0].checkValidity() && $("#width")[0].checkValidity() && $("#height")[0].checkValidity()){
                event.preventDefault();
                let rowLength = addTable.rows.length;
                if (rowLength !=0) {
                    let eleName = document.getElementById('name');
                    let width = document.getElementById('width');
                    let height = document.getElementById('height');
                    let addMessage = document.getElementById("addMessage");
                    let version = document.getElementById("version");
                    let data = {};
                    data[eleName.value] = {};
                    data[eleName.value]['width'] = width.value;
                    data[eleName.value]['height'] = height.value;
                    if($("#assign")[0].checked){
                        data[eleName.value]['version'] = version.value;
                    }else{
                        data[eleName.value]['version'] = "";
                    }
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
                    if (Object.keys(data[eleName.value]).length == rowLength+3){
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
    }
    
    function delRowFunction(btnHtml){
        let targetRow = parseInt(btnHtml.id.split('delRowBtn')[1])-1
        addTable.deleteRow(targetRow)
        let context = ["actionList","actionText","delRowBtn"];
        Object.keys(addTable.rows).forEach(function(ind){
            var index = parseInt(ind);
            var target = addTable.rows[index].getElementsByTagName('td')[0]
            context.forEach(function(ele){
                $("#"+ele+String(target.innerHTML)).attr("id",ele+String(index+1));
            });
            target.innerHTML = String(index+1)
        })
    }

    async function isAssign(){
        return new Promise((resv, rej) => {
            if($("#assign")[0].checked){
                if($("#version")[0].checkValidity()){
                    resv(true);
                }else{
                    resv(false);
                }
            }else{
                resv(true);
            }
        });
    }

    async function myExport(){
        var result = [];
        for (const [index, value] of parent.scriptList.entries()){
            let response = await parent.psotLocalhostApi('/getScript',value);
            result.push({});
            result[index][value] = response['returnObject'];  
        }
        let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, DbTableName+".json");
    }

    async function myImport(){
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            var datas = JSON.parse(this.result);
            for (let data of datas){
                if(!parent.scriptList.includes(Object.keys(data)[0])){
                    let response = await parent.psotLocalhostApi('/addScript',data);
                    if (response['returnObject'] != null){
                        message.innerHTML = Object.keys(data)[0]+"新增失敗!";
                        $("div.alert").show();
                        return;
                    }
                }                
            }
            message.innerHTML = "成功匯入!";
            parent.scriptList = await parent.getLocalhostApi('/getKeys');
            setListSetting();
        };
        $("form").get(1).reset()
    }

});
