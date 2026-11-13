const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';

(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#carRecommendation?view=garage');
  await page.locator('.garage-page').waitFor();
  assert.equal(await page.locator('.garage-car').count(),29,'20 garage-only vehicles augment the original nine');
  assert.equal(await page.locator('.garage-grid').first().getAttribute('data-columns'),'4');
  assert.equal(await page.locator('.garage-tier[data-tier="META"]').evaluate(node=>getComputedStyle(node).getPropertyValue('--tier-color').trim()),'#cf4f59','META uses the red wall accent');
  for(const [tier,color] of Object.entries({T1:'#a073d1',T2:'#5d9edf',T3:'#68b77c'})){
   assert.equal(await page.locator(`.garage-tier[data-tier="${tier}"]`).evaluate(node=>getComputedStyle(node).getPropertyValue('--tier-color').trim()),color,`${tier} wall accent`);
  }
  assert.equal(await page.locator('.garage-row-wallmark').count(),0,'tier lettering is painted into a wall texture');
  assert.equal(await page.locator('.garage-tier-count').count(),4,'only the first row of each tier shows a dynamic count');
  assert.equal(await page.locator('.garage-tier[data-tier="META"] .garage-tier-count').innerText(),'07 辆');
  assert.equal(await page.locator('.garage-ceiling-light').count(),29,'each vehicle has its own ceiling light');
  assert.match(await page.locator('.garage-row').first().evaluate(node=>getComputedStyle(node).backgroundImage),/garage-wall-meta\.png.*garage-level-v3\.png/,'paint overlay aligns with the recessed garage backdrop');
  assert.equal(await page.evaluate(async()=>Promise.all(['overpower','meta','t1','t2','t3','玩具','常规'].map(tier=>fetch(`assets/tuning/garage-wall-${tier}.png`).then(response=>response.ok))).then(results=>results.every(Boolean))),true,'every tier has an image-backed wall label');
  assert.deepEqual(await page.locator('.garage-tier').evaluateAll(sections=>sections.map(section=>section.querySelectorAll('.garage-car').length)),[7,8,8,6],'every online tier has two rows in both column layouts');
  assert.equal(await page.locator('.garage-car-hud').count(),0,'individual tune boxes are removed');
  assert.equal(await page.locator('.garage-car-title').count(),29,'every name sits above its car');
  assert.ok(await page.locator('.garage-car-title').first().evaluate(node=>getComputedStyle(node).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(node).textShadow!=='none'&&getComputedStyle(node.querySelector('strong')).fontStyle==='italic'),'name is floating italic text with a glow');
  assert.ok(await page.locator('.garage-car-meta').first().evaluate(node=>getComputedStyle(node).fontStyle==='italic'&&parseFloat(getComputedStyle(node).fontSize)>12),'bottom text is larger and italic');
  assert.ok(await page.locator('.garage-car-meta').first().evaluate(node=>parseFloat(getComputedStyle(node.querySelector('.garage-class')).fontSize)>=1.29*parseFloat(getComputedStyle(node).fontSize)),'class marker is 30 percent larger than tune text');
  assert.equal(await page.locator('.garage-car-stage img').evaluateAll(async images=>(await Promise.all(images.map(image=>fetch(image.src).then(response=>response.ok)))).every(Boolean)),true,'official cutouts load');
  assert.match(await page.locator('.garage-car-stage img').first().getAttribute('src'),/assets\/official-cars\/FH6_/);
  await page.locator('[data-garage-columns="5"]').click();
  assert.match(page.url(),/cols=5/);
  await page.reload();
  assert.equal(await page.locator('.garage-grid').first().getAttribute('data-columns'),'5','column choice survives reload');
  await page.locator('#garageSearch').fill('BMW');
  assert.ok(await page.locator('.garage-car').count()>0,'search works');
  assert.equal(await page.locator('.garage-tier').first().evaluate(section=>Number.parseInt(section.querySelector('.garage-tier-count').textContent,10)),await page.locator('.garage-tier').first().locator('.garage-car').count(),'tier count follows the current filters');
  assert.match(page.url(),/q=BMW/);
  await page.locator('#garageClear').click();
  await page.locator('[data-garage-filter="level"]').selectOption('S1');
  assert.ok(await page.locator('.garage-car').count()>2,'vehicle class filters matched tuning');
  await page.locator('[data-garage-filter="level"]').selectOption('');
  await page.locator('#openBrand').click();
  await page.locator('#brandList [data-brand="Porsche"]').click();
  assert.ok(await page.locator('.garage-car').count()>0,'brand filter works');
  await page.locator('#garageClear').click();
  await page.locator('#garageSort').selectOption('name');
  assert.match(page.url(),/sort=name/,'sort choice is reflected in shareable URL');
  await page.reload();
  assert.equal(await page.locator('#garageSort').inputValue(),'name','sort choice survives reload');
  await page.locator('#garageSort').selectOption('default');
  await page.locator('[data-mode="all"]').click();
  assert.equal(await page.locator('.garage-car').count(),29,'alternate tuning mode works');
  await page.locator('[data-garage-filter="scenario"]').selectOption('漂移');
  assert.ok(await page.locator('.garage-car').count()>0,'scenario filter works');
  await page.locator('[data-mode="online"]').click();
  await page.locator('[data-garage-filter="driveType"]').selectOption('四驱');
  assert.ok(await page.locator('.garage-car').count()>3,'drive filter works');
  await page.locator('#garageClear').click();
  await page.locator('.garage-car').first().click();
  assert.match(page.url(),/#carDetail/);
  assert.match(await page.locator('.masthead-car img').getAttribute('src'),/assets\/official-cars\/FH6_/,'detail retains official image');
  await page.locator('#collectCar').click();
  await page.locator('#showAll').click();
  await page.locator('#backToVehicles').click();
  assert.match(page.url(),/view=garage/,'return retains garage view');
  await page.locator('[data-garage-car="garage_demo_9"]').click();
  assert.match(page.url(),/id=garage_demo_9/,'new demo detail has a shareable URL');
  assert.match(await page.locator('.masthead-car img').getAttribute('src'),/assets\/official-cars\/FH6_Ferrari_F8_Tributo/,'new demo detail uses its official image');
  await page.reload();
  assert.match(await page.locator('#subcontent').innerText(),/F8 Tributo/,'new demo detail survives reload');
  await page.locator('#backToVehicles').click();
  assert.equal(await page.locator('[data-garage-view]').count(),0,'layout switch has been removed');
  await page.goto(base+'#carRecommendation?view=classic&q=BMW');
  await page.locator('.garage-page').waitFor();
  assert.match(page.url(),/view=garage/,'old classic links normalize to garage');
  assert.equal(await page.locator('#garageSearch').inputValue(),'BMW','legacy links retain search');
  await page.locator('#garageClear').click();
  await page.getByRole('button',{name:'5 辆',exact:true}).click();
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.waitForFunction(expected=>document.querySelector('.garage-row')?.style.getPropertyValue('--row-columns')===String(expected),width<=520?1:width<=800?2:width<=1100?3:width<=1320?4:5);
    assert.match(await page.locator('.garage-row').first().evaluate(node=>getComputedStyle(node).backgroundImage),new RegExp(`garage-wall-meta${width<=520?'-mobile':width<=1100?'-mid':''}\\.png`),`${theme} wall art ${width}`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} overflow ${width}`);
   }
  }
  assert.deepEqual(errors,[]);
  console.log('Garage passed: official images, tiers, 4/5 density, search, filters, sort state, detail, return, legacy-link migration and both responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
