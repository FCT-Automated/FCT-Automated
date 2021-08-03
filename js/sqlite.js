
//------redis連線---------
function connectRedis(db){
    const redis = require('redis')
    var redis_config = {
        "host": "127.0.0.1",
        "port": 6379,
        "db":db
    }
    const client = redis.createClient(redis_config)
    // Connect Redis db:db
    client.on('connect',()=>{
        console.log('Redis client connected')
    })
    return client
}

//------redis連線---------


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

async function updatePath(key,value){
    var myDataBase = await connectSqlite();

    var sql = 'DELETE FROM path WHERE key = ?';
    myDataBase.run(sql,key, function(err) {
        if (err) {
          console.log(err);
        }
        sql = 'INSERT INTO path VALUES (?,?)';
        myDataBase.run(sql,[key,value]);
    });
    myDataBase.close();
}

async function getPath(key){
    var path;
    var myDataBase = await connectSqlite();
    myDataBase.serialize(function(){
        myDataBase.run("CREATE TABLE IF NOT EXISTS path (key TEXT,value TEXT)");
    });
    var sql = 'SELECT value FROM path WHERE key = ?';
    myDataBase.get(sql, key ,(err,row) => {
        if(err){
            console.log(err); 
        }else{
            path = row.value;
        }
    });
    myDataBase.close();
    return path
        
}

function scriptSave(tableName,data,client){
    //var scriptListFile = "./db/scriptList.db"
    //var scriptListdb = new sqlite3.Database(scriptListFile);
    debugger
    sqlite.scriptListDb.serialize(function(){
        sqlite.scriptListDb.run("CREATE TABLE IF NOT EXISTS " +tableName+ " (key TEXT,value TEXT)");
        var sql = sqlite.scriptListDb.prepare("INSERT INTO " +tableName+ " VALUES (?,?)");

        for (const [key,value] of Object.entries(data)){
            debugger
            sql.run([key,value]);
        }
        sql.finalize();
    });
    
    //sqlite.scriptListDb.close();

    // try {
    //     client.del(tableName)
    //     client.hmset(tableName,data,function(error){
    //         if (!error){
    //             console.log("新增/修改成功")
    //             getScriptList(client)
                
    //         }else{
    //             console.log(error)
    //         }
    //     })
    // }
    // catch{
    //     console.log('格式有誤')
    // }
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

function connectSqlite(){
    return new Promise((resv, rej) => {
        var fs = require("fs");
        var myDataBasePath = './db/myDataBase.db'
        var sqlite3 = require("sqlite3").verbose();
        resv(new sqlite3.Database(myDataBasePath));
           
    })
}


module.exports.connectRedis = connectRedis;
module.exports.dataEdit = dataEdit;
module.exports.updatePath = updatePath;
module.exports.getPath = getPath;
module.exports.scriptSave = scriptSave;
module.exports.getScriptList = getScriptList;
module.exports.getScriptListData = getScriptListData;
module.exports.delscriptlistRow = delscriptlistRow;
