const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#carSelection');await page.locator('#carSearch').waitFor();
  assert.equal(await page.locator('#subcontent .vehicle').count(),9,'direct library link');
  await page.locator('#advanced').click();await page.locator('#vehicleCountry').selectOption('日本');
  assert.equal(await page.locator('#subcontent .vehicle').count(),5,'country filter');
  await page.locator('#carSearch').fill('TOYOTA supra');
  assert.equal(await page.locator('#subcontent .vehicle').count(),1,'multi-token search');
  await page.reload();assert.equal(await page.locator('#carSearch').inputValue(),'TOYOTA supra');
  assert.equal(await page.locator('#vehicleCountry').inputValue(),'日本');
  await page.locator('#subcontent [data-car]').click();
  const detailUrl=page.url();assert.match(detailUrl,/id=demo_2/);
  await page.locator('#collectCar').click();await page.reload();
  assert.equal(await page.locator('.vehicle-masthead-copy h2').textContent(),'GR Supra RZ');
  assert.match(await page.locator('#collectCar').textContent(),/已收藏/);
  await page.locator('#backToVehicles').click();
  assert.equal(await page.locator('#carSearch').inputValue(),'TOYOTA supra');
  assert.equal(await page.locator('#subcontent .vehicle').count(),1,'return retains filters');
  await page.locator('#resetVehicleFilters').click();
  await page.locator('#vehicleSort').selectOption('level');
  assert.equal(await page.locator('#subcontent .vehicle').first().getAttribute('data-car'),'demo_6');
  if(!await page.locator('#savedOnly').isVisible())await page.locator('#advanced').click();await page.locator('#savedOnly').check();
  assert.equal(await page.locator('#subcontent .vehicle').count(),1,'saved filter');
  await page.locator('#logo').click();await page.locator('.favorite-link').click();
  await page.locator('#carSearch').fill('supra');await page.reload();
  assert.equal(await page.locator('#subcontent .vehicle').count(),1,'saved search after reload');
  await page.locator('[data-remove-saved]').click();
  assert.equal(await page.locator('#subcontent .vehicle').count(),0);await page.reload();
  assert.equal(await page.locator('#subcontent .vehicle').count(),0,'unsaved persisted');
  await page.goto(base+'#carRecommendation?mode=all&scenario='+encodeURIComponent('漂移')+'&q=Porsche');
  assert.equal(await page.locator('#subcontent .vehicle').count(),1);
  assert.equal(await page.locator('#subcontent .vehicle .tags').textContent(),'漂移','card tags reflect matching tunes');
  await page.locator('#subcontent .vehicle').click();assert.equal(await page.locator('.tune').count(),1);
  await page.locator('#showAll').click();await page.reload();assert.equal(await page.locator('.tune').count(),2,'all tunes restored');
  await page.goBack();assert.equal(await page.locator('#tuningSearch').inputValue(),'Porsche');
  assert.equal(await page.locator('[data-mode="all"]').getAttribute('class'),'active');
  await page.goForward();assert.equal(await page.locator('.tune').count(),2,'forward retains detail');
  const shared=await context.newPage();await shared.goto(detailUrl);
  assert.equal(await shared.locator('.vehicle-masthead-copy h2').textContent(),'GR Supra RZ','shared detail link');await shared.close();
  await page.goto(base+'#carDetail?id=missing');await page.locator('#carSearch').waitFor();
  assert.equal(await page.locator('#pageTitle').textContent(),'全车辆库','unknown car fallback');
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+'#carSelection?country='+encodeURIComponent('日本'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} library overflow ${width}`);
    await page.locator('#carSearch').fill('no such vehicle');
    await page.locator('#resetVehicleFilters').first().click();assert.equal(await page.locator('#subcontent .vehicle').count(),9);
    await page.goto(base+'#carRecommendation?q=BMW');await page.locator('#subcontent .vehicle').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} detail overflow ${width}`);
   }
  }
  const damaged=await browser.newContext();await damaged.addInitScript(()=>localStorage.setItem('horizon_web_v2_collected','not-json'));
  const damagedPage=await damaged.newPage();await damagedPage.goto(base+'#collection');
  assert.equal(await damagedPage.getByRole('heading',{name:'暂无收藏车辆'}).count(),1,'damaged storage must not break startup');
  await damaged.close();assert.deepEqual(errors,[]);await context.close();
  console.log('Vehicles passed: search, sorting, advanced filters, saved management, share links, reload/back/forward, damaged storage and both responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
