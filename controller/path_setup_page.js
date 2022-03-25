$(async function() {
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    const updateBtn = document.getElementById('update');
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");

    env.innerHTML = parent.env

    setPathList();

    updateBtn.addEventListener('click',function(event){
        updatePath(event);
    });

    exportBtn.addEventListener('click', function(){
        myExport();
    });

    filesInput.onchange = async function(){
        myImport();
    }


    async function setPathList(){
        $('#table tbody').empty();
        var obj = await parent.psotLocalhostApi('/getPathList',parent.env);
        for (let key in obj){
            let rows = showTable.rows.length+1
            let row = showTable.insertRow(-1)
            let id = row.insertCell(0)
            let name = row.insertCell(1)
            let path = row.insertCell(2)
            let update = row.insertCell(3)
            id.innerHTML = String(rows)
            
            let pathIDSpan = document.createElement('span')
            pathIDSpan.id = key
            pathIDSpan.innerHTML = key
            name.appendChild(pathIDSpan)

            let pathNameSpan = document.createElement('span')
            pathNameSpan.id = obj[key]
            pathNameSpan.innerHTML = obj[key]
            path.appendChild(pathNameSpan)

            //update
            let updateButton = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateButton.className = "btn btn-default"
            updateButton.type = "button"
            updateButton.id = "update"+String(rows)
            updateButton.dataset.target="#updateModal"
            updateButton.dataset.toggle="modal"
            updateButton.onclick = function(){
                document.getElementById('path').value = obj[key];
                document.getElementById("name").innerHTML = key;
            } 
            updateButton.appendChild(updateBtnIcon)
            update.appendChild(updateButton)

        }
    }

    async function updatePath(event){
        if(path.checkValidity()){
            event.preventDefault();
            let data = {};
            let name = $("#name")[0].textContent;
            let path = $("#path")[0].value;
            data[name] = path
            let response = await parent.psotLocalhostApi('/updatePath',[parent.env,data]);
            if (response['returnObject'] == null){
                parent[name] = path;
                setPathList();
                $("div.alert").show();
                $("#updateModal").modal("hide");
                message.innerHTML = name+"更新成功!";
            }else{
                console.log(response['returnObject']);
            }
        }
    }

    async function myExport(){
        var obj = await parent.psotLocalhostApi('/getPathList',parent.env);
        let blob = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, parent.env+"PathList"+".json");
    }

    async function myImport(){
        let mes = "";
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            let datas = JSON.parse(this.result);
            for(let key in datas){
                let data ={};
                if(key == "chromePath" || key == "apiUrl" || key == "seamlessApiUrl"){
                    data[key] = datas[key]
                    let response = await parent.psotLocalhostApi('/updatePath',[parent.env,data]);
                    if (response['returnObject'] == null){
                        parent[key] = datas[key];
                        mes += key+","
                    }else{
                        message.innerHTML = key+"匯入失敗!";
                        break
                    }
                }
                
                
            }
            if(mes ==""){
                message.innerHTML = "匯入的資料不正確!!"
            }else{
                message.innerHTML = mes+"成功匯入!";
            }
            
            setPathList();
            $("div.alert").show();
        };
        $("form").get(0).reset()
    }
    
});





