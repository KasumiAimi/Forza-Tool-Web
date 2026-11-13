const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#carDetail?view=garage&id=demo_0&from=carRecommendation&tier=META&all=1');
  await page.locator('#vehicleLiveriesTab').click();
  assert.equal(await page.locator('.vehicle-livery-card').count(),6);
  assert.equal(await page.locator('.vehicle-livery-row').count(),2);
  assert.equal(await page.locator('.vehicle-livery-row').first().locator('.vehicle-livery-card').count(),3,'three works per desktop row');
  assert.equal(await page.locator('.vehicle-livery-code').count(),6);
  assert.equal(await page.locator('.vehicle-livery-tags').count(),6);
  assert.match(await page.locator('.vehicle-livery-demo-note').innerText(),/不可在游戏中使用/);
  const work=id=>page.locator(`[data-livery-id="livery-demo-0${id}"]`);
  await work(1).click();
  assert.equal(await work(1).getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),1);
  assert.equal(await page.locator('.vehicle-livery-row-group').first().locator('.vehicle-livery-drawer').count(),1,'drawer opens below the selected row');
  const geometry=await page.locator('.vehicle-livery-row-group').first().evaluate(group=>({cardsBottom:group.querySelector('.vehicle-livery-row').getBoundingClientRect().bottom,drawerTop:group.querySelector('.vehicle-livery-drawer').getBoundingClientRect().top,drawerBottom:group.querySelector('.vehicle-livery-drawer').getBoundingClientRect().bottom,nextTop:group.nextElementSibling.getBoundingClientRect().top}));
  assert.ok(geometry.drawerTop>=geometry.cardsBottom&&geometry.nextTop>=geometry.drawerBottom,'drawer sits between its row and the next row');
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'1 / 3');
  await page.locator('[data-livery-step="1"]').click();
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'2 / 3');
  await page.locator('[data-livery-step="1"]').click();
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'3 / 3');
  await page.locator('[data-livery-step="1"]').click();
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'1 / 3','image navigation wraps');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'3 / 3','keyboard cycles images');
  await page.locator('[data-livery-image="1"]').click();
  assert.equal(await page.locator('.vehicle-livery-view-choices [aria-pressed=true]').innerText(),'侧面视角');
  await work(2).click();
  assert.match(await page.locator('.vehicle-livery-drawer-heading').innerText(),/午夜车队/);
  assert.equal(await work(1).getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),1,'switching within a row replaces the drawer content');
  await page.locator('.vehicle-livery-card').nth(1).locator('.vehicle-livery-copy').click();
  assert.equal(await work(2).getAttribute('aria-expanded'),'true','copying does not toggle the drawer');
  await work(4).click();
  assert.equal(await page.locator('.vehicle-livery-row-group').nth(1).locator('.vehicle-livery-drawer').count(),1,'drawer moves beneath the second row');
  await work(4).click();
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),0,'same card closes the drawer');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),1,'card is keyboard accessible');
  await page.locator('[data-livery-close]').focus();await page.keyboard.press('Escape');
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),0);
  assert.equal(await work(4).evaluate(node=>node===document.activeElement),true,'closing restores focus to the work');
  await work(4).click();await page.locator('[data-livery-step="1"]').click();
  await page.locator('#collectCar').click();
  assert.equal(await work(4).getAttribute('aria-expanded'),'true','collection rerender preserves the selected work');
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'2 / 3');
  await page.locator('#vehicleTunesTab').click();await page.locator('#vehicleLiveriesTab').click();
  assert.equal(await page.locator('.vehicle-livery-image-status').innerText(),'2 / 3','tab switching preserves the selected image');
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const [width,count] of [[1440,3],[700,3],[390,2],[320,1]]){
    await page.setViewportSize({width,height:900});
    await page.waitForFunction(n=>document.querySelector('.vehicle-livery-row')?.style.getPropertyValue('--livery-columns')===String(n),count);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} livery overflow ${width}`);
    assert.equal(await page.locator('.vehicle-livery-drawer').count(),1);
    assert.equal(await page.locator('.vehicle-livery-row-group').filter({has:work(4)}).locator('.vehicle-livery-drawer').count(),1,'responsive regrouping keeps the drawer with its selected card');
   }
  }
  await page.goto(base+'#carDetail?view=garage&id=garage_demo_9&from=carRecommendation&tier=META');
  await page.locator('#vehicleLiveriesTab').click();
  assert.equal(await page.locator('.vehicle-livery-drawer').count(),0,'another car starts with closed works');
  assert.deepEqual(errors,[]);
  console.log('Liveries passed: mock works, three-column rows, one row drawer, image cycling, keyboard, copy isolation, persisted selection and responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
