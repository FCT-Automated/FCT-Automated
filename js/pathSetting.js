$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron');
    const net = electron.remote.net;
    const updatePathMes = document.getElementById("updatePathMes");
    
    var updatePath = document.getElementById('updatePath');

    var obj = await getLocalhostApi('/getPathList');
    var table = document.getElementById("pathTable");
    for (let key in obj){
        let rows = table.rows.length
        let row = table.insertRow(-1)
        let id = row.insertCell(0)
        let pathID = row.insertCell(1)
        let pathName = row.insertCell(2)
        let update = row.insertCell(3)
        id.innerHTML = String(rows)
        
        let pathIDSpan = document.createElement('span')
        pathIDSpan.id = key
        pathIDSpan.innerHTML = key
        pathID.appendChild(pathIDSpan)

        let pathNameSpan = document.createElement('span')
        pathNameSpan.id = obj[key]
        pathNameSpan.innerHTML = obj[key]
        pathName.appendChild(pathNameSpan)

        //update
        let updateBtn = document.createElement('Button')
        let updateBtnIcon = document.createElement('i')
        updateBtnIcon.className = "fas fa-edit"
        updateBtn.className = "btn btn-default"
        updateBtn.type = "button"
        updateBtn.id = "update"+String(rows)
        updateBtn.dataset.target="#updatePathModal"
        updateBtn.dataset.toggle="modal"
        updateBtn.onclick = function(){
            document.getElementById('updatePathName').value = '';
            document.getElementById("updatePathID").innerHTML = key;
            ipcRenderer.send('updatePathMes', "");
        } 
        updateBtn.appendChild(updateBtnIcon)
        update.appendChild(updateBtn)

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

    updatePath.addEventListener('click',async function(event){
        event.preventDefault();
        let pathID = document.getElementById('updatePathID');
        let pathName = document.getElementById('updatePathName');
        if(pathName.checkValidity()){
            let data = {};
            data[pathID.textContent] = pathName.value
            let response = await psotLocalhostApi('/updatePath',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                location.reload();
            }else{
                ipcRenderer.send('updatePathMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('updatePathMes', "路徑不可空白!");
        }
    })

    ipcRenderer.on('updatePathMes', (event, arg) => {
        updatePathMes.innerHTML = arg
    });

    
});





