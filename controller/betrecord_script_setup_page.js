$(async function() {
    
    setList2();

    addRow2.addEventListener('click',function(){
        addRow2Function(null,null);
    });

    addComparisonRow.addEventListener('click',function(){
        addRowFunction(null,null,null);
    });

    addIfRow.addEventListener('click',function(){
        ["if","then"].forEach(type => addRowFunction(null,null,type));
    });

    crawlerTest2.addEventListener('click',async function(){
        let soup = await getSoup()
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
        myImport();
    }

    exportBtn2.addEventListener('click',function(){
        myExport();
    });

});

async function myImport(){
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
        setList2();
    };
}

async function myExport(){
    var result = [];
    for (const [index, value] of parent.crawlerScriptList.entries()){
        let response = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,value]);
        result.push({});
        result[index][value] = response['returnObject'];  
    }
    let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    parent.saveAs(blob, "驗證腳本.json");
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
            setList2();
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
            data[name1.value] = {};
            let key;
            let value;
            for (let i = 0; i < rowLength; i++){
                key = (i+1).toString()+"_" +table2.rows.item(i).cells[1].children[0].value 
                value = table2.rows.item(i).cells[2].children[0].value
                debugger
                data[name2.value][key] = value          
            }
            let response;
            // response = await parent.psotLocalhostApi('/addScript',[parent.crawlerDB,data]);
            // if (response['returnObject'] == null){
            //     parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
            //     setList2();
            //     message.innerHTML = name2.value+"新增成功!";
            //     $("div.alert").show();
            //     $("#Modal2").modal("hide");
            // }else{
            //     addMessage.innerHTML = response['returnObject'];
                
            // }
        }else{
            addMessage.innerHTML = "至少新增一列!";
        }
        
    }
}

async function updateScript2(event){
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
    response = await parent.psotLocalhostApi('/updateScript',[parent.crawlerDB,data]);
    if (response['returnObject'] == null){
        parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
        setList2();
        message.innerHTML = name2.value+"修改成功!";
        $("div.alert").show();
        $("#Modal2").modal("hide");
    }else{
        addMessage2.innerHTML = response['returnObject'];
    }
    
}


async function setList2(){
    let obj = parent.crawlerScriptList;
    $('#listTable2').empty();
    for (let key in obj){
        let rows = listTable2.rows.length+1
        let row = listTable2.insertRow(-1)
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
        let updateBtn = document.createElement('Button')
        let updateBtnIcon = document.createElement('i')
        updateBtnIcon.className = "fas fa-edit"
        updateBtn.className = "btn btn-default"
        updateBtn.type = "button"
        updateBtn.dataset.target="#Modal2"
        updateBtn.dataset.toggle="modal"
        updateBtn.onclick = async function(){updateMethod(obj,key);} 
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

async function exportSeparatelyMethod(obj,key){
    var result = [];
    result.push({});
    let response = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,obj[key]])
    result[0][obj[key]] = response['returnObject'];
    let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    parent.saveAs(blob, obj[key]+".json");
}

async function updateMethod(obj,key){
    updateBtn2.style.display = "block";
    addBtn2.style.display = "none";
    $("#name2")[0].disabled = true;
    $("#name2")[0].value = obj[key]; 
    $("#table2 tr").remove();
    addMessage.innerHTML = "";
    let response = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,obj[key]])
    for (let k in response['returnObject']){
        let d = response['returnObject'][k];
        addRow2Function(k.split("_")[1],d);    
        
    }
    
}

async function delScript(key,delBtn){
    let response = await parent.psotLocalhostApi('/delScript',[parent.crawlerDB,key])
    if (response['returnObject'] == null){
        listTable2.deleteRow($('#listTable2 tr').index(delBtn.parentElement.parentElement))
        let tableRows = listTable2.rows;
        tableRows.forEach(function(ele,ind){
            ind = ind + 1;
            let target = ele.getElementsByTagName('td')[0]
            target.innerHTML = String(ind)
        })
        message.innerHTML = key+"刪除成功!";
        parent.crawlerScriptList = await parent.psotLocalhostApi('/getKeys',parent.crawlerDB);
        $("div.alert").show();
    }
}

function addRow2Function(key,value){
    let rows = table2.rows.length
    let row = table2.insertRow(-1)
    let id = row.insertCell(0)
    let method = row.insertCell(1)
    let element = row.insertCell(2)
    let delBtn = row.insertCell(3)
    id.innerHTML = String(rows+1)
    let select = document.createElement('select')
    var opts;
    if(key == "initLoadedCheerio"){
        opts={
            "initLoadedCheerio":"initLoadedCheerio"
        }
    }else{
        opts={
            "Find":"Find",
            "Text":"Text",
            "SumTheElementOfAnArray":"SumTheElementOfAnArray",
            "LoadedCheerio":"LoadedCheerio",
            "ToCheerio":"ToCheerio",
            "Index":"Index",
            "Html":"Html"
        }
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
    //建立delBtn
    let btn = document.createElement('Button')
    let btnicon = document.createElement('i')
    btn.className = "btn"
    btnicon.className = "fas fa-trash-alt"
    btn.appendChild(btnicon)
    btn.onclick = function(){delRow2Function(btn)} 
    delBtn.appendChild(btn)
}

function addRowFunction(key,value,type){
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
    let opts2 = parent.crawlerScriptList;
    opts2["Other"] = "其他(自填)";
    setSelect(opts2,select2);
    select2.style.maxWidth = "120px";
    select2.onchange = function(){isSelectOther(select2)} 
    var1.appendChild(select2)
    let textarea = document.createElement('textarea');
    textarea.style.display = "none";
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
    setSelect(opts3,select3);
    operator.appendChild(select3)
    ////
    let select4 = document.createElement('select')
    setSelect(opts2,select4);
    select4.style.maxWidth = "120px";
    select4.onchange = function(){isSelectOther(select4)} 
    var2.appendChild(select4)
    let textarea2 = document.createElement('textarea');
    textarea2.style.display = "none";
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
        let target = $("#table1 tr")[i].getElementsByTagName('td')[0]
        target.innerHTML = String(parseInt(target.innerHTML)-1)
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
    if(select.value == "Find" || select.value == "initLoadedCheerio" || select.value == "LoadedCheerio" || select.value == "Index"){
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

function setSelect(options,select){
    for (const [k, v] of Object.entries(options)) {
        let opt = document.createElement('option')
        opt.value = k
        opt.innerHTML = v
        select.appendChild(opt)
    }
}


//爬蟲方法

function getSoup(){
    return new Promise((resv, rej) => {
        let params = {
            url:url2.value,
            method:'GET',
        }
        parent.axios(params)
        .then(async function(result){
            resv(await parent.cheerio.load(result.data));
        })
        .catch((err)=>{
            console.log(err)
        })
    });
}

function initLoadedCheerio(result,soup,element){
    return soup(element);
}

function LoadedCheerio(result,soup,element){
    return result(element);
}

function Text(result,soup,element){
    return result.text();
}

function Find(result,soup,element){
    return result.find(element);
}

function SumTheElementOfAnArray(result,soup,element){
    let sum=0;
    result.map((k,v) => sum+=parseFloat($(v).text()))
    var m = Number((Math.abs(sum) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(sum);
    
}

function Index(result,soup,ind){
    return result[ind];
}

function Html(result,soup,element){
    return result.html();
}

function ToCheerio(result,soup,element){
    return parent.cheerio.load(result);
}




