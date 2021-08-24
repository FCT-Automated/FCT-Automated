//------redis connect---------
function connectRedis(db){
    const redis = require('redis')
    var redis_config = {
        "host": "127.0.0.1",
        "port": 6379,
        "db":db
    }    
    return redis.createClient(redis_config)
}


function getCurrencyList(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall('CurrencyList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
}

function getGameList(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall('GameList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}

function getLanguageList(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall('LanguageList', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}

function getChromePath(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hget('PathList','Chrome', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}

function getScriptKeys(){
    return new Promise((resv, rej) => {
        let client = connectRedis(14);
        client.keys('*',(error,keys) => {
            if(!error){
                resv(keys)
            }else{
                rej(error)
            }
                
        })
        
    });
}

function getScripts(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(14);
        client.hgetall(key, (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        })
        
    });
}

async function addScript(script){
    var tableNames = await getScriptKeys();    
    return new Promise((resv, rej) => {
        let client = connectRedis(14);
        let jsonObject= JSON.parse(script);
        let tableName = Object.keys(jsonObject)[0];
        if (! tableNames.includes(tableName)){
            try {
                client.hmset(tableName,jsonObject[tableName]);
                resv({'returnObject':null})
            }
            catch(error){
                rej(error)
            }
        }else{
            resv({'returnObject':'script name is duplicated'})
        }
        
        
    });
}


//--
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
module.exports.getScriptKeys = getScriptKeys;
module.exports.getScripts = getScripts;
module.exports.addScript = addScript;


module.exports.connectRedis = connectRedis;
module.exports.scriptSave = scriptSave;
module.exports.delscriptlistRow = delscriptlistRow;
