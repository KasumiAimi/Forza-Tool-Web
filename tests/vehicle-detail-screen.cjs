const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#carDetail?view=garage&id=garage_demo_9&from=carRecommendation&tier=META');
  await page.locator('.vehicle-detail-screen').waitFor();
  assert.equal(await page.locator('.vehicle-detail-screen .masthead-car').count(),0,'the car is a foreground object outside the screen');
  const placement=await page.evaluate(()=>({car:document.querySelector('.vehicle-stage-car').getBoundingClientRect().bottom,screen:document.querySelector('.vehicle-detail-screen').getBoundingClientRect().bottom}));
  assert.ok(placement.car>placement.screen,'the car stands closer on the floor than the screen');
  assert.match(await page.locator('.masthead-car img').getAttribute('src'),/FH6_Ferrari_F8_Tributo/);
  await page.locator('#vehicleLiveriesTab').click();
  assert.equal(await page.locator('#vehicleTunesPanel').isVisible(),false);
  assert.equal(await page.locator('#vehicleLiveriesPanel').isVisible(),true);
  assert.equal(await page.locator('.vehicle-livery-card').count(),6,'six mock livery works are available');
  assert.match(await page.locator('#vehicleLiveriesPanel').innerText(),/布局演示/);
  await page.locator('#collectCar').click();
  assert.equal(await page.locator('#vehicleLiveriesTab').getAttribute('aria-selected'),'true','saving keeps the selected panel');
  await page.locator('#vehicleLiveriesTab').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#vehicleTunesTab').getAttribute('aria-selected'),'true','keyboard switches panels');
  assert.equal(await page.locator('.tune').count(),1);
  await page.locator('#showAll').click();
  assert.equal(await page.locator('.tune').count(),2,'all tuning toggle keeps its existing behavior');
  await page.locator('.like').first().click();
  assert.equal(await page.locator('.like.liked').count(),1,'likes still work after the layout changes');
  for(const theme of ['dark','light']){
   await page.evaluate(value=>document.documentElement.setAttribute('data-theme',value),theme);
   for(const width of [1600,1024,850,700,390,320]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} detail fits ${width}`);
   }
  }
  await page.goto(base+'#carDetail?view=garage&id=library_demo_3&from=carSelection');
  assert.equal(await page.locator('#vehicleTunesTab').getAttribute('aria-selected'),'true','opening another car starts on tuning');
  assert.equal(await page.locator('.tune').count(),0,'a vehicle without tuning has no invented entries');
  await page.locator('#backToVehicles').click();
  assert.match(page.url(),/#carSelection\?view=garage/);
  assert.equal(await page.locator('#subpage').evaluate(node=>node.classList.contains('vehicle-screen-active')),false,'detail layout is removed on return');
  assert.deepEqual(errors,[]);
  console.log('Vehicle display passed: direct links, tuning/livery tabs, keyboard, collection, all tuning, likes, empty states, return and responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
