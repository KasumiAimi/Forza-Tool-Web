const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const page=await browser.newPage({viewport:{width:1600,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>window.bmCopied=value}}));
await page.goto('http://127.0.0.1:8765/#blueprintRecommendation');
const cards=page.locator('.bm-card'),clear=()=>page.locator('.bm-clear').click();
const chooseSort=async key=>{await page.locator('.bm-sort-dropdown summary').click();await page.locator('[data-bm-sort='+key+']').click();};
assert.equal(await cards.count(),6);assert.equal(await page.locator('[data-bm-type]').count(),6);
assert.equal(await cards.first().locator('.bm-code b').textContent(),'000 000 101');
for(const [type,count]of [['公路',2],['泥地',1],['漂移',1],['拍照',2],['趣味',1]]){
 await page.locator('[data-bm-type="'+type+'"]').click();assert.equal(await cards.count(),count);
}
await clear();await page.locator('[data-bm-venue]').click();assert.equal(await cards.count(),2);
await page.locator('[data-bm-real]').click();assert.equal(await cards.count(),0);assert.equal(await page.locator('.bm-empty').count(),1);await clear();
await page.locator('[data-bm-real]').click();assert.equal(await cards.count(),1);await clear();
await chooseSort('new');assert.equal(await cards.first().getAttribute('data-bm-card'),'bp_demo_006');
await chooseSort('collect');assert.equal(await cards.first().getAttribute('data-bm-card'),'bp_demo_002');
await chooseSort('hot');assert.equal(await page.locator('.bm-sort-label').textContent(),'最热推荐');assert.equal(await page.locator('.bm-sort-dropdown').evaluate(e=>e.open),false);assert(await page.locator('.bm-sort-dropdown summary').evaluate(e=>e===document.activeElement));
await page.locator('[data-bm-advanced]').click();await page.locator('[data-bm-option=player][data-value="单人"]').click();
await page.locator('[data-bm-apply]').click();assert.equal(await cards.count(),2);
assert.match(await page.locator('[data-bm-advanced]').textContent(),/1/);
await page.locator('[data-bm-advanced]').click();await page.locator('[data-bm-option=length][data-value="长途"]').click();
await page.locator('#bmAdvanced').press('Escape');assert.equal(await cards.count(),2);
assert(await page.locator('[data-bm-advanced]').evaluate(e=>e===document.activeElement));
await page.locator('[data-bm-advanced]').click();assert.equal(await page.locator('[data-bm-option=length][aria-pressed=true]').count(),0);
await page.locator('[data-bm-reset-advanced]').click();assert.equal(await cards.count(),6);
await page.locator('[data-bm-option=circuit][data-value="环道"]').click();await page.locator('[data-bm-option=circuit][data-value="环道"]').click();assert.equal(await page.locator('[data-bm-option=circuit][aria-pressed=true]').count(),0);
await page.locator('[data-bm-close]').click();
await page.locator('[data-bm-venue]').click();
await page.locator('[data-bm-advanced]').click();await page.locator('[data-bm-option=circuit][data-value="单程"]').click();await page.locator('[data-bm-apply]').click();
assert.equal(await cards.count(),4,'mini-program advanced circuit condition takes precedence over venue toggle');await clear();
await page.locator('[data-bm-copy="bp_demo_001"]').click();assert.equal(await page.evaluate(()=>window.bmCopied),'000000101');
await page.locator('[data-bm-like="bp_demo_001"]').click();await page.locator('[data-bm-save="bp_demo_001"]').click();
assert.equal(await page.locator('[data-bm-like="bp_demo_001"] span').textContent(),'329');
await page.reload();assert.equal(await page.locator('[data-bm-like="bp_demo_001"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-bm-save="bp_demo_001"]').getAttribute('aria-pressed'),'true');
await page.locator('.bm-cover-link').first().click();assert.match(await page.locator('#bmDetailTitle').textContent(),/山间公路/);
assert.equal(await page.locator('.bm-detail-dialog [data-bm-save]').getAttribute('aria-pressed'),'true');
await page.locator('.bm-detail-dialog').press('Escape');
assert(await page.locator('.bm-cover-link').first().evaluate(e=>e===document.activeElement));
await page.locator('.bm-card').first().locator('.bm-author').click();await page.waitForURL(/tunerProfile/);assert.match(await page.locator('.profile-heading h2').textContent(),/Demo Apex/);
assert.equal(await page.locator('.bm-detail-dialog').count(),0);
await page.goBack();await cards.first().waitFor();
await page.locator('[data-bm-type="全部"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await cards.count(),2);await page.keyboard.press('Home');assert.equal(await cards.count(),6);
const out='C:/Users/14159/.codex/visualizations/2026/09/21/01a0c335-063c-7fd0-b07c-b7556813fbfb/';
for(const theme of ['dark','light']){
if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
for(const width of [1600,1280,1024,850,768,700,390,320]){
await page.setViewportSize({width,height:1100});await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
if([1600,390].includes(width)){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});await page.screenshot({path:out+'蓝图推荐-F实装-'+theme+'-'+width+'.png',fullPage:true});}
await page.locator('[data-bm-advanced]').click();assert(await page.locator('#bmAdvanced').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
await page.locator('#bmAdvanced').press('Escape');
await page.locator('.bm-cover-link').first().click();assert(await page.locator('.bm-detail-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.locator('.bm-detail-dialog').press('Escape');
}
}
await page.evaluate(()=>navigate(''));assert.equal(await page.locator('.blueprint-magazine-active').count(),0);assert.equal(await page.locator('.bm-advanced-dialog').count(),0);
await page.evaluate(()=>navigate('blueprintRecommendation'));assert.equal(await cards.count(),6);
assert.deepEqual(errors,[]);
console.log('Blueprint magazine passed: mini-program types/toggles/advanced precedence, sorting, dialog draft/reset, copy, persisted likes/saves, authors, keyboard and responsive themes.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
