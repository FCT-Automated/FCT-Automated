const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // 是否在背景運行瀏覽器
    args: ['--no-sandbox', '--window-size=1080,1050','--no-default-browser-check'],
    ignoreDefaultArgs: ['--enable-automation'],
    autoClose: false,
    devtools: true
  });
  //開新分頁
  const page = await browser.newPage();
  const page_api = await browser.newPage();
  //關閉預設開啟的第一個分頁
  const pages = await browser.pages()
  await pages[0].close()
  await page_api.goto('https://agent.mearhh.com/login')
  await page_api.type('input[name="account"]', 'mo359612')
  await page_api.type('input[name="password"]', 'a123456')
  await page_api.click('button[type="submit"]')
  await wait(5000);
  await page_api.goto('https://agent.mearhh.com/apiTools#tab_Seamless_type')
  await wait(5000);
  await page_api.select('#chooseAPI_Seamless', 'SetJson')
  //轉點
  await setpoints(50,page_api,'momo05')

  //監聽websocket
  const client = await page.target().createCDPSession()
  await client.send('Network.enable')
  client.on('Network.webSocketClosed', 
  async function(params){
    console.log("斷線")
    await page.screenshot({path: Date().replace(/:/g,".")+'.png'}); // 截圖
    await setpoints(50,page_api,'momo05')
    await wait(3000)
    await page.mouse.move(252, 572)
    await page.mouse.down()
    await page.mouse.up()
    await start(page_api,page)
  }
  )
  
  //進入遊戲
  await page.goto('https://game.mearhh.com/game/27002/index?Params=eyJpdiI6IkcxQ0YraG5TdFFTQzh6WVIwSld4Nmc9PSIsInZhbHVlIjoid29EVks1MlNqK2RGb204M21BMXpMSWpzNHZnQ2U3ZHh2dUt3UzVHRzd6U1Q0Y3FEK1BWV0NxZENLRmFYaitGTU1OTjQxTDRyZC81NmVzQVhvVkFyaFZIVTdSNEdhbWFna1JSRlJ3RTVCOEtZL3EwQ3VQN09sa0hJZTRxZWJldG41V3hDWkhFaVpndlFBVGJMSGM2am1NQ2VqUWFvOW1JVzN5RS81ZHVkcEVySDRGV0JObVRrNnhvV29lMkZZcUE5VlN5V0lsVjhDSml0RGl1N0s4dEp3YkFwUUdkTmRMVEJtc0ZMMmFoVllKSFlLcWlocWZYZlNZejZ3VTJ4VjN0TjVTOW9jS0hJVlVtMTA2SlEyb3JySXg5VEJjUWRJejNHYkwvYk9INi9MR0pFNnIvTEhPdjczR2NSdDdsbkRKVkU2dHBZckVmblUyc2dQcVhySGVPUEZLTTNSUExIeE0vbEhQMWlFdllnWG1FMGNkcVdzQURaNXdObW8zNjcxZ01KIiwibWFjIjoiZmFmMmE5OWRjNWZhMzgyNjdiMmU3MjZkODk1ODE1MDE0NmFmYjJkYzU0YmY3Mjg0YmNhYzhkNzJiOWIzZDg1NCJ9&languageID=2');
  //調整遊戲視窗
  await page.setViewport({width: 500,height: 962})
  await start(page_api,page)

})()

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function setpoints(points,pages,account){
  await pages.evaluate(() => {
    document.querySelector('#Params_Seamless').value =''
  })
  await pages.type('#Params_Seamless', '{"MemberAccount":"'+account+'","Points":'+String(points)+'}')
  await pages.click('#searchBtn_Seamless')
  await wait(3000)
  await pages.click('button[class="confirm"]')
}

async function start(page_api,page){
  await wait(30000)
  await setpoints(-50,page_api,'momo05')
  //關閉教學
  await page.mouse.move(469, 314)
  await page.mouse.down()
  await page.mouse.up()
  //開自動
  await page.mouse.move(454, 154)
  await page.mouse.down()
  await page.mouse.up()
  
  
}
