const electron = require('electron');
const { saveAs } = require('file-saver');
var apiJs = require('../controller/api');
var browser = require('../controller/browser');

var chromePath;
var apiUrl;
var seamlessApiUrl;
var CurrencyList;
var GameList;
var LanguageList;
var scriptList;

async function init(){
    chromePath = await psotLocalhostApi('/getPath','chromePath');
    apiUrl = await psotLocalhostApi('/getPath','apiUrl');
    seamlessApiUrl = await psotLocalhostApi('/getPath','seamlessApiUrl');
    CurrencyList = await psotLocalhostApi('/getList','CurrencyList');
    GameList = await psotLocalhostApi('/getList','GameList');
    LanguageList = await psotLocalhostApi('/getList','LanguageList');
    scriptList = await getLocalhostApi('/getKeys');
    document.getElementById('myiframe').src ="api_and_script_page.html?api";
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


init();

