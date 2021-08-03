const puppeteer = require('puppeteer')

async function openChrome(url,chromePath,gameId,script) {
  var gamesize = {
    width : 500,
    height : 962
  }
  var windowsize ={
    width : 762,
    height : 1050
  }
  if (gameId.substr(0,2)== '21'){
    gamesize.width = 717
    gamesize.height = 407
    windowsize.width = 979
    windowsize.height = 498

  }

  //chrome設定
  const browser = await puppeteer.launch({
    executablePath: chromePath+'\\chrome.exe',
    headless: false, // 是否在背景運行瀏覽器
    args: [`--window-size=${windowsize.width},${windowsize.height}`,'--no-default-browser-check','--no-sandbox'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  })
  
  //開新分頁
  const page = await browser.newPage()
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  //監聽websocket
  const client = await page.target().createCDPSession()
  await client.send('Network.enable')
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
  //當websocket關閉時
  client.on('Network.webSocketClosed', 
    async function(params){
      console.log("斷線")
      await page.screenshot({path: Date().replace(/:/g,".")+'.png'}); // 截圖
    }
  )

  page.on("console", msg => {
    if (msg.text()=="loadComplete"){
      console.log(msg.text())
    }
  })

  //進入遊戲
  await page.goto(url)
  //調整遊戲視窗
  await page.setViewport({width: gamesize.width,height: gamesize.height})

  //以下前端之後會拔掉，無法在console查前端狀態
  // await page.evaluate(()=>{
  //   var loaging = setInterval(loadComplete,5000)
  //   setInterval(stopBroadcast,5000)
  //   function loadComplete(){
  //     if (core.data.loadComplete){
  //       console.log("loadComplete")
  //       clearInterval(loaging)
  //     }
  //   }
  //   function stopBroadcast(){
  //     console.log(slot.data._stopBroadcast)
  //   }
  // })

  //監聽點擊位置
  if(script == 'Demo'){
    await page.evaluate(()=>{
      document.addEventListener("click", function(e){
        var coordinates ="{x:" + e.clientX +",y:" + e.clientY+"}";
        console.log(coordinates)
      })
    })
  }else if(typeof(script) == "object"){
    while(page._closed == false){
      for (var action in script){
        console.log("ready:"+script[action])
        switch (action.split("_")[1]){
          case "wait":
            await wait(parseInt(script[action])*1000);
            break
          case "click":
            var postion = JSON.parse(script[action])
            await page.mouse.move(postion["x"], postion["y"])
            await page.mouse.down()
            await page.mouse.up()
            await wait(500);
            break
        }
        console.log("done")
        
      }
    }
  }
    
    //await wait(15000);
    //無限點擊
    // while(page._closed == false) {
    //   await page.mouse.move(getRandomInt(135,359), getRandomInt(339,518))
    //   await page.mouse.down()
    //   await page.mouse.up()
    // }
    //await browser.close();
}
  
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getRandomInt(min, max) {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

module.exports.openChrome = openChrome;


