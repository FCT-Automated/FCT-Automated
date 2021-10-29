$(function() {
    setList(parent.CurrencyList,"Currency");
    setList(parent.GameList,"GameID");
    setList(parent.LanguageList,"LanguageID");
});

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
    let obj = data;
    for (let key in obj){
        let opt = document.createElement('option');
        opt.value = key
        opt.innerHTML = obj[key]
        select.appendChild(opt)
    }
}

async function isAttendCheck(isCheck){
    let eventlist = document.getElementById('Event');
    let mes = urlAndPathCheck();
    if (isCheck && mes.length === 0){
        eventlist.disabled=false
        let args ={
            API : 'GetEvents',
            Currency : document.getElementById("Currency").value,
            AgentCode : document.getElementById("AgentCode").value,
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
    }
    parent.postMessage(JSON.parse(JSON.stringify(mes)),"*");
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