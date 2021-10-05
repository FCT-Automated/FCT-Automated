const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-sandbox', '--window-size=500,1050'],
    //ignoreDefaultArgs: ['--enable-automation'],
    //autoClose: false,
    devtools: true
  });
  //開新分頁
  const page = await browser.newPage()
  await page.setViewport({width: 500,height: 919})
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  

  

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
  await page.goto('https://web.mearhh.com/index?Params=eyJpdiI6IkZJU2ZaZERkZFJwM0RoYmFiTk1vQkE9PSIsInZhbHVlIjoiM042Y0hrMVNydEVJT0VQb2p4K1lFdmRRS0VtdzRmTllDdjlKUHpSOG14NHhzVWZMeHd2Y2kxWVI1bUJyOEx0MVlXbjJGME8wYldqc0crTDkyOFF0cWJUR2gwa3cwSnVlSmMzYjJ0eWc2Y2pXNlZob1F2UHpBSytKa2lnTjNiVnZIWkhBY05GVWM3b2pSc1FYa0kzelJPNkZXMVwvc3JkYVBxRTV5T3dwU2hINlhTVjV2Tk1rbUxQWGo2V3MxY1VBWFZETFdaZWdEYTRqNVBReTlMRUtwMnpJMmhwSDdpZFYwc29rMGt5VWZIbHhGSitMN3RLcDB5TnBaVmY5SXpxNm5EZ2Y2Qm1OT0pRMDAzUythVGhITllnTlZRS3FVZmRhQjhjNng5YmxvdUF2dHdLdDBFS1NOMlp2TjNENWZsTXBCVmhuMDU5WitRQnFuRnFvcXk0aDJlcjNNWURkVFgyT0tYRlp4OSttRUxLQT0iLCJtYWMiOiI0MGQ3MjBmZTdjMmJkYWVkODMwMTQ3YjhhZjU4ZGU4Y2M3Mzk3MWY2NzRlMWNiNzg2NDVhYTg2ZDM0YmI1ZWY1In0%3D')
  //監聽點擊位置
  await page.evaluate(()=>{
    var loaging = setInterval(loadComplete,10000)
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
  })
  
  // page.on("console", msg => {
  //   if (msg.text()=="loadComplete"){
  //     run(page)
  //   }
  // })
  
  
}

async function run(page){
    await page.mouse.move(358, 255)
    await page.mouse.down()
    await page.mouse.up()
    await wait(5000)
    while(page._closed == false) {
      //開自動
      await page.mouse.move(325, 364)
      await page.mouse.down()
      await page.mouse.up()
      //挑選點擊位置
      var ans = [[244,242],[358,217],[470,245]]
      await page.mouse.move(choose(ans)[0], choose(ans)[1])
      await page.mouse.down()
      await page.mouse.up()
      await wait(8000)
    }
}

// function getRandomInt(min, max) {  
//   return Math.floor(
//       Math.random() * (max - min + 1) + min
//   )
// }

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}