var querystring = require('querystring')
var request = require('request')
var mongodbClient = require('mongodb').MongoClient;

var apiUrl
var homeUrl = 'https://www.mearhh.com'

function connectMongoDB(code){
    return new Promise((resv, rej) => {
        const DATABASEUSERNAME = "game_server";
        const DATABASEPASSWORD = "GS77SvbADc";
        const DATABASEHOST = "104.199.225.172";
        const DATABASEPORT = "27017";
        const DATABASENAME = "gamesystem";

        mongodbClient.connect('mongodb://'+DATABASEUSERNAME+':'+DATABASEPASSWORD+'@'+DATABASEHOST+':'+DATABASEPORT+'/'+DATABASENAME,
        { useNewUrlParser: true , useUnifiedTopology: true},
        function(err,db){
            if(!err) {
                console.log("successfully connected to the MongoDataBase");
                var dbo = db.db("gamesystem");
                dbo.collection("APIAgentSetting").findOne({code:code},function(err,result){
                    if (err){
                        console.log(err);
                    } 
                    db.close();
                    if (result != null){
                        resv(result['key']);
                    }else{
                        resv("");
                    }
                    
                });
            }else{
                console.log(err);
            }
        });
    })
    
}

function setApiKey(params,agentKey){
    return new Promise(function(resolve,reject){
        let form = {
            Params:params,
            AgentKey:agentKey
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: 'https://'+apiUrl+'/Key',
            method: 'POST',
            body: formData ,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(postOptions)
    })
}

function setApiTools(getKey,apis,agentCode,currency){
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
            url: 'https://'+apiUrl+'/'+apis,
            method: 'POST',
            body: formData ,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(postOptions)
    })
}

function apiSeamlessRequest(apis,params){
    return new Promise(function(resolve,reject){        let form = {
            Params:params,
        }
        let formData = querystring.stringify(form)
        let postOptions = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: 'https://'+apiUrl+'/'+apis,
            method: 'POST',
            body: formData ,
            agentOptions: {
                rejectUnauthorized: false
            }
        }
        resolve(doRequest(postOptions))
    })
}

function doRequest(postOptions) {
    return new Promise(function (resolve, reject) {
        request(postOptions,function(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body))
            }else{
                reject(error)
            }
        })
    })
}
 
async function requestAPI(args,url) {
    apiUrl = url
    var arg
    switch (args['API']){
        case 'Login':
            arg = JSON.stringify({
                MemberAccount : args['MemberAccount'],
                GameID : args['GameID'],
                LanguageID : args['LanguageID'],
                HomeUrl : homeUrl
            })
            break
        case 'SetPoints':
            arg = JSON.stringify({
                MemberAccount : args['MemberAccount'],
                AllOut : 0,
                Points : args['Points']
            })            
            break
        case 'KickOut':
            arg = JSON.stringify({
                MemberAccount : args['MemberAccount']
            })
            break
        case 'GetEvents':
            arg = JSON.stringify({})
            break
        case 'GetDemoUrl':
            arg = JSON.stringify({
                GameID : args['GameID'],
                LanguageID : args['LanguageID']
            })
            break
    }
    let agentCode = await connectMongoDB(args['AgentCode'])
    let keyOptions = await setApiKey(arg,agentCode)
    let getKey = await doRequest(keyOptions)
    //-----second request-----
    let apisOptions = await setApiTools(getKey,args['API'],args['AgentCode'],args['Currency'])
    return doRequest(apisOptions)
}

async function requestSeamlessAPI(args,url) {
    apiUrl = url
    var arg = JSON.stringify({
        MemberAccount : args['MemberAccount'],
        Points : args['Points']
    })
    //-----request-----
    return apiSeamlessRequest(args['API'],arg)
}

module.exports.requestAPI = requestAPI;
module.exports.requestSeamlessAPI = requestSeamlessAPI;