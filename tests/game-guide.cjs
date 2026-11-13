const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/#gameGuide');
 assert.equal(await page.locator('.gg-guide').count(),8);
 await page.locator('.gg-entry[data-gg-cat="tune"]').click();
 assert.equal(await page.locator('.gg-guide').count(),2);
 await page.locator('[data-gg-level="进阶"]').click();
 assert.equal(await page.locator('.gg-guide').count(),1);
 await page.locator('[data-gg-open]').click();
 assert.equal(await page.locator('.gg-chapter').count(),3);
 await page.locator('[data-gg-back]').click();
 assert.equal(await page.locator('.gg-guide').count(),1);
 await page.locator('#ggSearch').fill('不存在');
 await page.locator('[data-gg-clear]').first().click();
 assert.equal(await page.locator('.gg-guide').count(),8);
 await page.locator('#ggSearch').fill('刹车');
 assert.equal(await page.locator('.gg-guide').count(),1);
 await page.locator('#ggSearch').fill('');
 const out='C:/Users/14159/.codex/visualizations/2026/09/21/01a0c335-063c-7fd0-b07c-b7556813fbfb/';
 for(const theme of ['dark','light']){
 if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
 for(const width of [1440,850,390,320]){
 await page.setViewportSize({width,height:1050});
 await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'list overflow '+width);
 if(width===1440||width===390)await page.screenshot({path:out+'游戏攻略-'+theme+'-'+width+'.png',fullPage:true});
 await page.locator('[data-gg-open]').first().click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'article overflow '+width);
 if(width===1440)await page.screenshot({path:out+'游戏攻略-正文-'+theme+'.png',fullPage:true});
 await page.locator('[data-gg-back]').click();
 }
 }
 await page.evaluate(()=>navigate(''));
 assert.equal(await page.locator('.game-guide-active').count(),0);
 await page.evaluate(()=>navigate('gameGuide'));
 assert.equal(await page.locator('.gg-guide').count(),8);
 await page.locator('[data-gg-open]').first().click();
 await page.locator('.gg-related [data-route="carSelection"]').click();
 assert.equal(await page.locator('.game-guide-active').count(),0);
 assert.deepEqual(errors,[]);
 console.log('Game guide: search, categories, reading, navigation, themes and responsive layouts passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
