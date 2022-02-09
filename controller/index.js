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
var QAAgentKeyList;
var ReleaseAgentKeyList;
var LiveAgentKeyList;
var scriptList;
var env;



async function init(){
    CurrencyList = await psotLocalhostApi('/getList','CurrencyList');
    GameList = await psotLocalhostApi('/getList','GameList');
    LanguageList = await psotLocalhostApi('/getList','LanguageList');
    QAAgentKeyList = await psotLocalhostApi('/getList','QAAgentKeyList');
    ReleaseAgentKeyList = await psotLocalhostApi('/getList','ReleaseAgentKeyList');
    LiveAgentKeyList = await psotLocalhostApi('/getList','LiveAgentKeyList');
    scriptList = await getLocalhostApi('/getKeys');
    document.getElementById('myiframe').src ="api_and_script_page.html?api";
}

function getLocalhostApi(path){
    return new Promise((resv, rej) => {
        console.log("request start - "+ path);
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
                console.log("request end - "+path);
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
        console.log("request start - "+path);
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
                console.log("request end - "+path);
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

async function changePath(chengeEnv){
    env = document.getElementById("env").value;
    chromePath = await psotLocalhostApi('/getPath',[chengeEnv,'chromePath']);
    apiUrl = await psotLocalhostApi('/getPath',[chengeEnv,'apiUrl']);
    seamlessApiUrl = await psotLocalhostApi('/getPath',[chengeEnv,'seamlessApiUrl']);
    document.getElementById('myiframe').contentWindow.location.reload(true);
}

init();


$(function() {
    var changeEnv = document.getElementById("env");
    changeEnv.addEventListener('change', function(){
        changePath(changeEnv.value);
    });

    env = document.getElementById("env").value;
    changePath(env);
})
