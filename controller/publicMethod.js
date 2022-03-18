async function isAttendCheck(isCheck){
    let eventlist = document.getElementById('Event');
    let mes = urlAndPathCheck();
    var AgentCode = document.getElementById("AgentCode").value;
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];       
    
    if (isCheck && mes.length === 0){
        eventlist.disabled=false
        let args ={
            API : 'GetEvents',
            Currency : document.getElementById("Currency").value,
            AgentCode : AgentCode,
            AgentKey : AgentKey
        }      
        let Eventresult = await parent.apiJs.requestAPI(args,parent.apiUrl);
        if (Eventresult['Data'] != null){
            Eventresult['Data'].forEach(function(datas){
                let opt = document.createElement('option')
                opt.value = datas['eventID']
                opt.className = 'eventOption'
                opt.innerHTML = datas['eventID']
                eventlist.appendChild(opt)
            })
        }else{
            let opt = document.createElement('option')
            opt.className = 'eventOption'
            opt.innerHTML = '查無活動'
            eventlist.appendChild(opt)
        }  
        
    }else{
        eventlist.options.length = 0;
        eventlist.disabled=true
        $("#message")[0].innerHTML = mes + $("#message")[0].innerHTML;
    }
    
}

function urlAndPathCheck(mes=''){
    if(parent.chromePath == ''){
        mes += "chromePaht 不可空白</br>"
    }
    if(parent.apiUrl == ''){
        mes += "apiUrl 不可空白</br>"
    }
    if(parent.seamlessApiUrl == ''){
        mes += "seamlessApiUrl 不可空白</br>"
    }
    return mes;
}

function setList(returnObject,element){
    let select = document.getElementById(element);
    if (returnObject != null){
        let obj = returnObject['returnObject'];
        for (let key in obj){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = key+':'+obj[key]
            select.appendChild(opt)
        }
    }else{
        select.innerHTML = '<option>查無資料</option>'
    }
}

function setKeys(data,element){
    let select = document.getElementById(element);
    select.options.length = 0;
    if(data.length != 0){
        for (let key in data){
            let opt = document.createElement('option');
            opt.value = key
            opt.innerHTML = data[key]
            select.appendChild(opt)
        }
    }else{
        select.innerHTML = '<option>查無資料，請至設定新增</option>'
    }
    
}

function search(value,showTable){
    if (value != ""){
        let tableRows = showTable.rows;
        tableRows.forEach(function(ele,ind){
            let id = ele.getElementsByTagName('span')[0].id
            if (id.includes(value)){
                ele.style.display = "";
            }else{
                ele.style.display = "none";
            }
        });
    }else{
        $("#table tbody tr").show();
    }
}

function setUpBrowerArgs(type,object){
    return new Promise((resv, rej) => {
        let datas = {};
        datas['type'] = type;
        datas['object'] = object;
        resv(datas);
    });
}

function testConnect(account,password,url){
    let accountAndPassword = {};
    accountAndPassword['account'] = account;
    accountAndPassword['password'] = password;
    let option = {
        headers: {'Content-Type': 'application/json'},
        url: url,
        method: 'POST',
        data: accountAndPassword
    }
    return new Promise((resv, rej) => {
        parent.axios(option)
        .then((result) => { 
            parent.token =  result.data.returnObject.token ;
            resv("ok")
        })
        .catch((err) => { 
            console.log(err);
            rej("faild")
        })
    });
    

    
}