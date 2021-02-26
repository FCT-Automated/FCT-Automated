const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-sandbox', '--window-size=1080,1050','--no-default-browser-check'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  });
  //開新分頁
  const page = await browser.newPage()
  await page.setViewport({width: 500,height: 962})
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  

  
    //無限點擊
    // while(page._closed == false) {
    //   await page.mouse.move(getRandomInt(135,359), getRandomInt(339,518))
    //   await page.mouse.down()
    //   await page.mouse.up()
    // }

  //監聽websocket
  // const client = await page.target().createCDPSession()
  // await client.send('Network.enable')
  // client.on('Network.webSocketClosed', 
  // async function(params){
  //   console.log("斷線")
  //   await page.screenshot({path: Date().replace(/:/g,".")+'.png'}); // 截圖
  //   await wait(3000)
  //   await page.mouse.move(252, 572)
  //   await page.mouse.down()
  //   await page.mouse.up()
  //   await start(page)
  //   }
  // )
  
  
  await start(page)

})()

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms))
}


async function start(page){
  await page.goto('https://web.mearhh.com/index?Params=eyJpdiI6ImxxdHZPUEtDWlFPbmcrMnBYdVVvS1E9PSIsInZhbHVlIjoiNGFMZDl0RGZPM0Z3UjF2bVNleEZKYTVhRHBrM3ZkMmloaWJkcWwxUldLa2d1bTRzVlJHY3ZPT0d0akpRUURvR20rSW5ESzVCK2R2RHdEd1lRVzJWUFU2bnhrRDNackVwTUM3djZpemNmMFpjbDRMNjBPbTdnMTB0R01BaDdacHZwd0RKdVNkeTRkUXZkT2hBMWovUWxZOVBoVUUwbnBGSXpmd3ZmcEJuUnBmVDc5anFqQTdOWm5neDVZZnhiRVFVZ1BUVXZPZ0VxdWJHK0JlazJUMWxjZTdzcGRGaStaNWNrOFJRVXFVbWZhdFc3eFEzUS9SZzNxcm52TEd2d2JMWmUrTE1hWlV6cHJCL3pMb0JzRnY1bDlCRWt4Z2VTc1oyWmNlejAyQXZXMGRzWXNlZ3ZLQUZiaW1pZzJLcjNaNUR2ZVBiS1dueVhKbTVwWGRwcitHdjhsaGkxeXRabGw1aVFyUDhrL3RoU3BzPSIsIm1hYyI6IjNjMDRlMmViMzkwMWY1ODkzMThlYzRlODI1MTk4MTMxMjc0NTQ2ZjE0MjE3YmRlYWYyMTRjMTIxNGI1ZGE5OGIifQ%3D%3D&languageID=2')
  //監聽點擊位置
  await page.evaluate(()=>{
    var loaging = setInterval(loadComplete,1000)
    function loadComplete(){
        if (core.data.loadComplete){
          console.log("loadComplete")
          // document.addEventListener("click", function(e){
          //   var coordinates ="clientX: " + e.clientX +" - clientY: " + e.clientY;
          //   console.log(coordinates)
          // })
          clearInterval(loaging)
        }
    }
  })
  
  page.on("console", msg => {
    if (msg.text()=="loadComplete"){
        run(page)
    }
  })
  
  
}

async function run(page){
    //開自動
    while(page._closed == false) {
      //await page.mouse.move(getRandomInt(156,499), getRandomInt(347,499))
      await page.mouse.move(250, 652)
      await page.mouse.down()
      await page.mouse.up()
      await wait(1000)
    }
}

function getRandomInt(min, max) {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}