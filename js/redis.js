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

function createPathList(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        var keys = ['chromePath','apiUrl','seamlessApiUrl'];
        client.hgetall('PathList', (error, result) => {
            if (!error){
                if(result == null){
                    try {
                        keys.forEach(key => {
                            client.hmset('PathList',key,'');
                        });
                        resv({'returnObject':null})
                    }
                    catch(error){
                        rej(error)
                    }
                }else{
                    keys.filter(function(v){ return Object.keys(result).indexOf(v) == -1 }).forEach(key => {
                        client.hmset('PathList',key,'');
                    });
                    resv({'returnObject':null})
                }
            }else{
                rej(error)
            }
        })
    });
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

async function batchImportGameList(data){
    var gameList = await getGameList();  
    if (gameList['returnObject'] != null){
        gameList = Object.keys(gameList['returnObject']);  
    }else{
        gameList = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        gameList.forEach(function(gameId){
            delete jsonObject[gameId]
        })
        try {
            client.hmset('GameList',jsonObject);
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
    var gameList = await getGameList();
    gameList = Object.keys(gameList['returnObject']);
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

function getPathList(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall('PathList', (error, result) => {
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
        client.hget('PathList','chromePath', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}

function updatePath(data){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        try {
            client.hmset('PathList',jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
    });
}

function getApiUrl(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hget('PathList','apiUrl', (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}

function getSeamlessApiUrl(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hget('PathList','seamlessApiUrl', (error, result) => {
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

function getScript(key){
    return new Promise((resv, rej) => {
        let response = {'returnObject':{}}
        let jsonObject= JSON.parse(key);
        let client = connectRedis(14);
        client.hgetall(jsonObject, (error, result) => {
            if (!error){
                response['returnObject'] = result
                resv(response)  
            }else{
                rej(error)
            }
        });
        
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

function delScript(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(14);
        let jsonObject= JSON.parse(key);
        client.del(jsonObject, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

function updateScript(script){
    return new Promise((resv, rej) => {
        let jsonObject= JSON.parse(script);
        let tableName = Object.keys(jsonObject)[0];
        let client = connectRedis(14);
        client.del(tableName, (error, result) => {
            if (!error){
                try {
                    client.hmset(tableName,jsonObject[tableName]);
                    resv({'returnObject':null})
                }
                catch(error){
                    rej(error)
                }
            }else{
                rej(error)
            }
        });
    });
}

module.exports.createPathList = createPathList;

module.exports.updatePath = updatePath;
module.exports.getPathList = getPathList;
module.exports.getChromePath = getChromePath;
module.exports.getApiUrl = getApiUrl;
module.exports.getSeamlessApiUrl = getSeamlessApiUrl;

module.exports.addCurrency = addCurrency;
module.exports.delCurrency = delCurrency;
module.exports.updateCurrency = updateCurrency;
module.exports.getCurrencyList = getCurrencyList;

module.exports.addGame = addGame;
module.exports.delGame = delGame;
module.exports.updateGame = updateGame;
module.exports.getGameList = getGameList;
module.exports.batchImportGameList = batchImportGameList;

module.exports.addLanguage = addLanguage;
module.exports.delLanguage = delLanguage;
module.exports.updateLanguage = updateLanguage;
module.exports.getLanguageList = getLanguageList;

module.exports.addScript = addScript;
module.exports.delScript = delScript;
module.exports.updateScript = updateScript;
module.exports.getScriptKeys = getScriptKeys;
module.exports.getScript = getScript;







