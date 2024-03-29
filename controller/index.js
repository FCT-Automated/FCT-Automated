const electron = require('electron');
const {net} = require('electron')
const { saveAs } = require('file-saver');
var apiJs = require('../controller/api');
var browser = require('../controller/browser');
var axios = require('axios');
var cheerio = require("cheerio");

var chromePath;
var apiUrl;
var seamlessApiUrl;
var CurrencyList;
var GameList;
var LanguageList;
var QAAgentKeyList;
var ReleaseAgentKeyList;
var LiveAgentKeyList;
var hangUpScriptList;
var crawlerScriptList;
var verificationFormulaList;
var env;
var hangUpDB = 14;
var crawlerDB = 13;
var verificationFormulaDB = 12;
var token;
var BetRecordVerificationisExit = false;

async function init(){
    CurrencyList = await psotLocalhostApi('/getList','CurrencyList');
    GameList = await psotLocalhostApi('/getList','GameList');
    LanguageList = await psotLocalhostApi('/getList','LanguageList');
    QAAgentKeyList = await psotLocalhostApi('/getList','QAAgentKeyList');
    ReleaseAgentKeyList = await psotLocalhostApi('/getList','ReleaseAgentKeyList');
    LiveAgentKeyList = await psotLocalhostApi('/getList','LiveAgentKeyList');
    hangUpScriptList = await psotLocalhostApi('/getKeys',hangUpDB);
    crawlerScriptList = await psotLocalhostApi('/getKeys',crawlerDB);
    verificationFormulaList = await psotLocalhostApi('/getKeys',verificationFormulaDB);
    myiframe.src ="api_and_script_page.html?api";
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
    env = currentEnv.value;
    chromePath = await psotLocalhostApi('/getPath',[chengeEnv,'chromePath']);
    apiUrl = await psotLocalhostApi('/getPath',[chengeEnv,'apiUrl']);
    seamlessApiUrl = await psotLocalhostApi('/getPath',[chengeEnv,'seamlessApiUrl']);
    myiframe.contentWindow.location.reload(true);
}

init();


$(function() {
    var changeEnv = currentEnv;
    changeEnv.addEventListener('change', function(){
        changePath(changeEnv.value);
    });

    env = currentEnv.value;
    changePath(env);
})
