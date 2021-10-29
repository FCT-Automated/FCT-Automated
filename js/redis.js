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

async function batchImportCurrencyList(data){
    var currencyList = await getCurrencyList();  
    if (currencyList['returnObject'] != null){
        currencyList = Object.keys(currencyList['returnObject']);  
    }else{
        currencyList = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        currencyList.forEach(function(currencyID){
            delete jsonObject[currencyID]
        })
        if (JSON.stringify(jsonObject)==="{}"){
            resv({'returnObject':'目前資料與匯入資料相同!'})
        }else{
            client.hmset('CurrencyList',jsonObject);
            resv({'returnObject':null})
        }
    });
}

async function importList(datas){
    var data = JSON.parse(datas)['data'];
    var tableName = JSON.parse(datas)['tableName'];
    var currentList = await getList(JSON.stringify(tableName));
    if (currentList['returnObject'] != null){
        currentList = Object.keys(currentList['returnObject']);  
    }else{
        currentList = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        currentList.forEach(function(id){
            delete data[id]
        })
        if (JSON.stringify(data)==="{}"){
            resv({'returnObject':'目前資料與匯入資料相同!'})
        }else{
            client.hmset(tableName,data);
            resv({'returnObject':null})
        }
    });
}

async function getList(tableName){
    var response = await checkThatTheKeyExists(JSON.parse(tableName));
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        if (response['returnObject'] != null){
            client.hgetall(JSON.parse(tableName), (error, result) => {
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

function getUrlOrPath(key){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hget('PathList',JSON.parse(key), (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
    
}


function delData(data){
    var key = JSON.parse(data)['key'];
    var tableName = JSON.parse(data)['tableName'];
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hdel(tableName,key, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

async function addData(datas){
    var data = JSON.parse(datas)['data'];
    var tableName = JSON.parse(datas)['tableName'];
    var List = await getList(JSON.stringify(tableName));  
    if (List['returnObject'] != null){
        List = Object.keys(List['returnObject']);  
    }else{
        List = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let ID = Object.keys(data)[0];
        if (! List.includes(ID)){
            try {
                client.hmset(tableName,data);
                resv({'returnObject':null})
            }
            catch(error){
                rej(error)
            }
        }else{
            resv({'returnObject':'資料已存在!'})
        }  
    });
}

function updateData(datas){
    var data = JSON.parse(datas)['data'];
    var tableName = JSON.parse(datas)['tableName'];
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        try {
            client.hmset(tableName,data);
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
        if (JSON.stringify(jsonObject)==="{}"){
            resv({'returnObject':'目前資料與匯入資料相同!'})
        }else{
            client.hmset('GameList',jsonObject);
            resv({'returnObject':null})
        }
      
    });
}



async function batchImportLanguageList(data){
    var languageList = await getLanguageList();
    if (languageList['returnObject'] != null){
        languageList = Object.keys(languageList['returnObject']);    
    }else{
        languageList = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        languageList.forEach(function(language){
            delete jsonObject[language]
        })
        if (JSON.stringify(jsonObject)==="{}"){
            resv({'returnObject':'目前資料與匯入資料相同!'})
        }else{
            client.hmset('LanguageList',jsonObject);
            resv({'returnObject':null})
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

module.exports.getList = getList;
module.exports.getUrlOrPath = getUrlOrPath;
module.exports.delData = delData;
module.exports.addData = addData;
module.exports.updateData = updateData;
module.exports.importList = importList;

module.exports.createPathList = createPathList;

module.exports.updatePath = updatePath;
module.exports.getPathList = getPathList;

module.exports.batchImportCurrencyList = batchImportCurrencyList;

module.exports.batchImportGameList = batchImportGameList;

module.exports.batchImportLanguageList = batchImportLanguageList;

module.exports.addScript = addScript;
module.exports.delScript = delScript;
module.exports.updateScript = updateScript;
module.exports.getScriptKeys = getScriptKeys;
module.exports.getScript = getScript;







