const puppeteer = require('puppeteer')

async function createBrowser(url,browserPath,type) {

  let browserArgs ={
    executablePath: browserPath, // windows
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-default-browser-check','--no-sandbox'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  }
  if(type === 'Normal' || type === 'Demo'){
    browserArgs["defaultViewport"] = null;

  }
  const browser = await puppeteer.launch(browserArgs);
  //開新分頁
  const page = await browser.newPage()
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  //監聽websocket
  const client = await page.target().createCDPSession()
  await client.send('Network.enable')
  //當websocket關閉時
  client.on('Network.webSocketClosed', 
    async function(params){
      console.log("斷線")
      await page.screenshot({path: Date().replace(/:/g,".")+'.png'}); // 截圖
    }
  )
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

  //進入遊戲
  await page.goto(url)
  //script調整遊戲視窗
  if (!browserArgs.hasOwnProperty("defaultViewport")){
    await page.setViewport({width: parseInt(type['returnObject']['width']),height: parseInt(type['returnObject']['height'])});
  }
  
  if(type === "Demo"){
    demo(page);
  }else if( type != "Normal"){
    script(page,type);
  }
  
}

async function demo(page){
  await page.evaluate(()=>{
    let gameCanvas = document.getElementById('GameCanvas');
    document.addEventListener("click", function(e){
      var coordinates ="{\"x\":" + e.clientX +",\"y\":" + e.clientY+"}";
      console.log(coordinates)
    })

    window.addEventListener('resize', function(){
      console.log("寬:"+gameCanvas.style.width);
      console.log("長:"+gameCanvas.style.height);
    })
    
  })
}


async function script(page,datas){
  var isStart = true;
  page.on("console", async function(msg) {
    if(msg.text() == 'start' && isStart){
      isStart = false;
      while(!isStart){
        try{
          await runScript(page,datas)
        }catch{
          break
        }
      }
    }
    if(msg.text() == 'end'){
      isStart = true;
    }
  })
}

async function runScript(page,datas){
  var apiJs = require('./api');
  let scripts = datas['returnObject'];
  delete scripts["width"]; 
  delete scripts["height"]; 
  let user = datas['user'];
  user['API'] = 'SetPoints';
  let seamlessApiUrl = datas['seamlessApiUrl'];
  let apiUrl = datas['apiUrl'];
  for (let action in scripts){
    //console.log("ready:"+action+" => "+scripts[action])
    switch (action.split("_")[1]){
      case "wait":
        await wait(parseInt(scripts[action])*1000);
        break
      case "click":
        let postion = JSON.parse(scripts[action])
        await page.mouse.move(postion["x"], postion["y"])
        await page.mouse.down()
        await page.mouse.up()
        break
      case "setpoints-normal":
        user['Points'] = scripts[action];
        await apiJs.requestAPI(user,apiUrl);
        break
      case "setpoints-seamless":
        user['Points'] = scripts[action];
        await apiJs.requestSeamlessAPI(user,seamlessApiUrl);
        break
      case "refresh":
        await page.reload();
        break
    }
  }
  //console.log("done")
}
  
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

// function getRandomInt(min, max) {  
//     return Math.floor(
//         Math.random() * (max - min + 1) + min
//     )
// }

module.exports.createBrowser = createBrowser;




