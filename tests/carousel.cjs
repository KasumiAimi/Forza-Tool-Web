const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
  await page.locator('#pausePhotos').click();
  const feature=page.locator('.photo-feature'),count=()=>page.locator('#photoCount').textContent();
  async function drag(distance,selector=feature){
   const box=await selector.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+distance,y,{steps:10});await page.mouse.up();
  }
  for(const theme of ['dark','light']){
   if(theme==='light')await page.locator('#themeToggle').click();
   await page.locator('[data-photo-index="0"]').click();
   await drag(-160);assert.match(await count(),/02 \/ 03/,'left swipe');
   await drag(160);assert.match(await count(),/01 \/ 03/,'right swipe');
   await drag(160);assert.match(await count(),/03 \/ 03/,'wrap to last');
   await drag(18);assert.match(await count(),/03 \/ 03/,'short drag must not switch');
   assert.equal(await page.locator('dialog[open]').count(),0);
   await drag(-160,page.locator('#heroHit'));assert.match(await count(),/01 \/ 03/);
   assert.equal(await page.locator('#photo[open]').count(),0,'drag must not open photo');
   await page.locator('#heroHit').click();await page.locator('#photo[open]').waitFor();
   await page.locator('#photo [data-close]').click();
   const box=await feature.boundingBox();
   await page.mouse.move(box.x+box.width-30,box.y+box.height/2);await page.mouse.down();
   await page.mouse.move(box.x+box.width+160,box.y+box.height/2,{steps:10});await page.mouse.up();
   assert.match(await count(),/03 \/ 03/,'release outside should finish');
   assert.equal(await feature.getAttribute('class').then(c=>c.includes('is-dragging')),false);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await drag(-160);
  assert.match(await count(),/01 \/ 03/);
  assert.equal(await page.locator('#featuredPhoto').evaluate(n=>getComputedStyle(n).transform),'none');
  // Use real touch input so pointer capture and browser scroll arbitration are exercised.
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const mobile=await context.newPage();mobile.on('pageerror',error=>errors.push(error.message));
  await mobile.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');await mobile.locator('#pausePhotos').click();
  await mobile.locator('.photo-feature').scrollIntoViewIfNeeded();
  const box=await mobile.locator('.photo-feature').boundingBox(),x=box.x+box.width*.75,y=box.y+box.height*.45;
  const cdp=await context.newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*18,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.match(await mobile.locator('#photoCount').textContent(),/02 \/ 03/,'touch swipe');
  assert.equal(await mobile.locator('dialog[open]').count(),0);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await context.close();assert.deepEqual(errors,[]);
  console.log('Carousel drag passed: both directions, wrap, threshold, release outside, click suppression, themes, reduced motion and touch.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
