const puppeteer = require('puppeteer');

async function createBrowser(url,datas,apiUrl,seamlessApiUrl) {
  let browserArgs ={
    executablePath: parent.chromePath,
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-default-browser-check'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  }
  //setUpBrowerArgs
  await this[datas["type"]](url,datas["object"],browserArgs,apiUrl,seamlessApiUrl); 
  
}

async function Demo(url,object,browserArgs,apiUrl,seamlessApiUrl){
  if(object['width'] === undefined){
    browserArgs["defaultViewport"] = null
    let page = await openBrowser(browserArgs);
    await page.goto(url+"&version="+object['version']);
    await page.evaluate(()=>{
      document.addEventListener("click", function(e){
        console.log("{\"x\":" + e.clientX +",\"y\":" + e.clientY+"}")
      });
      window.addEventListener('resize', function(){
        let gameCanvas = document.getElementById('GameCanvas');
        console.log("寬:"+gameCanvas.style.width);
        console.log("長:"+gameCanvas.style.height);
      });
    });
  }else{
    let page = await openBrowser(browserArgs);
    await page.goto(url+"&version="+object['version']);
    await page.setViewport({width: parseInt(object['width']),height: parseInt(object['height'])});
    await page.evaluate(()=>{
      document.addEventListener("click", function(e){
        console.log("{\"x\":" + e.clientX +",\"y\":" + e.clientY+"}");
      });
    });
  }
}

async function Script(url,object,browserArgs,apiUrl,seamlessApiUrl){
  let page = await openBrowser(browserArgs);
  if (object['returnObject']['version'] != ""){
    await page.goto(url+"&version="+object['returnObject']['version']);
  }else{
    await page.goto(url);
  }
  await page.setViewport({width: parseInt(object['returnObject']['width']),height: parseInt(object['returnObject']['height'])});

  var isStart = true;
  page.on("console", async function(msg) {
    if(msg.text() == 'start'){
      isStart = true;
      console.log("開始執行腳本")
      while(isStart){
        if(page.isClosed()){
          isStart = false;
        }
        try{
          await runScript(object,page,apiUrl,seamlessApiUrl)
        }catch{
          console.log("start出錯")
          break
        }
      }
      console.log("已停止腳本")
    }
    if(msg.text() == 'end'){
      isStart = false;

    }
    
  })
}

async function Normal(url,object,browserArgs,apiUrl,seamlessApiUrl){
  browserArgs["defaultViewport"] = null
  let page =  await openBrowser(browserArgs);
  await page.goto(url);
}

async function AutoScript(MemberAccounts,args,script,minute,apiUrl,seamlessApiUrl){
  let browserArgs ={
    executablePath: parent.chromePath, // windows
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-default-browser-check','--no-sandbox'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  }
  var page = await openBrowser(browserArgs);
  let version = script['returnObject']['version'];
  let width = script['returnObject']['width'];
  let height = script['returnObject']['height'];
  let datas = script;
  let isStart_out = true;
  var response;
  while(isStart_out){
      for(let MemberAccount of MemberAccounts){
        args['MemberAccount'] = MemberAccount;
        datas['user'] = args;
        try{
          response = await parent.apiJs.requestAPI(args,apiUrl)
        }catch(err){
          console.log(err)
        }
        let code;
        if(response){
          code = response.Result;
        }else{
          code = 1;
        }
        if ( code == 0){            
            if ( version!= ""){
              await page.goto(response.Url+"&version="+version);
            }else{
              await page.goto(response.Url);
            }
            await page.setViewport({width: parseInt(width),height: parseInt(height)});
            var isStart = true;
            setTimeout(() => isStart = false, parseInt(minute)*1000*60);
            while(isStart){
              if (page.isClosed()) {
                isStart = false;
                isStart_out = false;
              }
              else{
                await runScript(datas,page,apiUrl,seamlessApiUrl)  
              }
                 
            }
            
        }else{
            console.log("requestAPI error:"+response,args);
        }
      } 
  }
}

async function openBrowser(browserArgs){
  const browser = await puppeteer.launch(browserArgs);
  //開新分頁
  let page = await browser.newPage()
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  //監聽websocket
  let client = await page.target().createCDPSession()
  await client.send('Network.enable')
  //當websocket關閉時
  client.on('Network.webSocketClosed', 
    async function(){
      console.log(Date()+"斷線");
      // await page.waitFor(1000);
      // await page.screenshot({path: Date().replace(/:/g,".")+'.png'}); // 截圖
    }
  )

  return page;
}


async function runScript(datas,page,apiUrl,seamlessApiUrl){
  var apiJs = require('./api');
  let scripts = datas['returnObject'];
  delete scripts["width"]; 
  delete scripts["height"]; 
  delete scripts["version"]; 
  let user = datas['user'];
  let response;
  
  for (let action in scripts){
    console.log(action.split("_")[1]+"-start");
    let code;
    switch (action.split("_")[1]){
      case "wait":
        await wait(parseInt(scripts[action])*1000);
        break
      case "click":
        let postion = JSON.parse(scripts[action])
        await page.mouse.move(postion["x"], postion["y"]);
        await page.mouse.down()
        await page.mouse.up()
        break
      case "setpoints-normal":
        user['API'] = 'SetPoints';
        user['Points'] = scripts[action];
        try{
          response = await apiJs.requestAPI(user,apiUrl);
        }catch(err){
          console.log(err);
        }
        if(response){
          code = response.Result;
        }else{
          code = 1;
        }
        if(code == 0){
          console.log("setPoints Successfully")
        }else{
          console.log("setPoints Fail")          
        }
        break
      case "setpoints-seamless":
        user['API'] = 'SetJson';
        user['Points'] = scripts[action];
        try{
          response =  await apiJs.requestSeamlessAPI(user,seamlessApiUrl);
        }catch(err){
          console.log(err);
        }
        if(response){
          code = response.Result;
        }else{
          code = 1;
        }
        if(code == 0){
          console.log("setPoints Successfully")
        }else{
          console.log("setPoints Fail")
        }
        break
      case "refresh":
        await page.reload();
        break
    }
    console.log(action.split("_")[1]+"-end");
  }
  user['API'] = 'Login';
}
  
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}



module.exports.createBrowser = createBrowser;
module.exports.Normal = Normal;
module.exports.Script = Script;
module.exports.Demo = Demo;
module.exports.openBrowser =openBrowser;
module.exports.runScript = runScript;
module.exports.AutoScript = AutoScript;





