$(function() {
    getWebManagementSystemdatas();
    setList(parent.GameList,"GameID");
    setKeys(parent.verificationFormulaList,"betRecordScript");
    

    $("#show_hide_password a").on('click', function(event) {
        event.preventDefault();
        if($('#show_hide_password input').attr("type") == "text"){
            $('#show_hide_password input').attr('type', 'password');
            $('#show_hide_password i').addClass( "fa-eye-slash" );
            $('#show_hide_password i').removeClass( "fa-eye" );
        }else if($('#show_hide_password input').attr("type") == "password"){
            $('#show_hide_password input').attr('type', 'text');
            $('#show_hide_password i').removeClass( "fa-eye-slash" );
            $('#show_hide_password i').addClass( "fa-eye" );
        }
    });

    remember.addEventListener('change', function(){
        if(remember.checked){
            saveWebManagementSystemdatas();
        }
    });

    submit.addEventListener('click',async function(event){
        event.preventDefault();     
        failed.innerHTML = 0;
        success.innerHTML = 0;
        total.innerHTML = 0;
        ignore.innerHTML = 0;
        let script = await getBetRecordScript();
        let result  = await signIn(account.value,password.value,SignInURL.value);
        if(result.status == 200 ){
            message.innerHTML = account.value +" - "+getCurrentDateTime() + " - 成功登入後台!"
            let betRecordList = await getBetRecordList();
            for(let betRecord of betRecordList){
                if(!IgnoreGameMode.value.split(",").includes(betRecord.gameMode.toString())){
                    let detailUrl= await getDetail(betRecord.recordID);
                    let soup = await getSoup(detailUrl);
                    let isFault = await runScript(script,soup);
                    if(isFault){
                        failed.innerHTML = parseInt(failed.innerHTML)+1;
                        console.log(betRecord.recordID)
                    }else{
                        success.innerHTML = parseInt(success.innerHTML)+1;
                    }
                }else{
                    ignore.innerHTML = parseInt(ignore.innerHTML)+1;
                }
                
            }
        }else{
            message.innerHTML = "請查看console錯誤"
        }
    });

})

async function getWebManagementSystemdatas(){
    let response= await parent.psotLocalhostApi('/getWebManagementSystemDatas',parent.env);
    if(response != null){
        account.value = response["account"];
        password.value = response["password"];
        SignInURL.value = response["SignInURL"];
        GetBetRecordListURL.value = response["GetBetRecordListURL"];
        GetDetailURL.value = response["GetDetailURL"];
        IgnoreGameMode.value = response["IgnoreGameMode"];
        
    }
}


async function saveWebManagementSystemdatas(){
    let data = {};
    data["account"] = account.value;
    data["password"] = password.value;
    data["SignInURL"] = SignInURL.value;
    data["GetBetRecordListURL"] = GetBetRecordListURL.value;
    data["GetDetailURL"] = GetDetailURL.value;
    data["IgnoreGameMode"] = IgnoreGameMode.value;
    let response = await parent.psotLocalhostApi('/updateWebManagementSystemDatas',[parent.env,data]);
    if (response['returnObject'] != null){
        console.log(response['returnObject']);
    }

}

async function getDetail(recordID){
    let payload = {
        "language":"cn",
        "recordID":recordID
    };
    let result = await requestWebApi(GetDetailURL.value,payload);
    return(result.data.returnObject)
}

async function getBetRecordList(){
    let payload = {
        "createTime":[datetimepicker.value,datetimepicker2.value],
        "gameID":GameID.value,
        "gameMode":[null],
        "memberAccount":AccountMember.value,
        "pageIndex":"1",
        "pageSize":"10"
    };
    let result = await requestWebApi(GetBetRecordListURL.value,payload);
    payload["pageSize"] = await result.data.returnObject.total.toString();
    total.innerHTML = payload["pageSize"];
    result = await requestWebApi(GetBetRecordListURL.value,payload);
    return(result.data.returnObject.betRecordList);
}


function requestWebApi(url,datas){
    let option = {
        headers: {
            'Content-Type': 'application/json',
            'authorization': "Bearer "+parent.token
        },
        url: url,
        method: 'POST',
        data: datas
    }
    return new Promise((resv, rej) => {
        parent.axios(option)
        .then(async function(result){ 
            resv(result)
        })
        .catch((err) => { 
            console.log(err);
            rej(err)
        })
    });
}

async function getBetRecordScript(){
    var response= await parent.psotLocalhostApi('/getScript',[parent.verificationFormulaDB,$("#betRecordScript option:selected").text()]);
    response = response['returnObject']
    var comparisonMethod = JSON.parse(response['comparisonMethod']);
    var ifMethod = JSON.parse(response['ifMethod']);
    if(comparisonMethod.length != 0){
        for(let verification of comparisonMethod){
            let var1 = verification['var1'];
            let var2 = verification['var2'];
            if(var1 != "Other"){
                var1 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,var1]);
                var1 = var1['returnObject']
                comparisonMethod[comparisonMethod.indexOf(verification)]['var1'] = var1
            }
            if(var2 != "Other"){
                var2 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,var2]);
                var2 = var2['returnObject']
                comparisonMethod[comparisonMethod.indexOf(verification)]['var2'] = var2
            }
        }
    }
    if(ifMethod.length != 0){
        for(let ifVerification of ifMethod){
            let ifVar1 = ifVerification['if']['var1'];
            let ifVar2 = ifVerification['if']['var2'];
            let thenVar1 = ifVerification['then']['var1'];
            let thenVar2 = ifVerification['then']['var2'];
            
            if(ifVar1 != "Other"){
                ifVar1 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,ifVar1]);
                ifVar1 = ifVar1['returnObject']
                ifMethod[ifMethod.indexOf(ifVerification)]['if']['var1'] = ifVar1
            }
            if(ifVar2 != "Other"){
                ifVar2 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,ifVar2]);
                ifVar2 = ifVar2['returnObject']
                ifMethod[ifMethod.indexOf(ifVerification)]['if']['var2'] = ifVar2
            }
            if(thenVar1 != "Other"){
                thenVar1 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,thenVar1]);
                thenVar1 = thenVar1['returnObject']
                ifMethod[ifMethod.indexOf(ifVerification)]['then']['var1'] = thenVar1
            }
            if(thenVar2 != "Other"){
                thenVar2 = await parent.psotLocalhostApi('/getScript',[parent.crawlerDB,thenVar2]);
                thenVar2 = thenVar2['returnObject']
                ifMethod[ifMethod.indexOf(ifVerification)]['then']['var2'] = thenVar2
            }
        }
    }

    response['comparisonMethod'] = comparisonMethod
    response['ifMethod'] = ifMethod

    return response;
}

async function runScript(script,soup){
    var result = [];
    for(let verification of script['comparisonMethod']){
        var var1 = verification['textarea1'];
        var var2 = verification['textarea2'];
        if(verification['var1'] != "Other"){
            var1 = await getVar(verification['var1'],soup);
        }
        if(verification['var2'] != "Other"){
            var2 = await getVar(verification['var2'],soup);
        }
        result.push(window[verification['operator']](var1.toString().replace(",",""),var2.toString().replace(",","")))
    }
    
    for(let ifVerification of script['ifMethod']){
        var ifVar1 = ifVerification['if']['textarea1'];
        var ifVar2 = ifVerification['if']['textarea2'];
        var thenVar1 = ifVerification['then']['textarea1'];
        var thenVar2 = ifVerification['then']['textarea2'];

        if(ifVerification['if']['var1'] != "Other"){
            ifVar1 = await getVar(ifVerification['if']['var1'],soup);
        }
        if(ifVerification['if']['var2'] != "Other"){
            ifVar2 = await getVar(ifVerification['if']['var2'],soup);
        }
        if(ifVerification['then']['var1']!= "Other"){
            thenVar1 = await getVar(ifVerification['then']['var1'],soup);
        }
        if(ifVerification['then']['var2'] != "Other"){
            thenVar2 = await getVar(ifVerification['then']['var2'],soup);
        }

        if(window[ifVerification['if']['operator']](ifVar1.toString(),ifVar2.toString())){
            result.push(window[ifVerification['then']['operator']](thenVar1.toString().replace(",",""),thenVar2.toString().replace(",","")))
        }
    }

    return result.includes(false)

}

async function getVar(actions,soup){
    var result;
    for(const k of Object.keys(actions).sort()){
        result = await window[k.split("_")[1]](result,soup,actions[k]);        
    }
    return result
}
