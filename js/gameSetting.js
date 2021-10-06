$(async function() {
    const electron = require('electron');
    const {ipcRenderer} = require('electron');
    const { saveAs } = require('file-saver');

    const net = electron.remote.net;
    const addGameMes = document.getElementById("addGameMes");
    const gameSettingMes = document.getElementById("gameSettingMes");
    const updateGameMes = document.getElementById("updateGameMes");
    const addGameModal = document.getElementById("addGameModal");
    const exportBtn = document.getElementById("export");
    const importBtn = document.getElementById("import");
    const files = document.getElementById("files");

    var addGame = document.getElementById('addGame');
    var updateGame = document.getElementById('updateGame');

    var returnObject = await getLocalhostApi('/getGameList');
    var obj = returnObject['returnObject'];
    var table = document.getElementById("gameTable");
    if (obj != null){
        Object.keys(obj).sort();
        for (let key in obj){
            let rows = table.rows.length
            let row = table.insertRow(-1)
            let id = row.insertCell(0)
            let gameID = row.insertCell(1)
            let gameName = row.insertCell(2)
            let update = row.insertCell(3)
            let del = row.insertCell(4)
            id.innerHTML = String(rows)
            
            let gameIDSpan = document.createElement('span')
            gameIDSpan.id = key
            gameIDSpan.innerHTML = key
            gameID.appendChild(gameIDSpan)
    
            let gameNameSpan = document.createElement('span')
            gameNameSpan.id = obj[key]
            gameNameSpan.innerHTML = obj[key]
            gameName.appendChild(gameNameSpan)
    
            //update
            let updateBtn = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateBtn.className = "btn btn-default"
            updateBtn.type = "button"
            updateBtn.id = "update"+String(rows)
            updateBtn.dataset.target="#updateGameModal"
            updateBtn.dataset.toggle="modal"
            updateBtn.onclick = function(){
                document.getElementById('updateGameName').value = '';
                document.getElementById("updateGameID").innerHTML = key;
                ipcRenderer.send('updateGameMes', "");
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
        });

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
        });

    }

    async function delFunction(key,delBtn){
        let response = await psotLocalhostApi('/delGame',key)
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
                
            });
            ipcRenderer.send('gameSettingMes', key+"刪除成功!");
        }
    }

    addGame.addEventListener('click',async function(event){
        event.preventDefault();
        let gameID = document.getElementById('GameID');
        let gameName = document.getElementById('GameName');
        if(gameID.checkValidity() && gameName.checkValidity()){
            let data = {};
            data[gameID.value] = gameName.value
            let response = await psotLocalhostApi('/addGame',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                location.reload();
            }else{
                ipcRenderer.send('addGameMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('addGameMes', "遊戲編號或遊戲名稱不可空白!");
        }
    });

    updateGame.addEventListener('click',async function(event){
        event.preventDefault();
        let gameID = document.getElementById('updateGameID');
        let gameName = document.getElementById('updateGameName');
        if(gameName.checkValidity()){
            let data = {};
            data[gameID.textContent] = gameName.value
            let response = await psotLocalhostApi('/updateGame',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                location.reload();
            }else{
                ipcRenderer.send('updateGameMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('updateGameMes', "遊戲名稱不可空白!");
        }
    });

    addGameModal.addEventListener('click',function(){
        document.getElementById('GameID').value = "";
        document.getElementById('GameName').value = "";
        ipcRenderer.send('addGameMes', "");

    });

    exportBtn.addEventListener('click', async function(){
        returnObject = await getLocalhostApi('/getGameList');
        obj = returnObject['returnObject'];
        let blob = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "gameList.json");
    });

    importBtn.addEventListener('click',function(){
        $("#files").click();
        files.addEventListener('change',function(){
            let selectedFile = files.files[0];
            let reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = async function(){
                let gameList = JSON.parse(this.result);
                let response = await psotLocalhostApi('/batchImportGameList',gameList);
                if (response['returnObject'] != null){
                    ipcRenderer.send('gameSettingMes',response['returnObject']);
                }
                $(this).prev().click();
                location.reload();
            };
        })
    })

    ipcRenderer.on('addGameMes', (event, arg) => {
        addGameMes.innerHTML = arg
    });

    ipcRenderer.on('gameSettingMes', (event, arg) => {
        gameSettingMes.innerHTML = arg
    });

    ipcRenderer.on('updateGameMes', (event, arg) => {
        updateGameMes.innerHTML = arg
    });

    
});





