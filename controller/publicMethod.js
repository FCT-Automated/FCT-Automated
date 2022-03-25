async function isAttendCheck(isCheck){
    let eventlist = document.getElementById('Event');
    let mes = urlAndPathCheck();
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode.value];       
    
    if (isCheck && mes.length === 0){
        eventlist.disabled=false
        let args ={
            API : 'GetEvents',
            Currency : Currency.value,
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

function signIn(account,password,url){
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
        .then(async function(result){ 
            parent.token =  await result.data.returnObject.token ;
            resv(result)
        })
        .catch((err) => { 
            console.log(err);
            rej(err)
        })
    });
}


function getCurrentDateTime(){
    let today = new Date();
    return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
}


//爬蟲方法

function getSoup(url){
    return new Promise((resv, rej) => {
        let params = {
            url:url,
            method:'GET',
            headers: {
                'Content-Type': 'text/html'
            }
        }
        parent.axios(params)
        .then(result => {
            resv(parent.cheerio.load(result.data));
        })
        .catch(error => {
            rej(error);
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

function SumTheElementOfAnArray(result,soup,element){
    let sum=0;
    result.map((k,v) => sum+=parseFloat($(v).text().replace(",","")))
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

//運算
function IsEqualTo(var1,var2){
    return var1 == var2;
}

function NotEqualTo(var1,var2){
    return var1 != var2;
}


function GreaterThan(var1,var2){
    return var1 > var2;
}

function GreaterThanOrEqualTo(var1,var2){
    return var1 >= var2;
}

function LessThan(var1,var2){
    return var1 < var2;
}

function LessThanOrEqualTo(var1,var2){
    return var1 <= var2;
}

function Include(var1,var2){
    return var1.includes(var2);
}

