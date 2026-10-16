const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ActivityFeed=require('../activity-model.js');
const now=Date.parse('2026-10-16T12:00:00Z'),day=86400000;
const make=(id,time,more={})=>({id,type:'tuning',carId:'car',creatorId:'creator',updatedAt:new Date(time).toISOString(),...more});
const fixture=[make('boundary',now-7*day),make('expired',now-7*day-1),make('future',now+1),make('both',now-100),make('both',now-200),make('creator-only',now-50,{carId:'other'}),make('neither',now-1,{carId:'other',creatorId:'other'}),make('livery',now-10,{type:'livery'}),make('revised',now-20,{publishedAt:new Date(now-30*day).toISOString()}),make('invalid',now,{updatedAt:'invalid'})];
assert.deepEqual(ActivityFeed.select({updates:fixture,carIds:new Set(['car']),creatorIds:new Set(['creator']),type:'tuning',now}).map(u=>u.id),['revised','creator-only','both','boundary']);
assert.deepEqual(ActivityFeed.select({updates:fixture,carIds:new Set(),creatorIds:new Set(),type:'tuning',now}),[]);
assert.deepEqual(ActivityFeed.select({updates:fixture,carIds:new Set(['car']),creatorIds:new Set(),type:'livery',now}).map(u=>u.id),['livery']);
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
  const items=page.locator('#activityList .activity-item'),expand=page.locator('#expandHomeUpdates');
  assert.equal(await items.count(),0);assert.match(await page.locator('.activity-empty').textContent(),/暂无调校更新/);
  await page.locator('#homeCars [data-car="demo_0"]').click();await page.locator('#collectCar').click();await page.locator('#logo').click();
  assert.equal(await items.count(),2,'car subscription yields its two recent tunes');
  assert.equal(await items.first().locator('img').count(),1);assert.match(await items.first().locator('strong').textContent(),/190E/);
  assert.equal(await items.first().locator('.activity-tags').textContent(),'A公路META');
  const search=page.locator('#globalSearchInput');await search.fill('Demo Drift');await search.press('Enter');await page.locator('#follow').click();await page.locator('#logo').click();
  assert.equal(await items.count(),3);assert.equal(await expand.isVisible(),true);
  await expand.click();assert((await items.count())>3);
  const ids=await items.evaluateAll(nodes=>nodes.map(n=>n.dataset.updateId));assert.equal(new Set(ids).size,ids.length,'car/creator overlap must not duplicate works');
  const times=await items.locator('time').evaluateAll(nodes=>nodes.map(n=>Date.parse(n.dateTime)));assert.deepEqual(times,[...times].sort((a,b)=>b-a));
  assert(times.every(time=>time<=Date.now()&&time>=Date.now()-7*day));
  await expand.click();assert.equal(await items.count(),3);
  await expand.click();await page.locator('#activityTab-livery').click();assert.equal(await items.count(),2);assert.equal(await expand.getAttribute('aria-expanded'),'false');
  assert.equal(await items.first().locator('.activity-tags').count(),0,'liveries must not invent tuning tags');
  await items.first().click();await page.locator('#liveryUpdateDialog[open]').waitFor();await page.locator('#followLiveryCreator').click();
  assert.equal(await page.locator('#followLiveryCreator').textContent(),'取消关注创作者');
  await page.locator('#closeLiveryUpdate').click();await page.reload();
  assert.equal(await items.count(),3);assert.equal(await page.evaluate(()=>followed.has('creator_0')&&followed.has('creator_3')),true,'unified follows persist');
  await page.goto(base+'#tunerProfile?name=Demo%20Horizon');await page.locator('#follow').click();await page.locator('#logo').click();
  await page.locator('#activityTab-livery').click();assert.equal(await items.count(),3);await expand.click();assert((await items.count())>3,'liveries expand too');
  await page.locator('#activityTab-tuning').click();assert.equal(await items.count(),3,'switching resets expansion');
  await page.locator('#activityTab-tuning').press('End');assert.equal(await page.locator('#activityTab-livery').getAttribute('aria-selected'),'true');
  await page.locator('#activityTab-livery').press('Home');assert.equal(await page.locator('#activityTab-tuning').getAttribute('aria-selected'),'true');
  const chosen=await items.first().locator('strong').textContent(),tags=await items.first().locator('.activity-tags').textContent();
  await items.first().click();assert.equal(await page.locator('.vehicle-masthead-copy h2').textContent(),chosen);assert.equal(await page.locator('.tune').count(),1);
  const detail=await page.locator('.tune .tags').textContent();assert(tags.includes((await page.locator('.tune .level-A,.tune .level-S1,.tune .level-S2,.tune .level-B,.tune .level-C').first().textContent())));assert(detail.length>0);
  await page.locator('#logo').click();
  for(const theme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const kind of ['tuning','livery']){
     await page.locator('#activityTab-'+kind).click();if(await expand.isVisible())await expand.click();
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${kind} overflow ${width}`);
     const box=await page.locator('.reference-profile-rail').boundingBox();const buttonBox=await expand.boundingBox();assert(buttonBox.y+buttonBox.height<=box.y+box.height,'expanded list must not be clipped');
    }
   }
  }
  await page.evaluate(()=>{followed.clear();saveFollowedCreators();collected.clear();saveCollect();renderHomeUpdates();});await page.reload();
  assert.equal(await items.count(),0);await page.locator('#activityTab-livery').click();assert.match(await page.locator('.activity-empty').textContent(),/暂无涂装更新/);
  assert.deepEqual(errors,[]);await context.close();
  console.log('Activity passed: rolling seven-day boundaries, latest revisions, OR subscriptions, deduplication, both tabs, expand/collapse/reset, real follow/save flows, persistence, destinations, keyboard and responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
