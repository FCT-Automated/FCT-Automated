$(function() {
    document.title = location.search.split("?")[1];
    window[document.title]();
    
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var apiSelect = document.getElementById('API');
    const submit = document.getElementById('submit');

    changeApi(apiSelect.value);
    setList(parent.CurrencyList,"Currency");
    setList(parent.GameList,"GameID");
    setList(parent.LanguageList,"LanguageID");

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
});
    
function api(){
    $('#API')[0].disabled = false
    $('.scriptList').hide()
    $('.multiple').hide()
    $('.tip').hide()
}

function script(){
    $('.scriptList').show()
    setKeys(parent.scriptList,"list");
    $('#API')[0].disabled = true
    $('.tip').show()

    
}


function changeApi(curAPI){
    switch (curAPI) {
        case 'Login':
            $('.field_Login').show()
            $('.field_SetPoints').hide()
            break
        case 'SetPoints':
            $('.field_SetPoints').show()
            $('.field_Login').hide()
            break
        case 'KickOut':
            $('.field_SetPoints').hide()
            $('.field_Login').hide()
            break
    }
}

function getCurrentDateTime(){
    let today = new Date();
    return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
}

//submit
async function run(event,apiValue){
    if(checkValidity()){
        let MemberAccounts = document.getElementById("MemberAccount").value.split(",");
        event.preventDefault();
        let mes = urlAndPathCheck();
        if(mes.length === 0){
            if(document.title == 'script' && $("#multipleYes")[0].checked){
                AutoScript(MemberAccounts);
            }else{
                for(let MemberAccount of MemberAccounts){
                    if(typeof window[apiValue] === "function"){
                        mes = await window[apiValue](mes,MemberAccount);
                    }else{
                        mes = "查無此Api Function</br>"
                    }
                    $("#message")[0].innerHTML += mes;
                }
            }
            
        }  
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
async function AutoScript(MemberAccounts){
    let browserArgs ={
        executablePath: parent.chromePath, // windows
        headless: false, // 是否在背景運行瀏覽器
        args: ['--no-default-browser-check','--no-sandbox'],
        ignoreDefaultArgs: ['--enable-automation'],
        autoClose: false,
        devtools: true
      }
    var page = await parent.browser.openBrowser(browserArgs);

    while(true){
        for(let MemberAccount of MemberAccounts){
            let args ={
                API : "Login",
                Currency : document.getElementById("Currency").value,
                GameID : document.getElementById("GameID").value,
                AgentCode : document.getElementById("AgentCode").value,
                MemberAccount : MemberAccount,
                LanguageID : document.getElementById("LanguageID").value
            }
            let response = await parent.apiJs.requestAPI(args)
            let code = response.Result;
            if ( code == 0){
                data = await parent.psotLocalhostApi('/getScript',$("#list option:selected").text());
                data['user'] = args
                let datas= await setUpBrowerArgs('OnlyOneWindowsScript',data);
                await parent.browser.OnlyOneWindowsScript(response.Url,page,datas);
                var isStart = true;
                setTimeout(() => isStart = false, parseInt(document.getElementById("multipleMin").value)*1000*60);
                while(isStart){
                    await parent.browser.runScript(datas['object'],page)     
                }
                
            }else{
                break
            }
        } 
    }
}

async function Login(mes,MemberAccount){       
    let args ={
        API : "Login",
        Currency : document.getElementById("Currency").value,
        GameID : document.getElementById("GameID").value,
        AgentCode : document.getElementById("AgentCode").value,
        MemberAccount : MemberAccount,
        LanguageID : document.getElementById("LanguageID").value
    }
    let response = await parent.apiJs.requestAPI(args)
    let code = response.Result;
    if ( code == 0){
        if(document.title == 'script'){
            //待改
            data = await parent.psotLocalhostApi('/getScript',$("#list option:selected").text());
            data['user'] = args
            await parent.browser.createBrowser(response.Url,await setUpBrowerArgs('Script',data));
        }else{
            await parent.browser.createBrowser(response.Url,await setUpBrowerArgs('Normal',{}));
        }
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入失敗 - Error Code："+code+"!! ]</br>";
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
    if (wallet.options[wallet.selectedIndex].id == "seamlessWallet"){
        args = {
            API : 'SetJson',
            Currency : document.getElementById("Currency").value,
            AgentCode : document.getElementById("AgentCode").value,
            MemberAccount : MemberAccount,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestSeamlessAPI(args);
        code = response.Result;
        if ( code == 0){
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.Points+"]</br>"
        }
        
    }else{
        args = {
            API : 'SetPoints',
            Currency : document.getElementById("Currency").value,
            AgentCode : document.getElementById("AgentCode").value,
            MemberAccount : MemberAccount,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestAPI(args);
        code = response.Result;
        if ( code == 0){
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.AfterPoint+"，BankID："+response.BankID+"]</br>"
        }
    }
    if(code !=0){
        mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 轉點失敗!! - Error Code："+code+"]</br>"
    }
    return mes;
}

async function KickOut(mes,MemberAccount){
    let args ={
        API : 'KickOut',
        Currency : document.getElementById("Currency").value,
        AgentCode : document.getElementById("AgentCode").value,
        MemberAccount : MemberAccount,
    }
    let response = await parent.apiJs.requestAPI(args);
    let code = response.Result;
    if ( code == 0){
        mes = "Log:[ KickOut- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出失敗 - Error Code："+code+"!! ]</br>"
    }
    return mes;

}



