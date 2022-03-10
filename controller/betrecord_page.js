$(function() {
    var account = document.getElementById('account');
    var password = document.getElementById('password');
    var LoginUrl = document.getElementById('LoginUrl');
    var betRecordUrl = document.getElementById('betRecordUrl');
    const remember = document.getElementById('remember');

    getWebManagementSystemdatas();
    setList(parent.GameList,"GameID");

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

})

async function getWebManagementSystemdatas(){
    let response= await parent.psotLocalhostApi('/getWebManagementSystemDatas',parent.env);
    if(response != null){
        account.value = response["account"];
        password.value = response["password"];
        LoginUrl.value = response["LoginUrl"];
        betRecordUrl.value = response["betRecordUrl"];
    }
}


async function saveWebManagementSystemdatas(){
    let data = {};
    data["account"] = account.value;
    data["password"] = password.value;
    data["LoginUrl"] = LoginUrl.value;
    data["betRecordUrl"] = betRecordUrl.value;
    let response = await parent.psotLocalhostApi('/updateWebManagementSystemDatas',[parent.env,data]);
    if (response['returnObject'] != null){
        console.log(response['returnObject']);
    }

}


function testConnect(){
    let accountAndPassword = {};
    accountAndPassword['account'] = account.value;
    accountAndPassword['password'] = password.value;
    let option = {
        headers: {'Content-Type': 'application/json'},
        url: LoginUrl.value,
        method: 'POST',
        data: accountAndPassword
    }
    axios(option)
        .then((result) => { 
            parent.token =  result.data.returnObject.token ;
            message.innerHTML = "連線成功!"
            $("div.alert").show();
        })
        .catch((err) => { 
            message.innerHTML = "連線失敗，請檢查帳號或密碼是否有誤或目前後台是否無法使用"; 
            console.log(err);
            $("div.alert").show();
        })

    
}