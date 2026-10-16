const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
  for(const theme of ['dark','light']){
   if(theme==='light')await page.locator('#themeToggle').click();
   const card=page.locator('#homeCars [data-car="demo_0"]');
   await card.scrollIntoViewIfNeeded();
   const originY=await page.evaluate(()=>scrollY);
   await card.click();
   await page.locator('.route-car-flight').waitFor();
   assert.match(await page.locator('.vehicle-masthead h2').textContent(),/190E/);
   assert.equal(await page.locator('.route-car-flight').getAttribute('aria-hidden'),'true');
   assert.equal(await page.locator('.route-car-flight').evaluate(n=>getComputedStyle(n).pointerEvents),'none');
   // Freeze actual animations halfway through for a reviewable screenshot.
   await page.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=190;}));
   await page.screenshot({path:`tests/车辆过渡-${theme}.png`,fullPage:true});
   await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
   await page.locator('.route-car-flight').waitFor({state:'detached'});
   assert.equal(await page.locator('.masthead-car img').evaluate(n=>getComputedStyle(n).visibility),'visible');
   await page.goBack();await page.locator('#home').waitFor({state:'visible'});
   await page.waitForFunction(y=>Math.abs(scrollY-y)<2,originY);
   assert.equal(await page.locator('.route-car-flight').count(),0);
   await card.click();await page.locator('.route-car-flight').waitFor();
   // Returning immediately must cancel the old flight and reveal all imagery.
   await page.goBack();await page.locator('#home').waitFor({state:'visible'});
   assert.equal(await page.locator('.route-car-flight').count(),0);
   assert.equal(await card.locator('img').evaluate(n=>getComputedStyle(n).visibility),'visible');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#homeCars [data-car="demo_0"]').click();
  assert.equal(await page.locator('.route-car-flight').count(),0);
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest('#subpage')).length),0);
  await page.locator('#collectCar').click();assert.match(await page.locator('#collectCar').getAttribute('aria-label'),/取消收藏/);
  await page.locator('#logo').click();await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#homeCars [data-car="demo_0"]').focus();
  await page.locator('#homeCars [data-car="demo_0"]').press('Enter');
  await page.locator('.route-car-flight').waitFor({state:'detached'});
  assert.match(await page.locator('.vehicle-masthead h2').textContent(),/190E/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  console.log('Page motion passed: shared car image, themes, cleanup, immediate back, scroll restoration, keyboard, mobile and reduced motion.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
