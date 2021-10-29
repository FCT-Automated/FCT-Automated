const electron = require('electron');
const { saveAs } = require('file-saver');
var apiJs = require('../js/api');
var open = require('../js/openChrome')

var chromePath;
var apiUrl;
var seamlessApiUrl;
var CurrencyList;
var GameList;
var LanguageList;
var scriptList;

async function init(){
    chromePath = await psotLocalhostApi('/getUrlOrPath','chromePath');
    apiUrl = await psotLocalhostApi('/getUrlOrPath','apiUrl');
    seamlessApiUrl = await psotLocalhostApi('/getUrlOrPath','seamlessApiUrl');
    CurrencyList = await psotLocalhostApi('/getList','CurrencyList');
    GameList = await psotLocalhostApi('/getList','GameList');
    LanguageList = await psotLocalhostApi('/getList','LanguageList');
    scriptList = await getLocalhostApi('/getScriptKeys');
    document.getElementById('myiframe').src ="apiPage.html";
}

function getLocalhostApi(path){
    return new Promise((resv, rej) => {
        const request = electron.remote.net.request({
            method: 'GET',
            protocol: 'http:',
            hostname: '127.0.0.1',
            port: 9000,
            path: path
            
        });
        request.setHeader('Content-Type', 'application/json');
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                resv(JSON.parse(chunk))
            });
        });
        request.on('abort', () => {
            console.log('Request is Aborted')
        });
        request.on('error', (error) => {
            console.log(`ERROR: ${JSON.stringify(error)}`)
        });
        request.end();
    })

}

function psotLocalhostApi(path,data){
    return new Promise((resv, rej) => {
        var body = JSON.stringify(data);
        const request = electron.remote.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: '127.0.0.1',
            port: 9000,
            path: path
            
        });
        request.setHeader('Content-Type', 'application/json');
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                resv(JSON.parse(chunk))
            });
        });
        request.on('abort', () => {
            console.log('Request is Aborted')
        });
        request.on('error', (error) => {
            console.log(`ERROR: ${JSON.stringify(error)}`)
        });
        request.write(body, 'utf-8');
        request.end();
    })

}

window.addEventListener('message', e => {
    document.getElementById("message").innerHTML = e.data
},false);


init();

