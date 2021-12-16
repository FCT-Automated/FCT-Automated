$(async function() {
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    var message = document.getElementById("message");
    const updateBtn = document.getElementById('update');
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");

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
        var obj = await parent.getLocalhostApi('/getPathList');
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
        if($("#path")[0].checkValidity()){
            event.preventDefault();
            let data = {};
            let name = $("#name")[0].textContent;
            let path = $("#path")[0].value;
            data[name] = path
            let response = await parent.psotLocalhostApi('/updatePath',data);
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
        var obj = await parent.getLocalhostApi('/getPathList');
        let blob = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});
        parent.saveAs(blob, document.title+"List"+".json");
    }

    async function myImport(){
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            let datas = JSON.parse(this.result);
            for(let key in datas){
                let data ={};
                data[key] = datas[key]
                let response = await parent.psotLocalhostApi('/updatePath',data);
                if (response['returnObject'] == null){
                    parent[key] = datas[key];
                    message.innerHTML = "成功匯入!";
                }else{
                    message.innerHTML = key+"匯入失敗!";
                    break
                }
            }
            setPathList();
            $("div.alert").show();
        };
        $("form").get(0).reset()
    }
    
});





