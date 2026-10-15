const {chromium}=require('playwright');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:8765/');
 const nav=page.getByRole('navigation',{name:'主导航',exact:true});
 for(const name of ['全调校库','全车辆库','涂装中心']){
  await nav.getByRole('button',{name,exact:true}).click();
  assert.equal(await page.locator('#pageTitle').textContent(),name);
 }
 for(const [group,name] of [['游玩拓展','赛事中心'],['游玩拓展','蓝图推荐'],['游玩拓展','每周相片'],['社区与创作者','创作者排行榜'],['社区与创作者','游戏攻略']]){
  await nav.getByRole('button',{name:group,exact:true}).click();
  await nav.getByRole('button',{name:new RegExp('^'+name)}).click();
  assert.equal(await page.locator('#pageTitle').textContent(),name);
  assert.equal(await nav.locator('.nav-toggle[aria-expanded="true"]').count(),0);
 }
 await nav.getByRole('button',{name:'个人中心',exact:true}).click();
 await nav.getByRole('button',{name:/^我的车手档案/}).click();
 await page.locator('#drawer.open').waitFor();await page.locator('#closeDrawer').click();
 const play=nav.getByRole('button',{name:'游玩拓展',exact:true});
 await play.focus();await play.press('ArrowDown');
 assert.match(await page.locator(':focus').textContent(),/赛事中心/);
 await page.locator(':focus').press('ArrowDown');
 assert.match(await page.locator(':focus').textContent(),/蓝图推荐/);
 await page.locator(':focus').press('Escape');
 assert.equal(await play.getAttribute('aria-expanded'),'false');
 assert.match(await page.locator(':focus').textContent(),/游玩拓展/);
 await play.click();await nav.getByRole('button',{name:'社区与创作者',exact:true}).click();
 assert.equal(await play.getAttribute('aria-expanded'),'false');
 await page.locator('#pageTitle').click();
 assert.equal(await nav.locator('.nav-toggle[aria-expanded="true"]').count(),0);
 await page.locator('#logo').click();await play.click();
 await page.screenshot({path:path.join(__dirname,'顶部导航-Web.png'),fullPage:false});
 await play.click();
 for(const width of [1024,768,390]){
  await page.setViewportSize({width,height:900});
  for(const group of ['游玩拓展','社区与创作者','个人中心']){
   await nav.getByRole('button',{name:group,exact:true}).click();
   const box=await nav.locator('.nav-dropdown:not([hidden])').boundingBox();
   assert(box.x>=0&&box.x+box.width<=width,`dropdown overflow ${width} ${group}`);
   await nav.getByRole('button',{name:group,exact:true}).click();
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`page overflow ${width}`);
 }
 await play.click();await page.screenshot({path:path.join(__dirname,'顶部导航-Mobile.png'),fullPage:false});
 assert.deepEqual(errors,[]);console.log('Navigation passed: destinations, profile, keyboard, dismissal and 1024/768/390px layout.');
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
