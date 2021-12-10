const puppeteer = require('puppeteer');

async function createBrowser(url,datas) {
  let browserArgs ={
    executablePath: parent.chromePath, // windows
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-default-browser-check','--no-sandbox'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  }
  //setUpBrowerArgs
  await this[datas["type"]](url,datas["object"],browserArgs);

  
  //接收server to client message
  // client.on('Network.webSocketFrameReceived', 
  //   function(params){
  //     //解碼base64
  //     var decodeMessage = new Buffer.from(params.response.payloadData, 'base64').toString()
  //     const targetWord = '"message"'
  //     if (decodeMessage.includes(targetWord)){
  //       console.log("斷線")
  //       page.screenshot({path: 'google.png'}) // 截圖
  //     }
  //   }
  // )
  
  
}

async function Demo(url,object,browserArgs){
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

async function Script(url,object,browserArgs){
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
        try{
          await runScript(object,page)
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

async function OnlyOneWindowsScript(url,page,datas){
  let object = datas["object"];
  if (object['returnObject']['version'] != ""){
    await page.goto(url+"&version="+object['returnObject']['version']);
  }else{
    await page.goto(url);
  }
  await page.setViewport({width: parseInt(object['returnObject']['width']),height: parseInt(object['returnObject']['height'])});
}

async function Normal(url,object,browserArgs){
  browserArgs["defaultViewport"] = null
  let page =  await openBrowser(browserArgs);
  await page.goto(url);
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


async function runScript(datas,page){
  var apiJs = require('./api');
  let scripts = datas['returnObject'];
  delete scripts["width"]; 
  delete scripts["height"]; 
  delete scripts["version"]; 
  let user = datas['user'];
  user['API'] = 'SetPoints';
  let response;
  for (let action in scripts){
    console.log(action.split("_")[1]+"-start");
    switch (action.split("_")[1]){
      case "wait":
        await wait(parseInt(scripts[action])*1000);
        break
      case "click":
        let postion = JSON.parse(scripts[action])
        await page.mouse.move(postion["x"], postion["y"]);
        await page.mouse.down()
        //await wait(0.01*1000);
        await page.mouse.up()
        break
      case "setpoints-normal":
        user['Points'] = scripts[action];
        response = await apiJs.requestAPI(user);
        if(response.Result != 0){
          console.log("setPoints Fail")
        }else{
          console.log("setPoints Successfully")
        }
        break
      case "setpoints-seamless":
        user['Points'] = scripts[action];
        response =  await apiJs.requestSeamlessAPI(user);
        if(response.Result != 0){
          console.log("setPoints Fail")
        }else{
          console.log("setPoints Successfully")
        }
        break
      case "refresh":
        await page.reload();
        break
    }
    console.log(action.split("_")[1]+"-end");
  }
}
  
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}


module.exports.createBrowser = createBrowser;
module.exports.OnlyOneWindowsScript = OnlyOneWindowsScript;
module.exports.Normal = Normal;
module.exports.Script = Script;
module.exports.Demo = Demo;
module.exports.openBrowser =openBrowser;
module.exports.runScript = runScript;





