$(function() {
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

    submit.addEventListener('click',function(){
        testConnect(account.value,password.value,LoginUrl.value);
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
