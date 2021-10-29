$(function() {
    var attend = document.getElementById('attend');
    var notAttend = document.getElementById('notAttend');
    var apiSelect = document.getElementById('API');
    const submit = document.getElementById('submit');

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
    event.preventDefault();
    let mes = '有欄位未填寫!';
    if ($("#AgentCode")[0].checkValidity() && $("#MemberAccount")[0].checkValidity()){
        mes = urlAndPathCheck();
        if(mes.length === 0){
            var apiFunction = window[api];
            if(typeof apiFunction === "function"){
                mes = await apiFunction(mes);
            }else{
                mes = "查無此Api Function"
            }
        }  
    }
    parent.postMessage(JSON.parse(JSON.stringify(mes)),"*");   
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
        await parent.open.openChrome(response.Url,parent.chromePath,args['GameID'],"Normal")
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入成功!! ]"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 登入失敗 - Error Code："+code+"!! ]"
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
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.Points+"]"
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
            mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args["AgentCode"]+"-"+args["MemberAccount"]+" 轉點成功!! 餘額："+response.AfterPoint+"，BankID："+response.BankID+"]"
        }
    }
    if(code !=0){
        mes = "Log:[ SetPoints- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 轉點失敗!! - Error Code："+code+"]"
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
        mes = "Log:[ KickOut- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出成功!! ]"
    }else{
        mes = "Log:[ login- "+getCurrentDateTime()+" - "+args['AgentCode']+"-"+args['MemberAccount']+" 踢出失敗 - Error Code："+code+"!! ]"
    }
    return mes;

}



