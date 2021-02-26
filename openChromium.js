const puppeteer = require('puppeteer')

async function openChromium(url) {
    const browser = await puppeteer.launch({
      headless: false, // 是否在背景運行瀏覽器
      args: ['--no-sandbox', '--window-size=1080,1050','--no-default-browser-check'],
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
    await page.setViewport({width: 500,height: 962})

    await page.evaluate(()=>{
      var loaging = setInterval(loadComplete,1000)
      setInterval(stopBroadcast,1000)
      function loadComplete(){
        if (core.data.loadComplete){
          console.log("loadComplete")
          document.addEventListener("click", function(e){
            var coordinates ="clientX: " + e.clientX +" - clientY: " + e.clientY;
            console.log(coordinates)
          })
          clearInterval(loaging)
        }
      }
      function stopBroadcast(){
        console.log(slot.data._stopBroadcast)
      }
    })

    

    
      
    //監聽點擊位置
    // await page.evaluate(()=>{
    //   document.addEventListener("click", function(e){
    //     var coordinates ="clientX: " + e.clientX +" - clientY: " + e.clientY;
    //     console.log(coordinates)
    //   })
    // })
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

module.exports.openChromium = openChromium;


