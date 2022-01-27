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

function init(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        var keys = ['chromePath','apiUrl','seamlessApiUrl','DBUsername','DBPassword','DBhost','DBPort','DBName'];
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
        });
        var keys2 = ['account','password'];
        client.hgetall('CMS', (error, result) => {
            if (!error){
                if(result == null){
                    try {
                        keys2.forEach(key => {
                            client.hmset('CMS',key,'');
                        });
                        resv({'returnObject':null})
                    }
                    catch(error){
                        rej(error)
                    }
                }else{
                    keys2.filter(function(v){ return Object.keys(result).indexOf(v) == -1 }).forEach(key => {
                        client.hmset('CMS',key,'');
                    });
                    resv({'returnObject':null})
                }
            }else{
                rej(error)
            }
        });
    });
}

async function importList(datas){
    var data = JSON.parse(datas)['data'];
    var tableName = JSON.parse(datas)['tableName'];
    var currentList = await getList(JSON.stringify(tableName));
    if (currentList != null){
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
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall(JSON.parse(tableName), (error, response) => {
            if (response != null){
                let result = {};
                result['returnObject'] = response;
                resv(result)  
            }else{
                resv(response)
            }
        });   
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

function getPath(key){
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

function getCMS(){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall('CMS', (error, result) => {
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
    if (List != null){
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

function updateCMS(data){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let jsonObject= JSON.parse(data);
        try {
            client.hmset('CMS',jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
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

function getKeys(){
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


async function addScript(script){
    var tableNames = await getKeys();    
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

module.exports.init = init;

module.exports.getList = getList;
module.exports.getPath = getPath;
module.exports.delData = delData;
module.exports.addData = addData;
module.exports.updateData = updateData;
module.exports.importList = importList;

module.exports.getKeys = getKeys;
module.exports.getScript = getScript;
module.exports.addScript = addScript;
module.exports.delScript = delScript;
module.exports.updateScript = updateScript;

module.exports.updatePath = updatePath;
module.exports.getPathList = getPathList;

module.exports.getCMS = getCMS;
module.exports.updateCMS = updateCMS;












