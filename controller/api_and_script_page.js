$(function() {
    document.title = location.search.split("?")[1];
    window[document.title]();
    
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var apiSelect = document.getElementById('API');
    const submit = document.getElementById('submit');
    const clearLog = document.getElementById('clearLog');

    changeApi(apiSelect.value);
    setList(parent.CurrencyList,"Currency");
    setList(parent.GameList,"GameID");
    setList(parent.LanguageList,"LanguageID");
    setList(parent[parent.env+"AgentKeyList"],"AgentCode");

    apiSelect.addEventListener('change', function(){
        changeApi(apiSelect.value);
    });

    attend.addEventListener('change',function(){
        isAttendCheck(this.checked);
    });

    notAttend.addEventListener('change',function(){
        isAttendCheck(false);
    });

    submit.addEventListener("click",async function(event){ 
        run(event,apiSelect.value);
    });

    clearLog.addEventListener("click",function(){
        $("#message")[0].innerHTML = "";
    });
});
    
function api(){
    $('#API')[0].disabled = false
    $('.scriptList').hide()
    $('.multiple').hide()
    $('.tip').hide()
}

function script(){
    $('.scriptList').show()
    setKeys(parent.hangUpScriptList,"list");
    $('#API')[0].disabled = true
    $('.tip').show()

    
}


function changeApi(curAPI){
    switch (curAPI) {
        case 'Login':
            $('.field_Login').show();
            $('.field_SetPoints').hide();
            $('#other')[0].value = "HomeUrl:https://www.mearhh.com,JackpotStatus:true";
            break
        case 'SetPoints':
            $('.field_SetPoints').show();
            $('.field_Login').hide();
            $('#other')[0].value = "";
            break
        case 'KickOut':
            $('.field_SetPoints').hide();
            $('.field_Login').hide();
            $('#other')[0].value = "";
            break
    }
}


//submit
async function run(event,apiValue){
    submit.disabled = true;
    submit.innerHTML = "處理中請稍等..";
    try{
        if(checkValidity()){
            let MemberAccounts = document.getElementById("MemberAccount").value.split(",");
            event.preventDefault();
            let mes = urlAndPathCheck();
            if(mes.length === 0){
                var AgentCode = document.getElementById("AgentCode").value;
                var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode]; 
                if(document.title == 'script' && $("#multipleYes")[0].checked){
                    let args ={
                        API : "Login",
                        Currency : document.getElementById("Currency").value,
                        GameID : document.getElementById("GameID").value,
                        AgentCode : AgentCode,
                        AgentKey : AgentKey,
                        LanguageID : document.getElementById("LanguageID").value
                    }
                    let autoScriptList = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,$("#list option:selected").text()]);
                    submit.innerHTML = "送出";
                    submit.disabled = false;
                    await parent.browser.AutoScript(MemberAccounts,args,autoScriptList,document.getElementById("multipleMin").value,parent.apiUrl,parent.seamlessApiUrl);
                }else{
                    for(let MemberAccount of MemberAccounts){
                        if(typeof window[apiValue] === "function"){
                            mes = await window[apiValue](mes,MemberAccount);
                        }else{
                            mes = "查無此Api Function</br>"
                        }
                        $("#message")[0].innerHTML = mes + $("#message")[0].innerHTML;
                    }
                }
            }else{
                $("#message")[0].innerHTML = mes + $("#message")[0].innerHTML;
            }  
        }
        submit.innerHTML = "送出";
        submit.disabled = false;
    }
    catch (e){
        submit.innerHTML = "送出";
        submit.disabled = false;
        $("#message")[0].innerHTML = "請查看console的錯誤訊息!</br>" + $("#message")[0].innerHTML;
        console.log(e);
    }
    
    
    
}

function checkValidity(){
    if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
        if(document.title == "script" && $("#multipleYes")[0].checked){
            if ($("#multipleMin")[0].checkValidity()){
                return true;
            }else{
                return false;
            }
        }
        return true;
    }else{
        return false;
    }
}

async function Login(mes,MemberAccount){
    var AgentCode = document.getElementById("AgentCode").value;
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];       
    let args ={
        API : "Login",
        Currency : document.getElementById("Currency").value,
        GameID : document.getElementById("GameID").value,
        AgentCode : document.getElementById("AgentCode").value,
        AgentKey : AgentKey,
        MemberAccount : MemberAccount,
        LanguageID : document.getElementById("LanguageID").value,
        Other : document.getElementById("other").value
    }
    let code;
    let response = await parent.apiJs.requestAPI(args,parent.apiUrl)
    if(response){
        code = response.Result;
    }else{
        code = 1;
    }
    if ( code == 0){
        if(document.title == 'script'){
            let data = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,$("#list option:selected").text()]);
            data['user'] = args
            await parent.browser.createBrowser(response.Url,await setUpBrowerArgs('Script',data),parent.apiUrl,parent.seamlessApiUrl);
        }else{
            await parent.browser.createBrowser(response.Url,await setUpBrowerArgs('Normal',{}),parent.apiUrl,parent.seamlessApiUrl);
        }
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 登入成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 登入失敗 - Error："+response+"!! ]</br>";
    }
    
    return mes;
}

function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function SetPoints(mes,MemberAccount){
    let args;
    let response;
    let code;
    let wallet = document.getElementById("Wallet");
    var AgentCode = document.getElementById("AgentCode").value;
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];       
    if (wallet.options[wallet.selectedIndex].id == "seamlessWallet"){
        args = {
            API : 'SetJson',
            Currency : document.getElementById("Currency").value,
            AgentCode : AgentCode,
            AgentKey : AgentKey,
            MemberAccount : MemberAccount,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestSeamlessAPI(args,parent.seamlessApiUrl);
        if(response){
            code = response.Result;
        }else{
            code = 1;
        }
        if ( code == 0){
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+AgentCode+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.Points+"]</br>"
        }
        
    }else{
        args = {
            API : 'SetPoints',
            Currency : document.getElementById("Currency").value,
            AgentCode : AgentCode,
            AgentKey : AgentKey,
            MemberAccount : MemberAccount,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestAPI(args,parent.apiUrl);
        if(response){
            code = response.Result;
        }else{
            code = 1;
        }
        if ( code == 0){
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+AgentCode+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.AfterPoint+"，BankID："+response.BankID+"]</br>"
        }
    }
    if(code !=0){
        mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 轉點失敗!! - Error"+response+"]</br>"
    }
    
    return mes;
}

async function KickOut(mes,MemberAccount){
    var AgentCode = document.getElementById("AgentCode").value;
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];       
    let args ={
        API : 'KickOut',
        Currency : document.getElementById("Currency").value,
        AgentCode : AgentCode,
        AgentKey : AgentKey,
        MemberAccount : MemberAccount,
    }
    let code;
    let response = await parent.apiJs.requestAPI(args,parent.apiUrl);
    if(response){
        code = response.Result;
    }else{
        code = 1;
    }
    if ( code == 0){
        mes = "Log:[ KickOut- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 踢出成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 踢出失敗 - Error："+response+"!! ]</br>"
    }

    return mes;
    
}



