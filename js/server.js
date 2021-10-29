var http = require('http');
var redis = require('./redis');
const { StringDecoder } = require('string_decoder');
const { table } = require('console');

redis.createPathList();

var server = http.createServer(async function(req, res) {
    const decoder = new StringDecoder('utf-8');
    if(req.url == '/'){
        res.end();
    
    }else if(req.url=='/getList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(tableName){
            res.write(JSON.stringify(await redis.getList(decoder.write(tableName))));
            res.end();
        });
    }else if(req.url=='/getUrlOrPath'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(key){
            res.write(JSON.stringify(await redis.getUrlOrPath(decoder.write(key))));
            res.end();
        });
    }else if(req.url=='/delData'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.delData(decoder.write(data))));
            res.end();
        });
    }else if(req.url=='/addData'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(datas){
            res.write(JSON.stringify(await redis.addData(decoder.write(datas))));
            res.end();
        });
    }else if(req.url=='/updateData'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(datas){
            res.write(JSON.stringify(await redis.updateData(decoder.write(datas))));
            res.end();
        });
    }else if(req.url=='/importList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(datas){
            res.write(JSON.stringify(await redis.importList(decoder.write(datas))));
            res.end();
        });
    }

    //db15:Currency
    else if(req.url=='/batchImportCurrencyList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.batchImportCurrencyList(decoder.write(data))));
            res.end();
        });
    }

    //db15:Game
    else if(req.url=='/batchImportGameList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.batchImportGameList(decoder.write(data))));
            res.end();
        });
    }
    
    //db15:Language   
    else if(req.url=='/batchImportLanguageList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        req.on('data', async function(data){
            res.write(JSON.stringify(await redis.batchImportLanguageList(decoder.write(data))));
            res.end();
        });
    }

    //db15:Path
    else if(req.url=='/getSeamlessApiUrl'){
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