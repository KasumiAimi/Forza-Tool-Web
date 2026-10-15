const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
  const input=page.getByRole('combobox',{name:'搜索车辆或调校师'}),panel=page.locator('#globalSearchPanel'),options=page.locator('#globalSearchResults [role="option"]');
  await input.fill('bMw m4');assert.equal(await options.count(),1);assert.match(await options.textContent(),/M4 Competition/);await input.press('Enter');
  assert.equal(await page.locator('.vehicle-masthead-copy h2').textContent(),'M4 Competition');assert.equal(await page.locator('.tune').count(),2);assert.equal(await panel.isVisible(),false);
  await input.fill('Demo');assert.equal(await options.count(),4);assert.match(await page.locator('#globalSearchStatus').textContent(),/4 位调校师/);
  await input.press('ArrowUp');assert.equal(await input.getAttribute('aria-activedescendant'),'globalSearchOption-3');await input.press('ArrowDown');assert.equal(await input.getAttribute('aria-activedescendant'),'globalSearchOption-0');
  await input.press('Escape');assert.equal(await panel.isVisible(),false);assert.equal(await input.inputValue(),'Demo');
  await input.fill('  DEMO apex  ');assert.equal(await options.count(),1);await options.click();assert.equal(await page.locator('.profile-heading h2').textContent(),'Demo Apex');
  await input.fill('Demo Drift');assert.equal(await options.count(),1);await input.press('ArrowDown');await input.press('Enter');assert.equal(await page.locator('.profile-heading h2').textContent(),'Demo Drift');
  await input.fill('ae86');await options.click();assert.equal(await page.locator('.vehicle-masthead-copy h2').textContent(),'AE86');
  await input.fill('<script>bad</script>');assert.equal(await options.count(),0);assert.match(await page.locator('#globalSearchStatus').textContent(),/没有找到匹配结果/);
  await page.locator('#clearGlobalSearch').click();assert.equal(await input.inputValue(),'');assert.match(await page.locator('#globalSearchStatus').textContent(),/输入车辆名/);
  await input.fill('BMW');await page.locator('#pageTitle').click();assert.equal(await panel.isVisible(),false);
  await page.keyboard.press('Control+k');assert.equal(await input.evaluate(node=>node===document.activeElement),true);await input.fill('Apex');
  await input.press('Tab');await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),false,'Escape from results must dismiss');
  await page.locator('#logo').click();
  for(const width of [1440,1280,1024,768,390,320]){
   await page.setViewportSize({width,height:1000});await input.fill('Demo');
   const box=await panel.boundingBox();assert(box.x>=0&&box.x+box.width<=width,`search panel overflow ${width}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`page overflow ${width}`);
   await input.press('Escape');
  }
  await page.setViewportSize({width:1440,height:1000});await input.fill('Apex');await page.screenshot({path:path.join(__dirname,'全局搜索-Web.png'),fullPage:false});
  await page.setViewportSize({width:390,height:844});await input.fill('BMW');await page.screenshot({path:path.join(__dirname,'全局搜索-Mobile.png'),fullPage:false});
  assert.deepEqual(errors,[]);console.log('Search passed: vehicle and tuner matches, deduplication, destinations, all tunes, keyboard, empty/no results, dismissal, shortcut and 1440–320px layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
