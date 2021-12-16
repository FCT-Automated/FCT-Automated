$(async function() {
    let replace = {
        "Currency":"幣別",
        "Language":"語系",
        "Game":"遊戲"
    }
    var main = location.search.split("?")[1];
    document.title = main+"List"
    document.body.innerHTML = document.body.innerHTML.replace(/name/g,replace[main]);

    const add = document.getElementById('add');
    const update = document.getElementById('update');
    const inputSearch = document.getElementById("search");
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");

    var DbTableName = document.title;
    var message = document.getElementById("message");
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    
    setListSetting(await parent.psotLocalhostApi('/getList',DbTableName));
    

    add.addEventListener('click',function(e){
        let addId = document.getElementById('addId');
        let addName = document.getElementById('addName');
        addData(addId,addName,e);
    });

    update.addEventListener('click',function(e){
        let updateID = document.getElementById('updateID');
        let updateName = document.getElementById('updateName');
        updateData(updateID,updateName,e);
    });

    inputSearch.addEventListener('keyup',function(){
        search(inputSearch.value,showTable);
    });

    exportBtn.addEventListener('click', function(){
        myExport();
    });

    filesInput.onchange = async function(){
        myImport();
    }

    //變數名稱待改
    function setListSetting(returnObject){
        $('#table tbody').empty();
        if (returnObject != null){
            let returnObj = returnObject['returnObject'];
            var obj = Object.keys(returnObj).sort().reduce(
                function(o,k){
                    o[k] = returnObj[k];
                    return o;
                },
                {}
            );
            Object.keys(obj).sort(); //待處理
            for (let key in obj){
                let rows = showTable.rows.length+1
                let row = showTable.insertRow(-1)
                let id = row.insertCell(0)
                let ID = row.insertCell(1)
                let Name = row.insertCell(2)
                let Update = row.insertCell(3)
                let Del = row.insertCell(4)
                id.innerHTML = String(rows)
                
                let IDSpan = document.createElement('span')
                IDSpan.id = key
                IDSpan.innerHTML = key
                ID.appendChild(IDSpan)
    
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
                updateBtn.dataset.target="#updateModal"
                updateBtn.dataset.toggle="modal"
                updateBtn.onclick = function(){
                    document.getElementById('updateName').value = '';
                    document.getElementById("updateID").innerHTML = key;
                } 
                updateBtn.appendChild(updateBtnIcon)
                Update.appendChild(updateBtn)
    
                //del
                let delBtn = document.createElement('Button')
                let delBtnIcon = document.createElement('i')
                delBtnIcon.className = "fas fa-trash-alt"
                delBtn.className = "btn btn-default"
                delBtn.type = "button"
                delBtn.id = "delBtn"+String(rows)
                delBtn.onclick = async function(){delRow(key,delBtn)} 
                delBtn.appendChild(delBtnIcon)
                Del.appendChild(delBtn)
            }
        }
    }
    
    async function delRow(key,delBtn){
        let data = {};
        data['key'] = key;
        data['tableName'] = DbTableName;
        let response = await parent.psotLocalhostApi('/delData',data)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            showTable.deleteRow(targetRow-1)
            let tableRows= showTable.rows;
            tableRows.forEach(function(ele,ind){
                ind = ind + 1;
                let target = ele.getElementsByTagName('td')[0]
                document.getElementById("update"+String(target.innerHTML)).id = "update"+String(ind)
                document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind)
                target.innerHTML = String(ind)
            })
            message.innerHTML =key+"刪除成功!";
            $("div.alert").show();
            parent.window[DbTableName] = await parent.psotLocalhostApi('/getList',DbTableName);
        }
    }
    
    async function addData(addId,addName,e){
        if(addId.checkValidity() && addName.checkValidity()){
            e.preventDefault();
            let datas = {};
            datas['data'] = {};
            datas['tableName'] = DbTableName;
            datas['data'][addId.value] = addName.value
            let response = await parent.psotLocalhostApi('/addData',datas);
            if (response['returnObject'] == null){
                document.getElementById("search").value = "";
                setListSetting(await parent.psotLocalhostApi('/getList',DbTableName));
                message.innerHTML = addId.value+"新增成功!";
                parent.window[DbTableName] = await parent.psotLocalhostApi('/getList',DbTableName);
            }else{
                message.innerHTML = addId.value+response['returnObject'];
            }
            $("div.alert").show();
            $("#addModal").modal("hide");
            addId.value = "";
            addName.value = "";
        }
    }

    async function updateData(updateID,updateName,e){
        if(updateName.checkValidity()){
            e.preventDefault();
            let datas = {};
            datas['data'] = {};
            datas['tableName'] = DbTableName;
            datas['data'][updateID.textContent] = updateName.value
            let response = await parent.psotLocalhostApi('/updateData',datas);
            if (response['returnObject'] == null){
                setListSetting(await parent.psotLocalhostApi('/getList',DbTableName));
                message.innerHTML = updateID.textContent+"編輯成功!";
                $("div.alert").show();
                $("#updateModal").modal("hide");
                parent.window[DbTableName] = await parent.psotLocalhostApi('/getList',DbTableName);
            }else{
                message.innerHTML = response['returnObject'];
            }
        }
    }
    

    async function myExport(){
        let obj = parent.window[DbTableName]['returnObject'];
        let blob = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});
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
                setListSetting(await parent.psotLocalhostApi('/getList',DbTableName));
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

