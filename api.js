var querystring = require('querystring')
var request = require('request')

function apiKey(params,agentKey){
    return new Promise(function(resolve,reject){
        let form = {
            Params:params,
            AgentKey:agentKey
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: 'https://api.mearhh.com/Key',
            method: 'POST',
            body: formData 
        }
        resolve(postOptions)
    })
}

function apiTools(getKey,apis,agentCode,currency){
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
            url: 'https://api.mearhh.com/'+apis,
            method: 'POST',
            body: formData 
        }
        resolve(postOptions)
    })
}

function doRequest(postOptions) {
    return new Promise(function (resolve, reject) {
        request(postOptions,function(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body))
            }else{
                reject(response.statusCode)
            }
        })
    })
}
 
async function requestAPI(args) {
    let arg = JSON.stringify({
        MemberAccount : args['MemberAccount'],
        GameID : args['GameID'].split(":")[1],
        LanguageID : args['LanguageID'].split(":")[1],
        HomeUrl : "https://www.mearhh.com"
    })
    let keyOptions = await apiKey(arg,'C9bIOW5I479qpLC0')
    let getKey = await doRequest(keyOptions)
    //-----second request-----
    let apisOptions = await apiTools(getKey,args['API'],args['AgentCode'],args['Currency'])
    var Url = await doRequest(apisOptions)
    return Url
}

module.exports.requestAPI = requestAPI;
