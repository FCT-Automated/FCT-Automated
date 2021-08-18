//------redis connect---------
function connectRedis(db){
    const redis = require('redis')
    var redis_config = {
        "host": "127.0.0.1",
        "port": 6379,
        "db":db
    }
    const client = redis.createClient(redis_config)
    // Connect Redis db:db
    // client.on('connect',()=>{
    //     console.log('Redis-'+ toString(db) +' successfully connected')
    // });
    return client
}


function getCurrencyList(){
    return new Promise((resv, rej) => {
        var client = connectRedis(15)
        client.hgetall('CurrencyList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                console.log(error)
            }
        });
    });
}

function getGameList(){
    return new Promise((resv, rej) => {
        var client = connectRedis(15)
        client.hgetall('GameList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                console.log(error)
            }
        });
    });
    
}

function getLanguageList(){
    return new Promise((resv, rej) => {
        var client = connectRedis(15)
        client.hgetall('LanguageList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                console.log(error)
            }
        });
    });
    
}

function getChromePath(){
    return new Promise((resv, rej) => {
        var client = connectRedis(15)
        client.hget('PathList','Chrome', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                console.log(error)
            }
        });
    });
    
}




//--
function dataEdit(element,client){
    client.hgetall(element, (error, result) => {
        if (!error) {
            let ele = document.getElementById(element+'body')
        if (result!= null){
            ele.value = JSON.stringify(result)
        }else{
            console.log(error)
        }}
    })

}

function updatePath(key,value){
    var sql = 'DELETE FROM path WHERE key = ?';
    myDataBase.run(sql,key, function(err) {
        if (err) {
          console.log(err);
        }
        sql = 'INSERT INTO path VALUES (?,?)';
        myDataBase.run(sql,[key,value]);
    });
    myDataBase.close();
    getPath(key);
}

function getPath(key){
    myDataBase.serialize(function(){
        myDataBase.run("CREATE TABLE IF NOT EXISTS path (key TEXT,value TEXT)");
    });
    var sql = 'SELECT value FROM path WHERE key = ?';
    myDataBase.get(sql, key ,(err,row) => {
        if(err){
            console.log(err); 
        }else{
            document.getElementById('chromePathbody').value = row.value;
        }
    });
    myDataBase.close();
}

function scriptSave(tableName,data,client){
    try {
        client.del(tableName)
        client.hmset(tableName,data,function(error){
            if (!error){
                console.log("新增/修改成功")
                getScriptList(client)
                
            }else{
                console.log(error)
            }
        })
    }
    catch{
        console.log('格式有誤')
    }
}

function getScriptList(client){
    return new Promise((resv, rej) => {
        client.keys('*',(error,reply) => {
            resv(reply)       
        })
    })
}

function getScriptListData(key,client){
    return new Promise((resv, rej) => {
        client.hgetall(key, (error, result) => {
            if (!error){
                resv(result)  
            }else{
                console.log(error)
            }
        })
    })
}

function delscriptlistRow(key,client){
    client.del(key.split("_")[1])
}


module.exports.getCurrencyList = getCurrencyList;
module.exports.getGameList = getGameList;
module.exports.getLanguageList = getLanguageList;
module.exports.getChromePath = getChromePath;



module.exports.connectRedis = connectRedis;
module.exports.dataEdit = dataEdit;
module.exports.updatePath = updatePath;
module.exports.getPath = getPath;
module.exports.scriptSave = scriptSave;
module.exports.getScriptList = getScriptList;
module.exports.getScriptListData = getScriptListData;
module.exports.delscriptlistRow = delscriptlistRow;
