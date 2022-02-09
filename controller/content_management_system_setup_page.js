$(async function() {
    var showTable = document.getElementById("table").getElementsByTagName('tbody')[0];
    var message = document.getElementById("message");
    const updateBtn = document.getElementById('update');
    const testBtn = document.getElementById('test');
    var axios = require('axios');

    setValue();

    updateBtn.addEventListener('click',function(event){
        updateValue(event);
    });

    testBtn.addEventListener('click',function(){
        testConnect();
    });


    async function setValue(){
        $('#table tbody').empty();
        var obj = await parent.getLocalhostApi('/getCMS');
        for (let key in obj){
            let rows = showTable.rows.length+1
            let row = showTable.insertRow(-1)
            let id = row.insertCell(0)
            let name = row.insertCell(1)
            let value = row.insertCell(2)
            let update = row.insertCell(3)
            id.innerHTML = String(rows)
            
            let valueIDSpan = document.createElement('span')
            valueIDSpan.id = key
            valueIDSpan.innerHTML = key
            name.appendChild(valueIDSpan)

            let valueNameSpan = document.createElement('span')
            valueNameSpan.id = obj[key]
            valueNameSpan.innerHTML = obj[key]
            value.appendChild(valueNameSpan)

            //update
            let updateButton = document.createElement('Button')
            let updateBtnIcon = document.createElement('i')
            updateBtnIcon.className = "fas fa-edit"
            updateButton.className = "btn btn-default"
            updateButton.type = "button"
            updateButton.id = "update"+String(rows)
            updateButton.dataset.target="#updateModal"
            updateButton.dataset.toggle="modal"
            updateButton.onclick = function(){
                document.getElementById('value').value = obj[key];
                document.getElementById("name").innerHTML = key;
            } 
            updateButton.appendChild(updateBtnIcon)
            update.appendChild(updateButton)

        }
    }

    async function updateValue(event){
        if($("#value")[0].checkValidity()){
            event.preventDefault();
            let data = {};
            let name = $("#name")[0].textContent;
            let value = $("#value")[0].value;
            data[name] = value
            let response = await parent.psotLocalhostApi('/updateCMS',data);
            if (response['returnObject'] == null){
                parent["CMS"] = await parent.getLocalhostApi('/getCMS');
                setValue();
                $("div.alert").show();
                $("#updateModal").modal("hide");
                message.innerHTML = name+"更新成功!";
            }else{
                console.log(response['returnObject']);
            }
        }
    }

    function testConnect(){
        let option = {
            headers: {'Content-Type': 'application/json'},
            url: 'https://webapi.mearhh.com/Agent/Account/SignIn',
            method: 'POST',
            data: parent.CMS
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
    
});






