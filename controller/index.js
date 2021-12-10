const electron = require('electron');
const {net} = require('electron')
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
var DBUsername;
var DBPassword;
var DBhost;
var DBPort;
var DBName;

async function init(){
    chromePath = await psotLocalhostApi('/getPath','chromePath');
    apiUrl = await psotLocalhostApi('/getPath','apiUrl');
    seamlessApiUrl = await psotLocalhostApi('/getPath','seamlessApiUrl');
    DBUsername = await psotLocalhostApi('/getPath','DBUsername');
    DBPassword = await psotLocalhostApi('/getPath','DBPassword');
    DBhost = await psotLocalhostApi('/getPath','DBhost');
    DBPort = await psotLocalhostApi('/getPath','DBPort');
    DBName = await psotLocalhostApi('/getPath','DBName');
    CurrencyList = await psotLocalhostApi('/getList','CurrencyList');
    GameList = await psotLocalhostApi('/getList','GameList');
    LanguageList = await psotLocalhostApi('/getList','LanguageList');
    scriptList = await getLocalhostApi('/getKeys');
    document.getElementById('myiframe').src ="api_and_script_page.html?api";
}

function getLocalhostApi(path){
    return new Promise((resv, rej) => {
        console.log("request start -get");
        const request = electron.remote.net.request({
            method: 'GET',
            protocol: 'http:',
            hostname: 'localhost',
            port: 9000,
            path: path
            
        });
        request.setHeader('Content-Type', 'application/json');
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                console.log("request end -get");
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
        console.log("request start -post");
        var body = JSON.stringify(data);
        const request = electron.remote.net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 9000,
            path: path
            
        });
        request.setHeader('Content-Type', 'application/json');
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                console.log("request end -post");
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

