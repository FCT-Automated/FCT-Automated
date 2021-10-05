var http = require('http');
var redis = require('./redis');
const { StringDecoder } = require('string_decoder');

redis.createPathList();

var server = http.createServer(async function(req, res) {
    const decoder = new StringDecoder('utf-8');
    if(req.url == '/'){
        res.end();
    //db15:Currency
    }else if(req.url=='/getCurrencyList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getCurrencyList()));
        res.end();
    }else if(req.url=='/addCurrency'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.addCurrency(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/updateCurrency'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.updateCurrency(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/delCurrency'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.delCurrency(decoder.write(data))));
            res.end();
        });
    }

    //db15:GameID    
    else if(req.url=='/getGameList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getGameList()));
        res.end();
    }else if(req.url=='/addGame'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.addGame(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/updateGame'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.updateGame(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/delGame'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.delGame(decoder.write(data))));
            res.end();
        });
    }
    
    //db15:Language   
    else if(req.url=='/getLanguageList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getLanguageList()));
        res.end();
    }else if(req.url=='/addLanguage'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.addLanguage(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/updateLanguage'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.updateLanguage(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/delLanguage'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.delLanguage(decoder.write(data))));
            res.end();
        });
    }

    //db15:Path
    else if(req.url=='/getPathList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getPathList()));
        res.end();
    }else if(req.url=='/getChromePath'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getChromePath()));
        res.end();
    }else if(req.url=='/getApiUrl'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getApiUrl()));
        res.end();
    }else if(req.url=='/getSeamlessApiUrl'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getSeamlessApiUrl()));
        res.end();
    }else if(req.url=='/updatePath'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.updatePath(decoder.write(data))));
            res.end();
        });
    }

    //db14:Script
    else if(req.url=='/getScriptKeys'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getScriptKeys()));
        res.end();
    }else if(req.url=='/getScript'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.getScript(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/addScript'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.addScript(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/delScript'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.delScript(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/updateScript'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.updateScript(decoder.write(data))));
            res.end();
        });
    }

    else
        res.end('Invalid Request!');
    
    
});

server.listen(9000)