$(async function() {
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    var DbTableName = document.title;
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");

    setList(parent.GameList,"DemoGameID");
    setListSetting();

    addRowBtn.addEventListener('click',function(){
        addRow(null,null);
    });

    demoBtn.addEventListener('click', function(event){
        runDemoAccount(DemoGameID.value,event);
    });

    addBtn.addEventListener('click',function(event){
        addScript(event);
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
        getDefaultWindowSize();
        defaultWindowSizeUpdate.style.display = "block";

    });

    notDefaultGameWindows.addEventListener('change',function(){
        gameWindows.disabled = true;
        $("#width")[0].value = "";
        $("#height")[0].value = "";
        defaultWindowSizeUpdate.style.display = "none";
    });

    gameWindows.addEventListener('change',function(){
        getDefaultWindowSize();
    });

    clickAddBtn.addEventListener('click',async function(){
        $("#addTable tr").remove(); 
        $("#name")[0].disabled = false; 
        $("#name")[0].value = ""; 
        $("#version")[0].value = ""; 
        $("#addMessage")[0].innerHTML = "";
        $(".modal-title")[0].innerHTML = "新增"+document.title+"腳本";
        $("#addBtn")[0].innerHTML = "確定新增";
        $("#unassigned")[0].checked = true;
        $("#defaultGameWindows")[0].checked = true;
        $("#width")[0].value = $("#gameWindows")[0].value.split(",")[0];
        $("#height")[0].value = $("#gameWindows")[0].value.split(",")[1];
        $("#version")[0].disabled = true;
        $("#gameWindows")[0].disabled = false;
        let defaultWindowSize = await parent.psotLocalhostApi('/getList','defaultWindowSize');
        $("#width")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[0];
        $("#height")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[1];
    });

    defaultWindowSizeUpdate.addEventListener('click',async function(){
        let datas = {};
        datas['data'] = {};
        datas['tableName'] = "defaultWindowSize";
        datas['data'][$("#gameWindows")[0].value.replace(/\s*/g,"")] = ($("#width")[0].value+","+$("#height")[0].value).replace(/\s*/g,"")
        await parent.psotLocalhostApi('/updateData',datas);
    });

    
    async function setListSetting(){
        let obj = parent.hangUpScriptList;
        $('#table').empty();
        for (let key in obj){
            let rows = showTable.rows.length+1
            let row = showTable.insertRow(-1)
            let id = row.insertCell(0)
            let Name = row.insertCell(1)
            let exportSeparately = row.insertCell(2)
            let update = row.insertCell(3)
            let del = row.insertCell(4)
            id.innerHTML = String(rows)

            let NameSpan = document.createElement('span')
            NameSpan.id = obj[key]
            NameSpan.innerHTML = obj[key]
            Name.appendChild(NameSpan)

            //export
            let exportSeparatelyBtn = document.createElement('Button');
            let exportBtnIcon = document.createElement('i');
            exportBtnIcon.className = "fas fa-file-download";
            exportSeparatelyBtn.className = "btn";
            exportSeparatelyBtn.onclick = async function(){
                var result = [];
                result.push({});
                let response = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,obj[key]])
                result[0][obj[key]] = response['returnObject'];
                let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
                parent.saveAs(blob, obj[key]+".json");
            } 
            exportSeparatelyBtn.appendChild(exportBtnIcon);
            exportSeparately.appendChild(exportSeparatelyBtn);

            //update
            let updateBtn = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateBtn.className = "btn btn-default"
            updateBtn.type = "button"
            updateBtn.dataset.target="#addModal"
            updateBtn.dataset.toggle="modal"
            updateBtn.onclick = async function(){
                $(".modal-title")[0].innerHTML = "修改腳本";
                $("#addBtn")[0].innerHTML = "確定修改";
                $("#name")[0].disabled = true; 
                $("#name")[0].value = obj[key]; 
                $("#addTable tr").remove();
                addMessage.innerHTML = "";
                let response = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,obj[key]])
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
            delBtn.onclick = async function(){delScript(obj[key],delBtn)} 
            delBtn.appendChild(delBtnIcon);
            del.appendChild(delBtn);
        }

    }
    
    async function delScript(key,delBtn){
        let response = await parent.psotLocalhostApi('/delScript',[parent.hangUpDB,key])
        if (response['returnObject'] == null){
            showTable.deleteRow($('#table tr').index(delBtn.parentElement.parentElement))
            let tableRows = showTable.rows;
            tableRows.forEach(function(ele,ind){
                ind = ind + 1;
                let target = ele.getElementsByTagName('td')[0]
                target.innerHTML = String(ind)
                
            })
            message.innerHTML = key+"刪除成功!";
            parent.hangUpScriptList = await parent.psotLocalhostApi('/getKeys',parent.hangUpDB);
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
        let opts={
            "click":"滑鼠點擊",
            "wait":"等待",
            "setpoints-normal":"轉點-轉帳錢包",
            "setpoints-seamless":"轉點-單一錢包",
            "refresh":"重整"
        }
        for (const [k, v] of Object.entries(opts)) {
            let opt = document.createElement('option')
            opt.value = k
            opt.innerHTML = v
            if( key == k ){
                opt.selected = "selected";
            }
            select.appendChild(opt)
        }
        select.onchange = function(){selectOption(select)} 
        action.appendChild(select) 
        //建立input
        let input = document.createElement('input')
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
        btn.onclick = function(){delRowFunction(btn)} 
        btnicon.className = "fas fa-trash-alt"
        btn.appendChild(btnicon)
        delBtn.appendChild(btn)
    }
    
    function selectOption(selectHtml){
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

    async function runDemoAccount(args,browerArgs,event){
        let mes = urlAndPathCheck(); 
        if(args.AgentKey){
            if(mes.length === 0 && await isAssign()){
                event.preventDefault();
                let response = await parent.apiJs.requestAPI(args,parent.apiUrl);
                let code = returnResponseCode(response);
                if ( code == 0){
                    await parent.browser.createBrowser(response.Url,await setUpBrowerArgs("Demo",browerArgs),parent.apiUrl,parent.seamlessApiUrl);
                }else{
                    mes = "登入失敗 - Error："+code
                }
            }
        }else{
            mes = "FCDEM - 未查詢到此AgentKey，請先至設定新增!!"
        }
        addMessage.innerHTML = mes;
    }

    async function addScript(event){
        if(await isAssign()){
            if(name.checkValidity() && width.checkValidity() && height.checkValidity()){
                event.preventDefault();
                let rowLength = addTable.rows.length;
                if (rowLength !=0) {
                    let eleName = document.getElementById('name');
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
                        value = addTable.rows.item(i).cells[2].children[0].value.replace(/\s*/g,"")
                        if (value !="" || key.includes('refresh')){
                            data[eleName.value][key] = value
                        }else{
                            break
                        }                
                    }
                    if (Object.keys(data[eleName.value]).length == rowLength+3){
                        let response;
                        if($("#addBtn")[0].innerHTML.includes("修改")){
                            response = await parent.psotLocalhostApi('/updateScript',[parent.hangUpDB,data]);
                            if (response['returnObject'] == null){
                                parent.hangUpScriptList = await parent.psotLocalhostApi('/getKeys',parent.hangUpDB);
                                setListSetting();
                                message.innerHTML = eleName.value+"修改成功!";
                                $("div.alert").show();
                                $("#addModal").modal("hide");
                            }else{
                                addMessage.innerHTML = response['returnObject'];
                            }
                        }else{
                            response = await parent.psotLocalhostApi('/addScript',[parent.hangUpDB,data]);
                            if (response['returnObject'] == null){
                                parent.hangUpScriptList = await parent.psotLocalhostApi('/getKeys',parent.hangUpDB);
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
        let delRowInd =$("#addTable tr").index(btnHtml.parentElement.parentElement);
        addTable.deleteRow(delRowInd);
        Object.keys(addTable.rows).forEach(function(ind){
            var index = parseInt(ind);
            var target = addTable.rows[index].getElementsByTagName('td')[0]
            target.innerHTML = String(index+1)
        })
    }

    async function isAssign(){
        return new Promise((resv, rej) => {
            if($("#assign")[0].checked){
                if(version.checkValidity()){
                    resv(true);
                }else{
                    resv(false);
                }
            }else{
                resv(true);
            }
        });
    }

     async function getDefaultWindowSize(){
        let defaultWindowSize = await parent.psotLocalhostApi('/getList','defaultWindowSize');
        $("#width")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[0];
        $("#height")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[1];
    }

    function returnResponseCode(response){
        if(response){
            return response.Result;
        }else{
            return 1;
        }
    }

    // outerlist

    async function setListSetting(){
        let obj = parent.scriptList;
        $('#table tbody').empty();
        for (let key in obj){
            let rows = showTable.rows.length+1
            let row = showTable.insertRow(-1)
            let id = row.insertCell(0)
            let Name = row.insertCell(1)
            let exportSeparately = row.insertCell(2)
            let update = row.insertCell(3)
            let del = row.insertCell(4)
            id.innerHTML = String(rows)

            let NameSpan = document.createElement('span')
            NameSpan.innerHTML = obj[key]
            Name.appendChild(NameSpan)

            //export
            let exportSeparatelyBtn = document.createElement('Button');
            let exportBtnIcon = document.createElement('i');
            exportBtnIcon.className = "fas fa-file-download";
            exportSeparatelyBtn.className = "btn";
            exportSeparatelyBtn.onclick = async function(){exportSeparatelyMethod(obj,key)}
            exportSeparatelyBtn.appendChild(exportBtnIcon);
            exportSeparately.appendChild(exportSeparatelyBtn);

            //update
            let updateBtn = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateBtn.className = "btn btn-default"
            updateBtn.type = "button"
            updateBtn.dataset.target="#addModal"
            updateBtn.dataset.toggle="modal"
            updateBtn.onclick = async function(){updateMethod(obj,key)}
            updateBtn.appendChild(updateBtnIcon)
            update.appendChild(updateBtn)

            //del
            let delBtn = document.createElement('Button');
            let delBtnIcon = document.createElement('i');
            delBtnIcon.className = "fas fa-trash-alt";
            delBtn.className = "btn";
            delBtn.onclick = async function(){delScript(obj[key],delBtn)} 
            delBtn.appendChild(delBtnIcon);
            del.appendChild(delBtn);
        }

    }

    async function delScript(key,delBtn){
        let response = await parent.psotLocalhostApi('/delScript',key)
        if (response['returnObject'] == null){
            showTable.deleteRow($(showTable.getElementsByTagName('tr')).index(delBtn.parentElement.parentElement))
            let tableRows = showTable.rows;
            tableRows.forEach(function(ele,ind){
                ind = ind + 1;
                let target = ele.getElementsByTagName('td')[0]
                target.innerHTML = String(ind)
            })
            message.innerHTML = key+"刪除成功!";
            parent.scriptList = await parent.getLocalhostApi('/getKeys');
            $("div.alert").show();
        }
    }

    //// outerlist_onclick
    async function exportSeparatelyMethod(obj,key){
        let result = [];
        result.push({});
        let response = await parent.psotLocalhostApi('/getScript',obj[key])
        result[0][obj[key]] = response['returnObject'];
        let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, obj[key]+".json");
    }

    async function updateMethod(obj,key){
        $(".modal-title")[0].innerHTML = "修改腳本";
        $("#addBtn")[0].innerHTML = "確定修改";
        $("#name")[0].disabled = true; 
        $("#name")[0].value = obj[key]; 
        $("#addTable tr").remove();
        addMessage.innerHTML = "";
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
    
    async function myExport(){
        var result = [];
        for (const [index, value] of parent.hangUpScriptList.entries()){
            let response = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,value]);
            result.push({});
            result[index][value] = response['returnObject'];  
        }
        let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, DbTableName+"腳本.json");
    }

    async function myImport(){
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            var datas = JSON.parse(this.result);
            for (let data of datas){
                if(!parent.hangUpScriptList.includes(Object.keys(data)[0])){
                    let response = await parent.psotLocalhostApi('/addScript',[parent.hangUpDB,data]);
                    if (response['returnObject'] != null){
                        message.innerHTML = Object.keys(data)[0]+"新增失敗!";
                        $("div.alert").show();
                        return;
                    }
                }else{
                    message.innerHTML = Object.keys(data)[0]+"已存在!，請先刪除後匯入";
                    $("div.alert").show();
                    return;
                }                  
            }
            message.innerHTML = "成功匯入!";
            $("div.alert").show();
            parent.hangUpScriptList = await parent.psotLocalhostApi('/getKeys',parent.hangUpDB);
            setListSetting();
        };
        $("form").get(1).reset()
    }

    async function getDefaultWindowSize(){
        let defaultWindowSize = await parent.psotLocalhostApi('/getList','defaultWindowSize');
        $("#width")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[0];
        $("#height")[0].value = defaultWindowSize["returnObject"][$("#gameWindows")[0].value].split(",")[1];
    }
});
