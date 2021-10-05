$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron');
    const net = electron.remote.net;
    const addLanguageMes = document.getElementById("addLanguageMes");
    const languageSettingMes = document.getElementById("languageSettingMes");
    const updateLanguageMes = document.getElementById("updateLanguageMes");
    const addLanguageModal = document.getElementById("addLanguageModal");
    
    
    var addLanguage = document.getElementById('addLanguage');
    var updateLanguage = document.getElementById('updateLanguage');

    var returnObject = await getLocalhostApi('/getLanguageList');
    var obj = returnObject['returnObject'];
    if (obj != null){
        var table = document.getElementById("languageTable");
        for (let key in obj){
            let rows = table.rows.length
            let row = table.insertRow(-1)
            let id = row.insertCell(0)
            let languageID = row.insertCell(1)
            let languageName = row.insertCell(2)
            let update = row.insertCell(3)
            let del = row.insertCell(4)
            id.innerHTML = String(rows)
            
            let languageIDSpan = document.createElement('span')
            languageIDSpan.id = key
            languageIDSpan.innerHTML = key
            languageID.appendChild(languageIDSpan)

            let languageNameSpan = document.createElement('span')
            languageNameSpan.id = obj[key]
            languageNameSpan.innerHTML = obj[key]
            languageName.appendChild(languageNameSpan)

            //update
            let updateBtn = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateBtn.className = "btn btn-default"
            updateBtn.type = "button"
            updateBtn.id = "update"+String(rows)
            updateBtn.dataset.target="#updateLanguageModal"
            updateBtn.dataset.toggle="modal"
            updateBtn.onclick = function(){
                document.getElementById('updateLanguageName').value = '';
                document.getElementById("updateLanguageID").innerHTML = key;
                ipcRenderer.send('updateLanguageMes', "");
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
            delBtn.onclick = async function(){delFunction(key,delBtn)} 
            delBtn.appendChild(delBtnIcon)
            del.appendChild(delBtn)
        }
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
        let response = await psotLocalhostApi('/delLanguage',key)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            table.deleteRow(targetRow)
            table.rows.forEach(function(ele,ind){
                if(ele.rowIndex!=0){
                    let target = ele.getElementsByTagName('td')[0]
                    document.getElementById("update"+String(target.innerHTML)).id = "update"+String(ind)
                    document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind)
                    target.innerHTML = String(ind)
                }                
                
            })
            ipcRenderer.send('languageSettingMes', key+"刪除成功!");
        }
    }

    addLanguage.addEventListener('click',async function(event){
        event.preventDefault();
        let languageID = document.getElementById('LanguageID');
        let languageName = document.getElementById('LanguageName');
        if(languageID.checkValidity() && languageName.checkValidity()){
            let data = {};
            data[languageID.value] = languageName.value
            let response = await psotLocalhostApi('/addLanguage',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                location.reload();
            }else{
                ipcRenderer.send('addLanguageMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('addLanguageMes', "語系代號或語系名稱不可空白!");
        }
    })

    updateLanguage.addEventListener('click',async function(event){
        event.preventDefault();
        let languageID = document.getElementById('updateLanguageID');
        let languageName = document.getElementById('updateLanguageName');
        if(languageName.checkValidity()){
            let data = {};
            data[languageID.textContent] = languageName.value
            let response = await psotLocalhostApi('/updateLanguage',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                location.reload();
            }else{
                ipcRenderer.send('updateLanguageMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('updateLanguageMes', "語系名稱不可空白!");
        }
    })

    addLanguageModal.addEventListener('click',function(){
        document.getElementById('LanguageID').value = "";
        document.getElementById('LanguageName').value = "";
        ipcRenderer.send('addLanguageMes', "");

    })

    ipcRenderer.on('addLanguageMes', (event, arg) => {
        addLanguageMes.innerHTML = arg
    });

    ipcRenderer.on('languageSettingMes', (event, arg) => {
        languageSettingMes.innerHTML = arg
    });

    ipcRenderer.on('updateLanguageMes', (event, arg) => {
        updateLanguageMes.innerHTML = arg
    });

    
});





