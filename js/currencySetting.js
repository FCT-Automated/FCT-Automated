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




    
});





