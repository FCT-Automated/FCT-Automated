$(function() {
    document.title = location.search.split("?")[1];
    window[document.title]();
   

    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var apiSelect = document.getElementById('API');
    const submit = document.getElementById('submit');

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
}

function script(){
    $('.scriptList').show()
    setKeys(parent.scriptList,"list");
    $('#API')[0].disabled = true
    
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
async function run(event,api){
    if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
        event.preventDefault();
        let mes = urlAndPathCheck();
        if(mes.length === 0){
            var apiFunction = window[api];
            if(typeof apiFunction === "function"){
                mes = await apiFunction(mes);
            }else{
                mes = "查無此Api Function</br>"
            }
        }  
        $("#message")[0].innerHTML += mes;
    }
    
}

async function Login(mes){
    let args ={
        API : "Login",
        Currency : document.getElementById("Currency").value,
        GameID : document.getElementById("GameID").value,
        AgentCode : document.getElementById("AgentCode").value,
        MemberAccount : document.getElementById("MemberAccount").value,
        LanguageID : document.getElementById("LanguageID").value
    }
    let response = await parent.apiJs.requestAPI(args,parent.apiUrl)
    let code = response.Result;
    if ( code == 0){
        if(document.title == 'script'){
            //待改
            let data = await parent.psotLocalhostApi('/getScript',$("#list option:selected").text());
            data['user'] = args
            data['apiUrl'] = parent.apiUrl
            data['seamlessApiUrl'] = parent.seamlessApiUrl
            await parent.browser.createBrowser(response.Url,parent.chromePath,data);
        }else{
            await parent.browser.createBrowser(response.Url,parent.chromePath,"Normal")
        }
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入失敗 - Error Code："+code+"!! ]</br>"
    }
    return mes;
}

async function SetPoints(mes){
    let args;
    let response;
    let code;
    let wallet = document.getElementById("Wallet");
    if (wallet.options[wallet.selectedIndex].id == "seamlessWallet"){
        args = {
            API : 'SetJson',
            Currency : document.getElementById("Currency").value,
            AgentCode : document.getElementById("AgentCode").value,
            MemberAccount : document.getElementById("MemberAccount").value,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestSeamlessAPI(args,parent.seamlessApiUrl);
        code = response.Result;
        if ( code == 0){
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.Points+"]</br>"
        }
        
    }else{
        args = {
            API : 'SetPoints',
            Currency : document.getElementById("Currency").value,
            AgentCode : document.getElementById("AgentCode").value,
            MemberAccount : document.getElementById("MemberAccount").value,
            Points : document.getElementById("Points").value
        }
        response = await parent.apiJs.requestAPI(args,parent.apiUrl);
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

async function KickOut(mes){
    let args ={
        API : 'KickOut',
        Currency : document.getElementById("Currency").value,
        AgentCode : document.getElementById("AgentCode").value,
        MemberAccount : document.getElementById("MemberAccount").value,
    }
    let response = await parent.apiJs.requestAPI(args,parent.apiUrl);
    let code = response.Result;
    if ( code == 0){
        mes = "Log:[ KickOut- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出成功!! ]</br>"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出失敗 - Error Code："+code+"!! ]</br>"
    }
    return mes;

}



