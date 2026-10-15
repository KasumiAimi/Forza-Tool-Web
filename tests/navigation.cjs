const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
 const initialPhoto=await page.locator('#featuredPhoto').getAttribute('src');await page.waitForTimeout(6300);assert.notEqual(await page.locator('#featuredPhoto').getAttribute('src'),initialPhoto,'automatic rotation failed');
 const nav=page.getByRole('navigation',{name:'主导航',exact:true});
 const tuning=nav.locator('[aria-controls="tuningMenu"]'),community=nav.locator('[aria-controls="communityMenu"]');
 assert.equal(await nav.getByRole('button',{name:'个人中心',exact:true}).count(),0);
 for(const name of ['全车辆库','涂装中心','赛事中心','游戏攻略']){
  await nav.getByRole('button',{name,exact:true}).click();assert.equal(await page.locator('#pageTitle').textContent(),name);
 }
 for(const [entry,modeText] of [['online','线上竞速'],['all','漂移/直线加速']]){
  await tuning.click();await nav.locator(`[data-tuning-mode="${entry}"]`).click();
  assert.equal(await page.locator('.web-modebar .tabs .active').textContent(),modeText);
  assert.equal(await nav.locator('.nav-toggle[aria-expanded="true"]').count(),0);
 }
 for(const [name,title] of [['蓝图','蓝图推荐'],['相册','玩家相册'],['攻略','游戏攻略']]){
  await community.click();await nav.locator('#communityMenu').getByRole('button',{name:new RegExp('^'+name)}).click();assert.equal(await page.locator('#pageTitle').textContent(),title);
 }
 await page.locator('#control').click();await page.locator('#drawer.open').waitFor();
 assert.equal(await page.locator('#drawer .poster').count(),0);await page.locator('#closeDrawer').click();
 await tuning.press('ArrowDown');assert.match(await page.locator(':focus').textContent(),/线上推荐/);
 await page.locator(':focus').press('ArrowDown');assert.match(await page.locator(':focus').textContent(),/漂移/);
 await page.locator(':focus').press('Escape');assert.equal(await tuning.getAttribute('aria-expanded'),'false');
 await tuning.click();await community.click();assert.equal(await tuning.getAttribute('aria-expanded'),'false');
 await page.locator('#pageTitle').click();assert.equal(await community.getAttribute('aria-expanded'),'false');
 await page.locator('#logo').click();
 await page.locator('#pausePhotos').click();const first=await page.locator('#featuredPhoto').getAttribute('src');
 await page.locator('#nextPhoto').click();assert.notEqual(await page.locator('#featuredPhoto').getAttribute('src'),first);
 await page.locator('#previousPhoto').click();assert.equal(await page.locator('#featuredPhoto').getAttribute('src'),first);
 await page.locator('[data-photo-index="2"]').click();assert.match(await page.locator('#photoCount').textContent(),/03 \/ 03/);
 await page.locator('#heroHit').click();await page.locator('#photo[open]').waitFor();await page.locator('#photo [data-close]').click();
 await page.locator('.photo-feature [data-submit-photo]').click();
 await page.locator('#submissionFile').setInputFiles(path.join(__dirname,'../assets/home/car-library-bg-v2.jpg'));
 await page.locator('#submissionTitle').fill('测试相片');await page.getByRole('button',{name:'预览上墙',exact:true}).click();
 await page.locator('#photoSubmission').waitFor({state:'hidden'});
 assert.equal(await page.locator('#featuredPhotoTitle').textContent(),'测试相片');assert.match(await page.locator('#photoCount').textContent(),/04 \/ 04/);
 assert.equal(await page.locator('#homeLeague #poster').count(),1);assert.equal(await page.locator('#homeActivity .drawer-update').count(),1);
 await page.locator('[data-photo-index="0"]').click();
 await page.screenshot({path:path.join(__dirname,'首页-摄影主体-Web.png'),fullPage:true});
 for(const width of [1024,768,390]){
  await page.setViewportSize({width,height:900});
  for(const group of [tuning,community]){
   await group.click();const box=await nav.locator('.nav-dropdown:not([hidden])').boundingBox();assert(box.x>=0&&box.x+box.width<=width,`dropdown overflow ${width}`);await group.click();
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`page overflow ${width}`);
 }
 await page.screenshot({path:path.join(__dirname,'首页-摄影主体-Mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('Navigation and homepage passed: mode switching, community destinations, profile, carousel, local submission, activity and responsive layout.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
