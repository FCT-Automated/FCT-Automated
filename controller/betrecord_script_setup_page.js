$(async function() {
    
    setOuterList(parent.crawlerScriptList,listTable2,parent.crawlerDB);
    setOuterList(parent.verificationFormulaList,listTable,parent.verificationFormulaDB);

    addRow2.addEventListener('click',function(){
        addRow2Function(null,null);
    });

    addComparisonRow.addEventListener('click',function(){
        addRowFunction(null,null,null,null,null,null);
    });

    addIfRow.addEventListener('click',function(){
        ["if","then"].forEach(type => addRowFunction(null,null,null,null,null,type));
    });

    crawlerTest2.addEventListener('click',async function(){
        let soup = await getSoup(url2.value)
        let rowLength = table2.rows.length;
        var result;
        for (let i = 0; i < rowLength; i++){
            result = window[table2.rows.item(i).cells[1].children[0].value](result,soup,table2.rows.item(i).cells[2].children[0].value);      
        }
        console.log(result);
    });

    addBtn2.addEventListener('click',function(event){
        addScript2(event);
    });

    addBtn.addEventListener('click',function(event){
        addScript(event);
    });

    updateBtn2.addEventListener('click',function(event){
        updateScript2(event);
    });

    updateBtn.addEventListener('click',function(event){
        updateScript(event);
    })

    clickModal.addEventListener('click',function(){
        $("#table1 tr").remove();
        $("#name1")[0].disabled = false; 
        $("#name1")[0].value = ""; 
        $("#addMessage")[0].innerHTML = "";
        $("#addBtn")[0].innerHTML = "確定新增";
        updateBtn.style.display = "none";
        addBtn.style.display = "block";
    });

    clickModal2.addEventListener('click',function(){
        $("#table2 tr").remove();
        $("#table2").prepend('<tr><td>1</td><td><select style="max-width:180px"><option value="initLoadedCheerio">initLoadedCheerio</option></select></td><td><textarea style="width:100%"></textarea></td><td></td></tr>')
        $("#name2")[0].disabled = false; 
        $("#name2")[0].value = ""; 
        $("#addMessage2")[0].innerHTML = "";
        $("#addBtn2")[0].innerHTML = "確定新增";
        updateBtn2.style.display = "none";
        addBtn2.style.display = "block";
    });

    importBtn2.addEventListener('click',function(){
        $('#files2').click();
    });

    files2.onchange = function(){
        myImport2();
    }

    exportBtn2.addEventListener('click',function(){
        myExport2();
    });
    ///
    importBtn.addEventListener('click',function(){
        $('#files').click();
    });

    files.onchange = function(){
        myImport();
    }

    exportBtn.addEventListener('click',function(){
        myExport();
    });

});

async function myImport2(){
    let reader = new FileReader();
    reader.readAsText(await files2.files[0]);
    reader.onload = async function(){
        var datas = JSON.parse(this.result);
        for (let data of datas){
            if(!parent.crawlerScriptList.includes(Object.keys(data)[0])){
                let response = await parent.psotLocalhostApi('/addScript',[parent.crawlerDB,data]);
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
        parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
        setOuterList(parent.crawlerScriptList,listTable2,parent.crawlerDB);
    };
}

async function myExport2(){
    var result = [];
    for (const [index, value] of parent.crawlerScriptList.entries()){
        let response = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,value]);
        result.push({});
        result[index][value] = response['returnObject'];  
    }
    let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    parent.saveAs(blob, "驗證腳本.json");
}

async function myImport(){
    let reader = new FileReader();
    reader.readAsText(await files.files[0]);
    reader.onload = async function(){
        var datas = JSON.parse(this.result);
        for (let data of datas){
            if(!parent.verificationFormulaList.includes(Object.keys(data)[0])){
                let response = await parent.psotLocalhostApi('/addScript',[parent.verificationFormulaDB,data]);
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
        parent.verificationFormulaList = await parent.psotLocalhostApi('/getKeys',parent.verificationFormulaDB);
        setOuterList(parent.verificationFormulaList,listTable,parent.verificationFormulaDB);
    };
}

async function myExport(){
    var result = [];
    for (const [index, value] of parent.verificationFormulaList.entries()){
        let response = await parent.psotLocalhostApi('/getScript',[parent.verificationFormulaDB,value]);
        result.push({});
        result[index][value] = response['returnObject'];  
    }
    let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    parent.saveAs(blob, "值腳本.json");
}


async function addScript2(event){
    if($("#name2")[0].checkValidity()){
        event.preventDefault();
        let rowLength = table2.rows.length;
        let data = {};
        data[name2.value] = {};
        let key;
        let value;
        for (let i = 0; i < rowLength; i++){
            key = (i+1).toString()+"_" +table2.rows.item(i).cells[1].children[0].value 
            value = table2.rows.item(i).cells[2].children[0].value
            data[name2.value][key] = value          
        }
        let response;
        response = await parent.psotLocalhostApi('/addScript',[parent.crawlerDB,data]);
        if (response['returnObject'] == null){
            parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
            setOuterList(parent.crawlerScriptList,listTable2,parent.crawlerDB);
            message.innerHTML = name2.value+"新增成功!";
            $("div.alert").show();
            $("#Modal2").modal("hide");
        }else{
            addMessage2.innerHTML = response['returnObject'];
        }
    }
}

async function addScript(event){
    if($("#name1")[0].checkValidity()){
        if(table1.rows.length > 0){
            event.preventDefault();
            let rowLength = table1.rows.length;
            let data = {};
            let datas = {};
            data[name1.value] = {"comparisonMethod":[],"ifMethod":[]};
            for (let i = 0; i < rowLength; i++){
                let isIf= table1.rows.item(i).innerHTML.includes("if");
                let isThen= table1.rows.item(i).innerHTML.includes("then");
                if(isIf){
                    data[name1.value]["ifMethod"].push({
                        "if":{
                            "var1":table1.rows.item(i).cells[1].children[0].value,
                            "textarea1":table1.rows.item(i).cells[1].children[1].value,
                            "operator":table1.rows.item(i).cells[2].children[0].value,
                            "var2":table1.rows.item(i).cells[3].children[0].value,
                            "textarea2":table1.rows.item(i).cells[3].children[1].value
                        },
                        "then":{
                            "var1":table1.rows.item(i+1).cells[0].children[0].value,
                            "textarea1":table1.rows.item(i+1).cells[0].children[1].value,
                            "operator":table1.rows.item(i+1).cells[1].children[0].value,
                            "var2":table1.rows.item(i+1).cells[2].children[0].value,
                            "textarea2":table1.rows.item(i+1).cells[2].children[1].value
                        }
                    });
                }else if(!isThen){
                    data[name1.value]["comparisonMethod"].push({
                        "var1":table1.rows.item(i).cells[1].children[0].value,
                        "textarea1":table1.rows.item(i).cells[1].children[1].value,
                        "operator":table1.rows.item(i).cells[2].children[0].value,
                        "var2":table1.rows.item(i).cells[3].children[0].value,
                        "textarea2":table1.rows.item(i).cells[3].children[1].value
                    });
                }
            }
            datas[name1.value] = {
                "comparisonMethod":JSON.stringify(data[name1.value]["comparisonMethod"]),
                "ifMethod":JSON.stringify(data[name1.value]["ifMethod"])
            };            
            let response;
            response = await parent.psotLocalhostApi('/addScript',[parent.verificationFormulaDB,datas]);
            if (response['returnObject'] == null){
                parent.verificationFormulaList = await parent.psotLocalhostApi('/getKeys',parent.verificationFormulaDB);
                setOuterList(parent.verificationFormulaList,listTable,parent.verificationFormulaDB);
                message.innerHTML = name1.value+"新增成功!";
                $("div.alert").show();
                $("#Modal").modal("hide");
            }else{
                addMessage.innerHTML = response['returnObject'];
                
            }
        }else{
            addMessage.innerHTML = "至少新增一列!";
        }
        
    }
}

async function updateScript(event){
    event.preventDefault();
    let rowLength = table1.rows.length;
    let data = {};
    let datas = {};
    data[name1.value] = {"comparisonMethod":[],"ifMethod":[]};
    for (let i = 0; i < rowLength; i++){
        let isIf= table1.rows.item(i).innerHTML.includes("if");
        let isThen= table1.rows.item(i).innerHTML.includes("then");
        if(isIf){
            data[name1.value]["ifMethod"].push({
                "if":{
                    "var1":table1.rows.item(i).cells[1].children[0].value,
                    "textarea1":table1.rows.item(i).cells[1].children[1].value,
                    "operator":table1.rows.item(i).cells[2].children[0].value,
                    "var2":table1.rows.item(i).cells[3].children[0].value,
                    "textarea2":table1.rows.item(i).cells[3].children[1].value
                },
                "then":{
                    "var1":table1.rows.item(i+1).cells[0].children[0].value,
                    "textarea1":table1.rows.item(i+1).cells[0].children[1].value,
                    "operator":table1.rows.item(i+1).cells[1].children[0].value,
                    "var2":table1.rows.item(i+1).cells[2].children[0].value,
                    "textarea2":table1.rows.item(i+1).cells[2].children[1].value
                }
            });
        }else if(!isThen){
            data[name1.value]["comparisonMethod"].push({
                "var1":table1.rows.item(i).cells[1].children[0].value,
                "textarea1":table1.rows.item(i).cells[1].children[1].value,
                "operator":table1.rows.item(i).cells[2].children[0].value,
                "var2":table1.rows.item(i).cells[3].children[0].value,
                "textarea2":table1.rows.item(i).cells[3].children[1].value
            });
        }
    }
    datas[name1.value] = {
        "comparisonMethod":JSON.stringify(data[name1.value]["comparisonMethod"]),
        "ifMethod":JSON.stringify(data[name1.value]["ifMethod"])
    };            
    let response;
    response = await parent.psotLocalhostApi('/updateScript',[parent.verificationFormulaDB,datas]);
    if (response['returnObject'] == null){
        parent.verificationFormulaList = await parent.psotLocalhostApi('/getKeys',parent.verificationFormulaDB);
        setOuterList(parent.verificationFormulaList,listTable,parent.verificationFormulaDB);
        message.innerHTML = name1.value+"修改成功!";
        $("div.alert").show();
        $("#Modal").modal("hide");
    }else{
        addMessage.innerHTML = response['returnObject'];
    }
    
}

async function updateScript2(event){
    event.preventDefault();
    let rowLength = table1.rows.length;
    let data = {};
    data[name2.value] = {};
    let key;
    let value;
    for (let i = 0; i < rowLength; i++){
        key = (i+1).toString()+"_" +table2.rows.item(i).cells[1].children[0].value 
        value = table2.rows.item(i).cells[2].children[0].value
        data[name2.value][key] = value          
    }
    let response;
    response = await parent.psotLocalhostApi('/updateScript',[parent.crawlerDB,data]);
    if (response['returnObject'] == null){
        parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
        setOuterList(parent.crawlerScriptList,listTable2,parent.crawlerDB);
        message.innerHTML = name2.value+"修改成功!";
        $("div.alert").show();
        $("#Modal2").modal("hide");
    }else{
        addMessage2.innerHTML = response['returnObject'];
    }
    
}


async function setOuterList(list,tables,db){
    let obj = list;
    $(tables).empty();
    for (let key in obj){
        let rows = tables.rows.length+1
        let row = tables.insertRow(-1)
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
        exportSeparatelyBtn.onclick = async function(){exportSeparatelyMethod(obj,key);} 
        exportSeparatelyBtn.appendChild(exportBtnIcon);
        exportSeparately.appendChild(exportSeparatelyBtn);

        //update
        let updateBt = document.createElement('Button')
        let updateBtnIcon = document.createElement('i')
        updateBtnIcon.className = "fas fa-edit"
        updateBt.className = "btn btn-default"
        updateBt.type = "button"
        updateBt.dataset.toggle="modal"
        updateBt.onclick = async function(){updateMethod(updateBt,obj,key,db);} 
        updateBt.appendChild(updateBtnIcon)
        update.appendChild(updateBt)

        //del
        let delBtn = document.createElement('Button');
        let delBtnIcon = document.createElement('i');
        delBtnIcon.className = "fas fa-trash-alt";
        delBtn.className = "btn";
        delBtn.onclick = async function(){delScript(obj[key],delBtn,tables,db)} 
        delBtn.appendChild(delBtnIcon);
        del.appendChild(delBtn);
    }
}

async function exportSeparatelyMethod(obj,key){
    var result = [];
    result.push({});
    let response = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,obj[key]])
    result[0][obj[key]] = response['returnObject'];
    let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    parent.saveAs(blob, obj[key]+".json");
}

async function updateMethod(Btn,obj,key,db){    
    let response;
    if(parent.crawlerDB == db){
        Btn.dataset.target="#Modal2"
        updateBtn2.style.display = "block";
        addBtn2.style.display = "none";
        $("#name2")[0].disabled = true;
        $("#name2")[0].value = obj[key]; 
        $("#table2 tr").remove();
        addMessage2.innerHTML = "";
        response= await parent.psotLocalhostApi('/getScript',[db,obj[key]]);
        for(const k of Object.keys(response['returnObject']).sort()){
            let d = response['returnObject'][k];
            addRow2Function(k.split("_")[1],d);   
        }
    }else if(parent.verificationFormulaDB == db){
        Btn.dataset.target="#Modal"
        updateBtn.style.display = "block";
        addBtn.style.display = "none";
        $("#name1")[0].disabled = true;
        $("#name1")[0].value = obj[key]; 
        $("#table1 tr").remove();
        addMessage.innerHTML = "";
        response= await parent.psotLocalhostApi('/getScript',[db,obj[key]]);
        for (let k in response['returnObject']){
            let datas = response['returnObject'][k];
            let array = JSON.parse(datas);
            if(k == "comparisonMethod"){
                array.forEach((data) => {
                    addRowFunction(data['var1'],data['operator'],data['var2'],data['textarea1'],data['textarea2'],null);
                });
            }else if(k == "ifMethod"){
                array.forEach((data) => {
                    for (let [type, va] of Object.entries(data)) {
                        addRowFunction(va['var1'],va['operator'],va['var2'],va['textarea1'],va['textarea2'],type);
                    }
                });
            }
        }
    }
    
    
    
    
}

async function delScript(key,delBtn,tables,db){
    let response = await parent.psotLocalhostApi('/delScript',[db,key])
    if (response['returnObject'] == null){
        tables.deleteRow($(tables.getElementsByTagName('tr')).index(delBtn.parentElement.parentElement))
        let tableRows = tables.rows;
        tableRows.forEach(function(ele,ind){
            ind = ind + 1;
            let target = ele.getElementsByTagName('td')[0]
            target.innerHTML = String(ind)
        })
        message.innerHTML = key+"刪除成功!";
        if(parent.crawlerDB == db){
            parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',db);
        }else if(parent.verificationFormulaDB == db){
            parent.verificationFormulaList = await parent.psotLocalhostApi('/getKeys',db);
        }
        $("div.alert").show();
    }
}

function addRow2Function(key,value){
    let rows = table2.rows.length
    let row = table2.insertRow(-1)
    let id = row.insertCell(0)
    let method = row.insertCell(1)
    let element = row.insertCell(2)
    
    id.innerHTML = String(rows+1)
    let select = document.createElement('select')
    var opts;
    if(key == "initLoadedCheerio"){
        opts={
            "initLoadedCheerio":"initLoadedCheerio"
        }
    }else{
        opts={
            "LoadedCheerio":"LoadedCheerio",
            "ToCheerio":"ToCheerio",
            "SumTheElementOfAnArray":"SumTheElementOfAnArray",
            "Text":"Text",           
            "Index":"Index",
            "Html":"Html"
        }
        //建立delBtn
        let delBtn = row.insertCell(3)
        let btn = document.createElement('Button')
        let btnicon = document.createElement('i')
        btn.className = "btn"
        btnicon.className = "fas fa-trash-alt"
        btn.appendChild(btnicon)
        btn.onclick = function(){delRow2Function(btn)} 
        delBtn.appendChild(btn)
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
    select.style.maxWidth = "180px";
    select.onchange = function(){selectOption(select)} 
    method.appendChild(select) 
    ////
    let textarea = document.createElement('textarea')
    textarea.style.width = "100%";
    element.appendChild(textarea)
    selectOption(select)
    textarea.value = value;
    
}

function addRowFunction(var1Select,operatorSelect,var2Select,textareaValue1,textareaValue2,type){
    let rows = table1.rows.length
    let row = table1.insertRow(-1)
    let id = row.insertCell(0)
    let var1 = row.insertCell(1)
    let operator = row.insertCell(2)
    let var2 = row.insertCell(3)
    let delBtn = row.insertCell(4)
    let ifRow = table1.outerHTML.match(/if/g)
    if(ifRow==null){
        ifRow = 0;
    }else{
        ifRow = ifRow.length;
    }
    id.innerHTML = String(rows-ifRow+1)
    ////
    if(type != null){
        var1.prepend(type)
    }
    let select2 = document.createElement('select')
    let opts2 = {};
    parent.crawlerScriptList.forEach((v)=>{
        opts2[v] = v;
    });
    opts2["Other"] = "其他(自填)";
    setSelect(opts2,select2,var1Select);
    select2.style.maxWidth = "120px";
    select2.onchange = function(){isSelectOther(select2)} 
    var1.appendChild(select2)
    let textarea = document.createElement('textarea');
    if(select2.value == "Other"){
        textarea.style.display = "block";
        textarea.innerHTML = textareaValue1
    }else{
        textarea.style.display = "none";
        textarea.innerHTML = "";
    }
    var1.appendChild(textarea)
    ////
    let select3 = document.createElement('select')
    let opts3={
        "IsEqualTo":"==",
        "NotEqualTo":"!=",
        "GreaterThan":">",
        "GreaterThanOrEqualTo":">=",
        "LessThan":"<",
        "LessThanOrEqualTo":"<=",
        "Include":"包含(Include)"
    }
    setSelect(opts3,select3,operatorSelect);
    operator.appendChild(select3)
    ////
    let select4 = document.createElement('select')
    setSelect(opts2,select4,var2Select);
    select4.style.maxWidth = "120px";
    select4.onchange = function(){isSelectOther(select4)} 
    var2.appendChild(select4)
    let textarea2 = document.createElement('textarea');
    if(select4.value == "Other"){
        textarea2.style.display = "block";
        textarea2.innerHTML = textareaValue2
    }else{
        textarea2.style.display = "none";
        textarea2.innerHTML = "";
    }
    var2.appendChild(textarea2)
    //建立delBtn
    let btn = document.createElement('Button')
    let btnicon = document.createElement('i')
    btn.className = "btn"
    if(type == "if"){
        id.rowSpan = "2";
        delBtn.rowSpan = "2";
    }
    btnicon.className = "fas fa-trash-alt"
    btn.appendChild(btnicon)
    btn.onclick = function(){delRowFunction(btn)}
    delBtn.appendChild(btn)
    if(type == "then"){
        id.remove();
        delBtn.remove();   
    }

}

function delRow2Function(btnHtml){
    let delRowInd =$("#table2 tr").index(btnHtml.parentElement.parentElement);
    table2.deleteRow(delRowInd)
    Object.keys(table2.rows).forEach(function(ind){
        var index = parseInt(ind);
        var target = table2.rows[index].getElementsByTagName('td')[0]
        target.innerHTML = String(index+1)
    })
}

function delRowFunction(btnHtml){
    let delRowInd =$("#table1 tr").index(btnHtml.parentElement.parentElement);
    for(let i= delRowInd+1; i<table1.rows.length; i++){
        let target = $("#table1 tr")[i].getElementsByTagName('td');
        if(target.length == 5) {
            target[0].innerHTML = String(parseInt(target[0].innerHTML)-1)
        }
        
    }
    
    let netElement = btnHtml.parentElement.parentElement.nextElementSibling;
    if(netElement != null){
        if(netElement.getElementsByTagName("td").length != 5){
            table1.deleteRow(delRowInd);
        }
    }
        
    table1.deleteRow(delRowInd);
    
}

function selectOption(select){
    let target = select.parentElement.parentElement.getElementsByTagName('td')[2].firstElementChild
    target.disabled = true
    target.value = "";
    if(select.value == "initLoadedCheerio" || select.value == "LoadedCheerio" || select.value == "Index"){
        target.disabled = false
    }
}

function isSelectOther(select){
    if(select.value == "Other"){
        select.nextElementSibling.style.display = "block";
    }else{
        select.nextElementSibling.style.display = "none";
    }
}

function setSelect(options,select,key){
    for (const [k, v] of Object.entries(options)) {
        let opt = document.createElement('option')
        opt.value = k
        opt.innerHTML = v
        if( key == k ){
            opt.selected = "selected";
        }
        select.appendChild(opt)
    }
}





