const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8765/#weeklyPhotos');
assert.equal(await p.locator('#subpage > .sub-header .wa-submit').count(),1);assert.equal(await p.locator('.wa-kicker').count(),0);await p.locator('#subpage > .sub-header .wa-submit').click();assert(await p.locator('#photoSubmission').evaluate(e=>e.open));await p.locator('#photoSubmission [aria-label="关闭投稿"]').click();
assert.equal(await p.locator('[data-wa-view=carousel]').textContent(),'每周精选');
assert(await p.locator('.wa-filter').isHidden());assert(await p.locator('.wa-results').isHidden());
assert(await p.locator('.wa-view-switch').evaluate(e=>e.getBoundingClientRect().top<document.querySelector('.wa-covers').getBoundingClientRect().top));
assert.equal(await p.locator('[data-depth=current]').count(),1);assert.equal(await p.locator('[data-depth=previous]').count(),1);assert.equal(await p.locator('[data-depth=next]').count(),1);
await p.locator('.wa-depth-stage').evaluate(e=>e.dataset.testNode='retained');
const title=await p.locator('.wa-caption-title h2').textContent();
await p.locator('[data-wa-browse="1"]').click();assert.notEqual(await p.locator('.wa-caption-title h2').textContent(),title);
assert.equal(await p.locator('.wa-depth-stage').getAttribute('data-test-node'),'retained');
assert(await p.locator('.wa-depth-stage').evaluate(e=>e.getAnimations({subtree:true}).length>0),'depth cards animate continuously');
await p.reload();assert.match(await p.locator('.wa-carousel-position').textContent(),/第 2 张/);
await p.locator('[data-depth=next]').click();assert.match(await p.locator('.wa-carousel-position').textContent(),/第 3 张/);
await p.locator('.wa-depth-stage').focus();await p.keyboard.press('ArrowLeft');assert.match(await p.locator('.wa-carousel-position').textContent(),/第 2 张/);
await p.locator('[data-wa-week="1"]').click();await p.locator('[data-wa-week="0"]').click();
await p.locator('[data-wa-view=library]').click();
assert(await p.locator('.wa-filter').isVisible());assert(await p.locator('.wa-covers').isHidden());assert.equal(await p.locator('.wa-card').count(),18);
const counts=await p.locator('.wa-card').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.waLikes)));assert.deepEqual(counts,[...counts].sort((a,b)=>b-a));
assert.equal(await p.locator('.wa-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
await p.locator('[data-wa-category="车辆"]').click();assert.equal(await p.locator('.wa-card').count(),6);assert.equal(await p.locator('[data-wa-category="车辆"]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.wa-categories .ui-selection-indicator').count(),0);
await p.locator('#waTag').selectOption('夜景');assert.equal(await p.locator('.wa-card').count(),0);
await p.locator('.wa-reset').click();await p.locator('#waTag').selectOption('夜景');assert.equal(await p.locator('.wa-card').count(),3);
await p.locator('[data-wa-view=carousel]').click();assert.equal(await p.locator('[data-wa-pick]').count(),6);assert(await p.locator('.wa-filter').isHidden());
await p.locator('[data-wa-view=library]').click();assert.equal(await p.locator('.wa-card').count(),3);
await p.locator('.wa-reset').click();await p.locator('.wa-card .wa-photo').first().click();assert(await p.locator('.wa-viewer').evaluate(e=>e.open));
await p.locator('.wa-viewer').press('ArrowRight');await p.locator('.wa-viewer').press('Escape');
await p.locator('.wa-filter').waitFor();assert.equal(await p.locator('.wa-card').count(),18);
await p.locator('[data-wa-view=carousel]').click();
const out='C:/Users/14159/.codex/visualizations/2026/09/21/01a0c335-063c-7fd0-b07c-b7556813fbfb/';
for(const theme of ['dark','light']){
if(await p.locator('html').getAttribute('data-theme')!==theme)await p.locator('#themeToggle').click();
for(const width of [1440,850,700,390,320]){
await p.setViewportSize({width,height:1000});await p.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
await p.locator('[data-wa-view=carousel]').click();
await p.locator('[data-depth=current]').waitFor();
assert(await p.locator('.wa-filter').isHidden());
await p.waitForTimeout(650);
if([1440,390].includes(width)){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'相册-纵深精选-'+theme+'-'+width+'.png',fullPage:true});}
await p.locator('[data-wa-view=library]').click();await p.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
if([1440,390].includes(width)){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'相册-点赞排序图库-'+theme+'-'+width+'.png',fullPage:true});}
}
}
await p.evaluate(()=>navigate(''));assert.equal(await p.locator('.weekly-album-active').count(),0);
await p.evaluate(()=>navigate('weeklyPhotos'));assert.equal(await p.locator('.wa-card').count(),18);
assert.deepEqual(errors,[]);
console.log('Weekly album passed: separate picks/catalogue areas, depth transforms and retained transitions, week recall, hidden filters, tags, likes sorting, zoom and responsive themes.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
