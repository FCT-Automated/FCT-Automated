var querystring = require('querystring')
var request = require('request')

function setApiKey(params,agentKey,apiUrl){
    return new Promise(function(resolve,reject){
        let form = {
            Params:params,
            AgentKey:agentKey
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: apiUrl+'/Key',
            method: 'POST',
            body: formData ,
            timeout: 2000,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(postOptions)
    })
}

function setApiTools(getKey,apis,agentCode,currency,apiUrl){
    return new Promise(function(resolve,reject){
        let form = {
            Params:getKey.Params,
            Sign:getKey.Sign,
            AgentCode:agentCode,
            Currency:currency
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: apiUrl+'/'+apis,
            method: 'POST',
            body: formData ,
            timeout: 2000,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(postOptions)
    })
}

function apiSeamlessRequest(apis,params,seamlessApiUrl){
    return new Promise(function(resolve,reject){        
        let form = {
            Params:params,
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: seamlessApiUrl+'/'+apis,
            method: 'POST',
            body: formData ,
            timeout: 2000,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(postOptions)
    })
}

function doRequest(postOptions) {
    return new Promise(function (resolve, reject) {
        request(postOptions,function(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body))
            }else if(error.code === 'ETIMEDOUT'){
                reject("timedout");
            }else{
                reject(error);
            }
        })
    })
}

async function parseOtherParam(args,arg){
    return new Promise((resv, rej) => {
        if(args["Other"]){
            for(let other of args["Other"].split(",")){
                let key = other.split(":")[0];
                let value = other.split(key+":")[1];
                arg[key] = value;
            }
        }
        resv(arg);
    });
}
 
async function requestAPI(args,apiUrl) {
    var arg
    switch (args['API']){
        case 'Login':
            arg = {
                MemberAccount : args['MemberAccount'],
                GameID : args['GameID'],
                LanguageID : args['LanguageID']
            }
            arg = await parseOtherParam(args,arg);
            break
        case 'SetPoints':
            arg = {
                MemberAccount : args['MemberAccount'],
                AllOut : 0,
                Points : args['Points']
            }
            arg = await parseOtherParam(args,arg);          
            break
        case 'KickOut':
            arg = {
                MemberAccount : args['MemberAccount']
            }
            arg = await parseOtherParam(args,arg);
            break
        case 'GetEvents':
            break
        case 'GetDemoUrl':
            arg = {
                GameID : args['GameID'],
                LanguageID : args['LanguageID']
            }
            break
    }
    arg =  JSON.stringify(arg);
    try{
        let keyOptions = await setApiKey(arg,args["AgentKey"],apiUrl)
        let getKey = await doRequest(keyOptions)
        //-----second request-----
        let apisOptions = await setApiTools(getKey,args['API'],args['AgentCode'],args['Currency'],apiUrl)
        return doRequest(apisOptions)
    }catch(err){
        return err
    }
    
}

async function requestSeamlessAPI(args,seamlessApiUrl) {
    var arg = JSON.stringify({
        MemberAccount : args['MemberAccount'],
        Points : args['Points']
    })
    //-----request-----
    let apisOptions =  await apiSeamlessRequest(args['API'],arg,seamlessApiUrl);
    try{
        return doRequest(apisOptions);
    }catch(err){
        return err
    }
}

module.exports.requestAPI = requestAPI;
module.exports.requestSeamlessAPI = requestSeamlessAPI;