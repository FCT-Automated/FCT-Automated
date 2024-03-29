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
        var keys = ['chromePath','apiUrl','seamlessApiUrl'];
        var envs = ['QAPathList','ReleasePathList','LivePathList'];
        envs.forEach(env =>{
            client.hgetall(env, (error, result) => {
                if (!error){
                    if(result == null){
                        try {
                            keys.forEach(key => {
                                client.hmset(env,key,'');
                            });
                        }
                        catch(error){
                            rej(error)
                        }
                    }else{
                        keys.filter(function(v){ return Object.keys(result).indexOf(v) == -1 }).forEach(key => {
                            client.hmset(env,key,'');
                        });
                    }
                }else{
                    rej(error)
                }
            })
        })

        client.hgetall("defaultWindowSize", (error, result) => {
            if (!error){
                if(result == null){
                    try {
                        client.hmset("defaultWindowSize","Portrait",'553,959');
                        client.hmset("defaultWindowSize","Landscape",'929,653');
                    }
                    catch(error){
                        rej(error)
                    }
                }
            }else{
                rej(error)
            }
        })
       
    });
}

async function importList(datas){
    var data = JSON.parse(datas)['data'];
    var tableName = JSON.parse(datas)['tableName'];
    var list = await getList(JSON.stringify(tableName));
    if (list != null){
        list = Object.keys(list['returnObject']);  
    }else{
        list = [];
    }
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        list.forEach(function(id){
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

function getScript(datas){
    var db = JSON.parse(datas)[0];
    return new Promise((resv, rej) => {
        let response = {'returnObject':{}}
        let jsonObject= JSON.parse(datas)[1];
        let client = connectRedis(db);
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

function getPath(datas){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        var env = JSON.parse(datas)[0];
        var key = JSON.parse(datas)[1];
        client.hget(env+"PathList",key, (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
    });
}

function getPathList(env){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall(JSON.parse(env)+"PathList", (error, result) => {
            if (!error){
                resv(result)  
            }else{
                rej(error)
            }
        });
        
    });
}

function getWebManagementSystemDatas(env){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        client.hgetall(JSON.parse(env)+"WebManagementSystemDatas", (error, response) => {
            if (response != null){
                resv(response)  
            }else{
                resv(response)
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

function updateWebManagementSystemDatas(datas){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        let env = JSON.parse(datas)[0];
        let jsonObject= JSON.parse(datas)[1];
        try {
            client.hmset(env+"WebManagementSystemDatas",jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
    });
}


function updatePath(datas){
    return new Promise((resv, rej) => {
        let client = connectRedis(15);
        var env = JSON.parse(datas)[0];
        let jsonObject= JSON.parse(datas)[1];
        try {
            client.hmset(env+"PathList",jsonObject);
            resv({'returnObject':null})
        }
        catch(error){
            rej(error)
        }
  
    });
}

function getKeys(db){
    return new Promise((resv, rej) => {
        let client = connectRedis(JSON.parse(db));
        client.keys('*',(error,keys) => {
            if(!error){
                resv(keys)
            }else{
                rej(error)
            }
                
        })
        
    });
}




async function addScript(datas){
    var db = JSON.parse(datas)[0];
    var tableNames = await getKeys(db);    
    return new Promise((resv, rej) => {
        let client = connectRedis(db);
        let jsonObject= JSON.parse(datas)[1];
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


function delScript(datas){
    var db = JSON.parse(datas)[0];
    return new Promise((resv, rej) => {
        let client = connectRedis(db);
        let jsonObject= JSON.parse(datas)[1];
        client.del(jsonObject, (error, result) => {
            if (!error){
                resv({'returnObject':null})
            }else{
                rej(error)
            }
        });
    });
    
}

function updateScript(datas){
    var db = JSON.parse(datas)[0];
    return new Promise((resv, rej) => {
        let jsonObject= JSON.parse(datas)[1];
        let tableName = Object.keys(jsonObject)[0];
        let client = connectRedis(db);
        client.del(tableName, (error, result) => {
            if (!error){
                try {
                    client.hmset(tableName,jsonObject[tableName]);
                    resv({'returnObject':null})
                }
                catch(err){
                    rej(err)
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

module.exports.getWebManagementSystemDatas = getWebManagementSystemDatas;
module.exports.updateWebManagementSystemDatas = updateWebManagementSystemDatas;













