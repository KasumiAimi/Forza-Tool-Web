const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const page=await browser.newPage({viewport:{width:1600,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/#ranking');
assert.equal(await page.locator('.rk-row').count(),8);
assert.equal(await page.locator('[data-rk-category]').count(),5);assert.equal(await page.locator('[data-rk-period]').count(),3);
const getScores=()=>page.locator('.rk-row').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.rkLikes)));
const initial=await getScores();assert.deepEqual(initial,[...initial].sort((a,b)=>b-a));
await page.locator('[data-rk-category=road]').click();assert.match(await page.locator('.rk-row').first().textContent(),/Demo Apex/);
await page.locator('[data-rk-category=rally]').click();assert.match(await page.locator('.rk-row').first().textContent(),/Demo Driver/);
await page.locator('[data-rk-category=blueprint]').click();assert.match(await page.locator('.rk-row').first().textContent(),/Demo Horizon/);
await page.locator('[data-rk-category=visual]').click();assert.match(await page.locator('.rk-row').first().textContent(),/Mika Studio/);
const tied=await page.locator('.rk-row[data-rk-likes="180"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.rkRank));assert.deepEqual(tied,['3','3']);
await page.locator('[data-rk-period=month]').click();const month=await getScores();assert(month[0]>500);
await page.locator('[data-rk-period=total]').click();assert((await getScores())[0]>month[0]);assert.equal(await page.locator('.rk-date').textContent(),'累计获赞');
await page.locator('[data-rk-category=all]').click();await page.locator('[data-rk-period=week]').click();
assert.deepEqual(await getScores(),initial);
const firstFollow=page.locator('[data-rk-follow="creator_0"]');
await firstFollow.focus();await firstFollow.press('Enter');assert.equal(await firstFollow.getAttribute('aria-pressed'),'true');
await page.reload();assert.equal(await firstFollow.getAttribute('aria-pressed'),'true');
await page.locator('.rk-row[data-rk-id="creator_0"] .rk-author').click();
await page.waitForURL(/tunerProfile/);assert.match(await page.locator('#follow').textContent(),/已关注/);
await page.locator('#follow').click();await page.goBack();await page.locator('.rk-row').first().waitFor();assert.equal(await firstFollow.getAttribute('aria-pressed'),'false');
const extra=page.locator('[data-rk-follow="ranking_creator_4"]');await extra.click();await page.reload();assert.equal(await extra.getAttribute('aria-pressed'),'true');
await page.locator('.rk-row[data-rk-id="ranking_creator_4"] .rk-author').click();assert.match(await page.locator('.profile-heading h2').textContent(),/山海行者/);assert.equal(await page.locator('.cp-empty').count(),4);
await page.goBack();await page.locator('.rk-row').first().waitFor();
await page.locator('[data-rk-category=all]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-rk-category=road]').getAttribute('aria-pressed'),'true');
await page.keyboard.press('End');assert.equal(await page.locator('[data-rk-category=visual]').getAttribute('aria-pressed'),'true');
await page.keyboard.press('Home');assert.equal(await page.locator('[data-rk-category=all]').getAttribute('aria-pressed'),'true');
await page.setViewportSize({width:1440,height:850});
await page.waitForTimeout(150);
const fixedBefore=await page.locator('.rk-categories').boundingBox(),rows=page.locator('.rk-rows');
assert(await rows.evaluate(e=>e.scrollHeight>e.clientHeight),'ranking list scrolls inside screen');
await page.locator('.rk-heading').hover();await page.mouse.wheel(0,450);
await page.waitForFunction(()=>document.querySelector('.rk-rows').scrollTop>100);
assert.deepEqual(await page.locator('.rk-categories').boundingBox(),fixedBefore);
assert.equal(await page.evaluate(()=>scrollY),0);
await rows.evaluate(e=>e.scrollTop=e.scrollHeight);
assert.equal(await page.evaluate(()=>scrollY),0);
await rows.focus();await page.keyboard.press('Home');await page.waitForTimeout(100);
assert(await rows.evaluate(e=>e.scrollTop<5));
const out='C:/Users/14159/.codex/visualizations/2026/09/21/01a0c335-063c-7fd0-b07c-b7556813fbfb/';
for(const theme of ['dark','light']){
if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
for(const width of [1600,1280,1024,850,768,700,390,320]){
await page.setViewportSize({width,height:1200});await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
assert(await page.locator('[data-rk-follow="creator_0"]').isVisible());
assert(await page.locator('.rk-housing').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1),'display fits viewport');
assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),true,'page does not scroll');
if([1600,390].includes(width)){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});await page.screenshot({path:out+'排行榜-A方案实装-'+theme+'-'+width+'.png',fullPage:true});}
}
}
await page.setViewportSize({width:700,height:390});await page.waitForTimeout(150);
assert(await page.locator('.rk-rows').evaluate(e=>e.clientHeight>40),'short viewport still has usable list space');
await page.evaluate(()=>navigate(''));assert.equal(await page.locator('.ranking-screen-active').count(),0);assert.equal(await page.locator('body.ranking-viewport').count(),0);assert(await page.locator('.site-footer').isVisible());
await page.evaluate(()=>navigate('ranking'));assert.equal(await page.locator('.rk-row').count(),8);
assert.deepEqual(errors,[]);
console.log('Ranking screen passed: five categories, three periods, descending/tied ranks, shared/persisted follows, creator destinations, keyboard, navigation cleanup and both responsive themes.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
