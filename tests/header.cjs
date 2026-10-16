const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {openHeader,headerRoute}=require('./header-helpers.cjs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
 assert.equal(await page.locator('#primaryNavigation>[data-route=""]').count(),0);
 assert.equal(await page.locator('#communityMenu>[data-route]').count(),3);
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
  for(const width of [1920,1440,1280,1100,900,699,390,320]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const collapsed=await page.locator('#navigationToggle').isVisible();
   if(width>=1440)assert.equal(collapsed,false,'wide header should show horizontal navigation');
   if(width<=900)assert.equal(collapsed,true,'small header should collapse');
   const boxes=await Promise.all(['#logo','#globalSearch','#themeToggle','#control'].map(s=>page.locator(s).boundingBox()));
   for(const box of boxes){assert(box&&box.x>=0&&box.x+box.width<=width,`${theme} top control clipped ${width}`);assert(Math.abs(box.y+box.height/2-boxes[0].y-boxes[0].height/2)<2,'search and controls must occupy the same top row');}
   assert.equal(await page.evaluate(()=>document.querySelector('.site-header').getBoundingClientRect().height<=73),true,'header must not wrap into a second line');
   await openHeader(page);
   if(collapsed){
    const first=await page.locator('#primaryNavigation .nav-toggle').first().boundingBox(),second=await page.locator('#primaryNavigation>[data-route]').first().boundingBox();
    assert(second.y>=first.y+first.height-1,'collapsed destinations must be vertical');
   }
   await page.locator('[aria-controls="communityMenu"]').click();
   const panel=await page.locator('#communityMenu').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=width,'community menu clipped');
   await page.locator('[aria-controls="communityMenu"]').press('ArrowDown');
   assert.match(await page.locator(':focus').textContent(),/蓝图推荐/);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#communityMenu').isVisible(),false);
   if(collapsed){await page.keyboard.press('Escape');assert.equal(await page.locator('#primaryNavigation').isVisible(),false);assert.equal(await page.locator('#navigationToggle').evaluate(n=>n===document.activeElement),true);}
   await headerRoute(page,'weeklyPhotos');assert.equal(await page.locator('#pageTitle').textContent(),'玩家相册');
   if(collapsed)assert.equal(await page.locator('#primaryNavigation').isVisible(),false,'selection must close the navigation');
   await page.locator('#logo').click();assert.equal(await page.locator('#logo').getAttribute('aria-current'),'page');
   await page.locator('#globalSearchInput').fill('BMW');await page.locator('#globalSearchResults [role=option]').waitFor();
   const search=await page.locator('#globalSearchPanel').boundingBox();assert(search.x>=0&&search.x+search.width<=width,'search panel clipped');
   await page.locator('#globalSearchInput').press('Escape');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} header overflow ${width}`);
  }
 }
 await page.setViewportSize({width:699,height:900});await openHeader(page);await page.locator('#globalSearchInput').focus();assert.equal(await page.locator('#navigationToggle').getAttribute('aria-expanded'),'false','search focus closes navigation');
 await page.locator('#globalSearchInput').press('Escape');await openHeader(page);await page.locator('.site-footer>small').click();assert.equal(await page.locator('#navigationToggle').getAttribute('aria-expanded'),'false','outside click closes navigation');
 await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.locator('#primaryNavigation').isVisible(),true,'expanding window restores full navigation');
 assert.deepEqual(errors,[]);console.log('Header passed: merged home entry, community dropdown, fit-based collapse, single-row search, vertical menu, resize, keyboard, dismissal, destinations and both responsive themes.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
