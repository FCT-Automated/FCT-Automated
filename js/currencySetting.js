$(async function() {
    const electron = require('electron');
    let {ipcRenderer} = require('electron');
    const { saveAs } = require('file-saver');

    const net = electron.remote.net;
    const addCurrencyMes = document.getElementById("addCurrencyMes");
    const currencySettingMes = document.getElementById("currencySettingMes");
    const updateCurrencyMes = document.getElementById("updateCurrencyMes");
    const addCurrencyModal = document.getElementById("addCurrencyModal");
    const exportBtn = document.getElementById("export");
    const filesInput = document.getElementById("files");
    const addCurrency = document.getElementById('addCurrency');
    const updateCurrency = document.getElementById('updateCurrency');
    const search = document.getElementById("search");

    var returnObject ;
    var obj;
    var table = document.getElementById("currencyTable").getElementsByTagName('tbody')[0];

    refresh();

    async function refresh(){
        $("#currencyTable tbody").html("");
        returnObject = await getLocalhostApi('/getCurrencyList');
        obj = returnObject['returnObject'];
        if (obj != null){
            Object.keys(obj).sort();
            for (let key in obj){
                let rows = table.rows.length+1
                let row = table.insertRow(-1)
                let id = row.insertCell(0)
                let currencyID = row.insertCell(1)
                let currencyName = row.insertCell(2)
                let update = row.insertCell(3)
                let del = row.insertCell(4)
                id.innerHTML = String(rows)
                
                let currencyIDSpan = document.createElement('span')
                currencyIDSpan.id = key
                currencyIDSpan.innerHTML = key
                currencyID.appendChild(currencyIDSpan)

                let currencyNameSpan = document.createElement('span')
                currencyNameSpan.id = obj[key]
                currencyNameSpan.innerHTML = obj[key]
                currencyName.appendChild(currencyNameSpan)

                //update
                let updateBtn = document.createElement('Button')
                let updateBtnIcon = document.createElement('i')
                updateBtnIcon.className = "fas fa-edit"
                updateBtn.className = "btn btn-default"
                updateBtn.type = "button"
                updateBtn.id = "update"+String(rows)
                updateBtn.dataset.target="#updateCurrencyModal"
                updateBtn.dataset.toggle="modal"
                updateBtn.onclick = function(){
                    document.getElementById('updateCurrencyName').value = '';
                    document.getElementById("updateCurrencyID").innerHTML = key;
                    ipcRenderer.send('updateCurrencyMes', "");
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
        let response = await psotLocalhostApi('/delCurrency',key)
        if (response['returnObject'] == null){
            let targetRow = parseInt(delBtn.id.split('delBtn')[1])
            table.deleteRow(targetRow-1)
            table.rows.forEach(function(ele,ind){
                ind = ind + 1;
                let target = ele.getElementsByTagName('td')[0]
                document.getElementById("update"+String(target.innerHTML)).id = "update"+String(ind)
                document.getElementById("delBtn"+String(target.innerHTML)).id = "delBtn"+String(ind)
                target.innerHTML = String(ind)
                
            })
            ipcRenderer.send('currencySettingMes', key+"刪除成功!");
            $("div.alert").show();
        }
    }

    addCurrency.addEventListener('click',async function(event){
        event.preventDefault();
        let currencyID = document.getElementById('CurrencyID');
        let currencyName = document.getElementById('CurrencyName');
        if(currencyID.checkValidity() && currencyName.checkValidity()){
            let data = {};
            data[currencyID.value] = currencyName.value
            let response = await psotLocalhostApi('/addCurrency',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                document.getElementById("search").value = "";
                refresh();
                ipcRenderer.send('currencySettingMes', currencyID.value+"新增成功!");
                $("div.alert").show();
            }else{
                ipcRenderer.send('addCurrencyMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('addCurrencyMes', "幣別代號或幣別名稱不可空白!");
        }
    })

    updateCurrency.addEventListener('click',async function(event){
        event.preventDefault();
        let currencyID = document.getElementById('updateCurrencyID');
        let currencyName = document.getElementById('updateCurrencyName');
        if(currencyName.checkValidity()){
            let data = {};
            data[currencyID.textContent] = currencyName.value
            let response = await psotLocalhostApi('/updateCurrency',data);
            if (response['returnObject'] == null){
                $(this).prev().click();
                refresh();
                ipcRenderer.send('currencySettingMes',currencyID.textContent+"編輯成功!");
                $("div.alert").show();
            }else{
                ipcRenderer.send('updateCurrencyMes',response['returnObject']);
            }
        }else{
            ipcRenderer.send('updateCurrencyMes', "幣別名稱不可空白!");
        }
    })

    addCurrencyModal.addEventListener('click',function(){
        document.getElementById('CurrencyID').value = "";
        document.getElementById('CurrencyName').value = "";
        ipcRenderer.send('addCurrencyMes', "");

    })

    exportBtn.addEventListener('click', async function(){
        returnObject = await getLocalhostApi('/getCurrencyList');
        obj = returnObject['returnObject'];
        let blob = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "currencyList.json");
    });

    filesInput.onchange = async function(){
        let reader = new FileReader();
        reader.readAsText(await filesInput.files[0]);
        reader.onload = async function(){
            let currencyList = JSON.parse(this.result);
            let response = await psotLocalhostApi('/batchImportCurrencyList',currencyList);
            if (response['returnObject'] != null){
                ipcRenderer.send('currencySettingMes',response['returnObject']);
            }else{
                refresh();
                ipcRenderer.send('currencySettingMes',"成功匯入!");
            }
            $("div.alert").show();
        };
        $("form").get(1).reset()
    }



    search.addEventListener('keyup',function(){
        let searchID = document.getElementById("search").value;
        if (searchID != ""){
            table.rows.forEach(function(ele,ind){
                let id = ele.getElementsByTagName('span')[0].id
                if (id.includes(searchID)){
                    ele.style.display = "";
                }else{
                    ele.style.display = "none";
                }
            });
        }else{
            $("#currencyTable tbody tr").show();
        }
        
    })

    ipcRenderer.on('addCurrencyMes', (event, arg) => {
        addCurrencyMes.innerHTML = arg
    });

    ipcRenderer.on('currencySettingMes', (event, arg) => {
        currencySettingMes.innerHTML = arg
    });

    ipcRenderer.on('updateCurrencyMes', (event, arg) => {
        updateCurrencyMes.innerHTML = arg
    });

    
});





