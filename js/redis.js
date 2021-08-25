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

function checkThatTheKeyExists(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall(key, (error, result) => {
            if (!error){
                if(result == null){
                    resv({'returnObject':null})
                }else{
                    resv({'returnObject':{}})
                }
            }else{
                rej(error)
            }
        })
    });
}

async function getCurrencyList(){
    var response = await checkThatTheKeyExists('CurrencyList');
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        if (response['returnObject'] != null){
            client.hgetall('CurrencyList', (error, result) => {
                if (!error){
                    response['returnObject'] = result
                    resv(response)  
                }else{
                    rej(error)
                }
            });
        }else{
            resv(response)
        }
        
    });
}

function delCurrency(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(key);
        client.hdel('CurrencyList',jsonObject, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

async function addCurrency(data){
    var currencyList = Object.keys(await getCurrencyList()); 
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        let currencyID = Object.keys(jsonObject)[0];
        if (! currencyList.includes(currencyID)){
            try {
                client.hmset('CurrencyList',jsonObject);
                resv({'returnObject':null})
            }
            catch(error){
                rej(error)
            }
        }else{
            resv({'returnObject':'此幣別代號已存在!'})
        }  
    });
}

function updateCurrency(data){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        try {
            client.hmset('CurrencyList',jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
    });
}


async function getGameList(){
    var response = await checkThatTheKeyExists('GameList');
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        if (response['returnObject'] != null){
            client.hgetall('GameList', (error, result) => {
                if (!error){
                    response['returnObject'] = result
                    resv(response)  
                }else{
                    rej(error)
                }
            });
        }else{
            resv(response)
        }
    });
    
}

function delGame(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(key);
        client.hdel('GameList',jsonObject, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

async function addGame(data){
    var gameList = Object.keys(await getGameList()); 
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        let gameID = Object.keys(jsonObject)[0];
        if (! gameList.includes(gameID)){
            try {
                client.hmset('GameList',jsonObject);
                resv({'returnObject':null})
            }
            catch(error){
                rej(error)
            }
        }else{
            resv({'returnObject':'此遊戲編號已存在!'})
        }  
    });
}

function updateGame(data){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        try {
            client.hmset('GameList',jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
    });
}

async function getLanguageList(){
    var response = await checkThatTheKeyExists('LanguageList');
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        if (response['returnObject'] != null){
            client.hgetall('LanguageList', (error, result) => {
                if (!error){
                    response['returnObject'] = result
                    resv(response)  
                }else{
                    rej(error)
                }
            });
        }else{
            resv(response)
        }
    });
}

function delLanguage(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(key);
        client.hdel('LanguageList',jsonObject, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

async function addLanguage(data){
    var languageList = Object.keys(await getLanguageList()); 
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        let languageID = Object.keys(jsonObject)[0];
        if (! languageList.includes(languageID)){
            try {
                client.hmset('LanguageList',jsonObject);
                resv({'returnObject':null})
            }
            catch(error){
                rej(error)
            }
        }else{
            resv({'returnObject':'此幣別代號已存在!'})
        }  
    });
}

function updateLanguage(data){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        try {
            client.hmset('LanguageList',jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
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

//還沒用
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
module.exports.delGame = delGame;
module.exports.addGame = addGame;
module.exports.updateGame = updateGame;
module.exports.delCurrency = delCurrency;
module.exports.addCurrency = addCurrency;
module.exports.updateCurrency = updateCurrency;
module.exports.delLanguage = delLanguage;
module.exports.addLanguage = addLanguage;
module.exports.updateLanguage = updateLanguage;

module.exports.connectRedis = connectRedis;
module.exports.scriptSave = scriptSave;
module.exports.delscriptlistRow = delscriptlistRow;
