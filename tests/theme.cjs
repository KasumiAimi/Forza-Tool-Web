const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {openHeader,headerRoute}=require('./header-helpers.cjs');
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
    await headerRoute(page,{'全车辆库':'carSelection','涂装中心':'liveryCenter','赛事中心':'leagueStandings','游戏攻略':'gameGuide','蓝图':'blueprintRecommendation','相册':'weeklyPhotos'}[name]);
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.locator('#pageTitle').textContent(),title);
   }
   await page.locator('#logo').click();await page.locator('#homeCars [data-car]').first().click();
   await page.locator('.tune').first().waitFor();
   assert.equal(await page.locator('.vehicle-masthead-copy h2').evaluate(node=>getComputedStyle(node).color),palette.ink,'vehicle title must adapt to the theme');
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-详情.png`),fullPage:true});
   await page.locator('#control').click();await page.locator('#editFromDrawer').click();await page.locator('#nickname[open]').waitFor();
   await page.locator('#nickname [data-close]').first().click();await page.locator('#logo').click();
   for(const width of [1920,1440,1280,1200,1024,900,768,701,700,699,540,390,320]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} overflow ${width}`);
    const cards=page.locator('#homeCars .reference-car-card:visible');
    const minimumColumns=width>1100?4:width>=1024?5:width>=900?4:width>=699?3:2;
    const first=await cards.first().boundingBox();
    const boxes=await cards.evaluateAll(nodes=>nodes.map(node=>({y:node.getBoundingClientRect().y})));
    const columns=boxes.filter(box=>Math.abs(box.y-first.y)<1).length;
    assert(columns>=minimumColumns,`${theme} at least ${minimumColumns} cards must fit at ${width}px`);
    for(let index=1;index<columns;index++){
     const previous=await cards.nth(index-1).boundingBox(),cardBox=await cards.nth(index).boundingBox();
     assert(Math.abs(cardBox.y-first.y)<1&&cardBox.x>=previous.x+previous.width,`${theme} ${columns} cards must fit in one row at ${width}px`);
    }
    assert(new Set(boxes.map(box=>Math.round(box.y))).size<=(width>1100?2:1),`${theme} recommendation row limit ${width}px`);
    const personal=await page.locator('.reference-personal-section').boundingBox(),recommend=await page.locator('.discover-section').boundingBox();
    if(width>1100){
     const photo=await page.locator('.photo-feature').boundingBox(),highlights=await page.locator('.reference-highlights').boundingBox();
     assert(Math.abs(personal.x-highlights.x)<1&&Math.abs(personal.width-highlights.width)<1,'personal center must share the upper right column');
     assert(Math.abs(recommend.x-photo.x)<1&&Math.abs(recommend.width-photo.width)<1,'recommendations must share the photo column');
     const personalHeading=await page.locator('#personalSectionTitle').boundingBox(),recommendHeading=await page.locator('.discover-section h2').boundingBox();
     assert(Math.abs(personalHeading.y-recommendHeading.y)<1,'lower section headings must align');
     const panel=await page.locator('.reference-profile-rail').boundingBox(),grid=await page.locator('#homeCars').boundingBox();
     assert(Math.abs(panel.y-grid.y)<1,'lower content areas must start together');
    }else assert(personal.y+personal.height<=recommend.y,'personal center must precede recommendations on narrow screens');
    if(width<=1100){
     const photo=await page.locator('.photo-feature').boundingBox();
     const season=await page.locator('#homeSeason').boundingBox();
     const league=await page.locator('#homeLeague').boundingBox();
     assert(Math.abs(season.y-league.y)<1,`${theme} season and league must share a row at ${width}px`);
     assert(season.x+season.width<=league.x,`${theme} cards overlap at ${width}px`);
     assert(photo.y+photo.height<=season.y,`${theme} photo must be above both cards at ${width}px`);
    }
    const box=await button.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width,'toggle clipped');
    await openHeader(page);await nav.locator('[aria-controls="tuningMenu"]').click();await page.locator('#tuningMenu').waitFor();await nav.locator('[aria-controls="tuningMenu"]').press('Escape');if(await page.locator('#navigationToggle').getAttribute('aria-expanded')==='true')await page.locator('#navigationToggle').click();
   }
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(__dirname,`主题-${theme}-Mobile.png`),fullPage:true});
   await page.setViewportSize({width:1440,height:1000});
  }
  assert.deepEqual(errors,[]);
  console.log('Themes passed: keyboard toggle, persistence, shared layout, both palettes, navigation, search, detail, dialogs and 1440–320px layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
