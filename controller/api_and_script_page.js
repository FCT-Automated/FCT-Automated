$(function() {
    document.title = location.search.split("?")[1];
    window[document.title]();
    
    changeApi(API.value);
    setList(parent.CurrencyList,"Currency");
    setList(parent.GameList,"GameID");
    setList(parent.LanguageList,"LanguageID");
    setList(parent[parent.env+"AgentKeyList"],"AgentCode");

    API.addEventListener('change', function(){
        changeApi(API.value);
    });

    attend.addEventListener('change',function(){
        isAttendCheck(this.checked);
    });

    notAttend.addEventListener('change',function(){
        isAttendCheck(false);
    });

    submit.addEventListener("click",async function(event){ 
        run(event,$("form :visible").serializeArray());
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
            $('#other')[0].value = "";
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
async function run(event,formData){
    submit.disabled = true;
    submit.innerHTML = "處理中請稍等..";
    try{
        if(checkValidity()){
            let MemberAccounts = formData_find("MemberAccount",formData).split(",");
            event.preventDefault();
            let mes = urlAndPathCheck();
            if(mes.length === 0){
                var AgentCode = formData_find("AgentCode",formData);
                var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode]; 
                if(document.title == 'script' && $("#multipleYes")[0].checked){
                    let args ={
                        API : "Login",
                        Currency : formData_find("Currency",formData),
                        GameID : formData_find("GameID",formData),
                        AgentCode : AgentCode,
                        AgentKey : AgentKey,
                        LanguageID : formData_find("LanguageID",formData)
                    }
                    let autoScriptList = await parent.psotLocalhostApi('/getScript',[parent.hangUpDB,$("#list option:selected").text()]);
                    submit.innerHTML = "送出";
                    submit.disabled = false;
                    await parent.browser.AutoScript(MemberAccounts,args,autoScriptList,formData_find("multipleMin",formData),parent.apiUrl,parent.seamlessApiUrl);
                }else{
                    for(let MemberAccount of MemberAccounts){
                        if(typeof window[API.value] === "function"){
                            mes = await window[API.value](mes,MemberAccount,formData);
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
        $("#message")[0].innerHTML = "請查看developer tools!</br>" + $("#message")[0].innerHTML;
        console.log(e);
    } 
    
}

function formData_find(target,formData){
    return formData.find(o => o.name === target)['value'];
}

function checkValidity(){
    if (AgentCode.checkValidity() && MemberAccount.checkValidity()){
        if(document.title == "script" && $("#multipleYes")[0].checked){
            if (multipleMin.checkValidity()){
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

//API
async function Login(mes,MemberAccount,formData){
    let AgentCode = formData_find("AgentCode",formData);
    let AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];       
    try{
        let Other = formData_find("other",formData) != "" ? JSON.parse(formData_find("other",formData)) :"{}" ;
        let args ={
            API : "Login",
            Currency : formData_find("Currency",formData),
            GameID : formData_find("GameID",formData),
            AgentCode : AgentCode,
            AgentKey : AgentKey,
            MemberAccount : MemberAccount,
            LanguageID : formData_find("LanguageID",formData),
            Other : Other
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
            mes = "Log:[ login- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 登入失敗 - Error："+code+"!! ]</br>";
        }
    }catch{
        mes = "其他參數請填寫JSON格式!</br>";
    }
        
    return mes;
}

function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function SetPoints(mes,MemberAccount,formData){
    let args;
    let response;
    let code;
    let wallet = formData_find("Wallet",formData);
    var AgentCode = formData_find("AgentCode",formData);
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];   
    try{
        let Other= formData_find("other",formData) != "" ? JSON.parse(formData_find("other",formData)) :"{}" ;
        if (wallet === "單一錢包"){
            args = {
                API : 'SetJson',
                Currency : formData_find("Currency",formData),
                AgentCode : AgentCode,
                AgentKey : AgentKey,
                MemberAccount : MemberAccount,
                Points : formData_find("Points",formData),
                Other : Other
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
                Currency : formData_find("Currency",formData),
                AgentCode : AgentCode,
                AgentKey : AgentKey,
                MemberAccount : MemberAccount,
                Points : formData_find("Points",formData),
                Other : Other
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
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 轉點失敗!! - Error"+code+"]</br>"
        }
    }catch{
        mes = "其他參數請填寫JSON格式!</br>";
    }
    
    return mes;
}

async function KickOut(mes,MemberAccount,formData){
    var AgentCode = formData_find("AgentCode",formData);
    var AgentKey = parent[parent.env+"AgentKeyList"]["returnObject"][AgentCode];  
    try{
        let Other= formData_find("other",formData) != "" ? JSON.parse(formData_find("other",formData)) :"{}" ;
        let args ={
            API : 'KickOut',
            Currency : formData_find("Currency",formData),
            AgentCode : AgentCode,
            AgentKey : AgentKey,
            MemberAccount : MemberAccount,
            Other : Other
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
            mes = "Log:[ login- "+getCurrentDateTime()+" - "+AgentCode+"-"+args['MemberAccount']+" 踢出失敗 - Error："+code+"!! ]</br>"
        }
    }catch{
        mes = "其他參數請填寫JSON格式!</br>";
    }     
    

    return mes;
    
}



