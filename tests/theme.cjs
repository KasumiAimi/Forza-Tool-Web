const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
  const button=page.locator('#themeToggle');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  const darkBox=await page.locator('.reference-feature-row').boundingBox();
  await button.focus();await button.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await button.getAttribute('aria-label'),'切换到深色主题');
  assert.deepEqual(await page.locator('.reference-feature-row').boundingBox(),darkBox,'theme changed layout');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light','theme not restored');
  assert.equal(await page.evaluate(()=>localStorage.getItem('horizon_web_v2_theme')),'light');
  const nav=page.getByRole('navigation',{name:'主导航',exact:true});
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await button.click();
   await page.locator('#logo').click();
   const palette=await page.evaluate(()=>({background:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.querySelector('.reference-welcome h1')).color,scheme:getComputedStyle(document.documentElement).colorScheme}));
   assert.equal(palette.background,theme==='light'?'rgb(244, 244, 241)':'rgb(24, 24, 24)');
   assert.equal(palette.ink,theme==='light'?'rgb(32, 37, 31)':'rgb(247, 247, 247)');
   assert.equal(palette.scheme,theme);
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-Web.png`),fullPage:true});
   await page.locator('#globalSearchInput').fill('Demo');await page.locator('#globalSearchResults [role=option]').first().waitFor();
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-搜索.png`)});await page.locator('#globalSearchInput').press('Escape');
   for(const [name,title] of [['全车辆库','全车辆库'],['涂装中心','涂装中心'],['赛事中心','赛事中心'],['游戏攻略','游戏攻略'],['蓝图','蓝图推荐'],['相册','玩家相册']]){
    await nav.getByRole('button',{name,exact:true}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.locator('#pageTitle').textContent(),title);
   }
   await page.locator('#logo').click();await page.locator('#homeCars [data-car]').first().click();
   await page.locator('.tune').first().waitFor();
   assert.equal(await page.locator('.vehicle-masthead-copy h2').evaluate(node=>getComputedStyle(node).color),palette.ink,'vehicle title must adapt to the theme');
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-详情.png`),fullPage:true});
   await page.locator('#control').click();await page.locator('#editFromDrawer').click();await page.locator('#nickname[open]').waitFor();
   await page.locator('#nickname [data-close]').first().click();await page.locator('#logo').click();
   for(const width of [1440,1280,1024,768,390,320]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} overflow ${width}`);
    const box=await button.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width,'toggle clipped');
    await nav.locator('[aria-controls="tuningMenu"]').click();await page.locator('#tuningMenu').waitFor();await nav.locator('[aria-controls="tuningMenu"]').press('Escape');
   }
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-Mobile.png`),fullPage:true});
   await page.setViewportSize({width:1440,height:1000});
  }
  assert.deepEqual(errors,[]);
  console.log('Themes passed: keyboard toggle, persistence, shared layout, both palettes, navigation, search, detail, dialogs and 1440–320px layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
