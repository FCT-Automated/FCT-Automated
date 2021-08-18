var http = require('http');
var redis = require('./redis');

var server = http.createServer(async function (req, res) {
    if(req.url == '/'){
        res.end();
    //db15:Currency
    }else if(req.url=='/getCurrencyList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getCurrencyList()));
        res.end();
    }else if(req.url=='/addCurrency'){
        //do somthing
    }else if(req.url=='/updateCurrency'){
        //do somthing
    }else if(req.url=='/delCurrency'){
        //do somthing
    }

    //db15:GameID    
    else if(req.url=='/getGameList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getGameList()));
        res.end();
    }else if(req.url=='/addGame'){
        //do somthing
    }else if(req.url=='/updateGame'){
        //do somthing
    }else if(req.url=='/delGame'){
        //do somthing
    }
    
    //db15:Language   
    else if(req.url=='/getLanguageList'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getLanguageList()));
        res.end();
    }else if(req.url=='/addLanguage'){
        //do somthing
    }else if(req.url=='/updateLanguage'){
        //do somthing
    }else if(req.url=='/delLanguage'){
        //do somthing
    }

    //db15:Path  
    else if(req.url=='/getChromePath'){
        res.writeHead(200,{'Content-Type': 'application/json'});
        res.write(JSON.stringify(await redis.getChromePath()));
        res.end();
    }else if(req.url=='/updateChromePath'){
        //do somthing
    }else if(req.url=='/getApiUrl'){
        res.writeHead(200,{'Content-Type': 'application/json'});
    }else if(req.url=='/getSeamlessApiUrl'){
        res.writeHead(200,{'Content-Type': 'application/json'});
    }

    else
        res.end('Invalid Request!');
    
    
});

server.listen(9000)