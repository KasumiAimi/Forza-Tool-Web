const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#liveryCenter');
  await page.locator('.lc-gallery').waitFor();
  assert.equal(await page.locator('.lc-card').count(),8);
  assert.equal(await page.locator('.lc-car-line strong').count(),8);
  assert.equal(await page.locator('.lc-artist strong').count(),8);
  assert.equal(await page.locator('.lc-card-actions button').count(),16);
  assert.equal(await page.locator('.lc-gallery').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),4,'desktop shows four works per row');
  assert.equal(await page.locator('.lc-card img').evaluateAll(async images=>(await Promise.all(images.map(image=>fetch(image.src).then(response=>response.ok)))).every(Boolean)),true,'official image placeholders load');
  const clear=()=>page.locator('.lc-clear').click();
  for(const [query,count] of [['911',1],['宝马',1],['痛车',2],['BMW 极简',1],['huracan',1],['Mika',1]]){
   await page.locator('#lcSearch').fill(query);assert.equal(await page.locator('.lc-card').count(),count,`search ${query}`);
  }
  await clear();
  await page.locator('#lcBrandToggle').click();
  const brands=await page.locator('.lc-brand-choice').evaluateAll(buttons=>buttons.map(button=>button.dataset.lcBrand));
  assert.deepEqual(brands,[...brands].sort((a,b)=>a.localeCompare(b,'en')),'brands are sorted alphabetically');
  await page.locator('[data-lc-brand="Porsche"]').click();
  assert.equal(await page.locator('.lc-card').count(),1);
  assert.equal(await page.locator('#lcBrandToggle').evaluate(node=>node===document.activeElement),true,'brand selection restores trigger focus');
  await clear();
  await page.locator('#lcBrandToggle').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  assert.match(await page.locator('#lcBrandToggle').innerText(),/BMW/,'brand keyboard navigation works');
  assert.equal(await page.locator('.lc-card').count(),1);await clear();
  await page.locator('#lcTagToggle').click();
  const heat=await page.locator('.lc-tag-choice small').allTextContents();
  assert.ok(heat.length>10&&heat.every((value,index)=>index===0||Number(heat[index-1])>=Number(value)),'all tags are listed by descending usage');
  await page.locator('#lcTagMenu [data-lc-tag="痛车"]').click();assert.equal(await page.locator('.lc-card').count(),2);
  await page.locator('[data-lc-style="赛车"]').click();assert.equal(await page.locator('.lc-card').count(),0,'filters combine');
  await page.locator('.lc-empty [data-lc-clear]').click();assert.equal(await page.locator('.lc-card').count(),8);
  for(const [style,count] of [['二次元',3],['现实',2],['赛车',3]]){await page.locator(`[data-lc-style="${style}"]`).click();assert.equal(await page.locator('.lc-card').count(),count);}
  await clear();
  await page.locator('#lcSearch').fill('nothing matches');assert.equal(await page.locator('.lc-empty').count(),1);await page.locator('.lc-empty [data-lc-clear]').click();
  await page.locator('#lcBrandToggle').click();await page.locator('#lcTagToggle').click();
  assert.equal(await page.locator('#lcBrandMenu').isVisible(),false,'only one picker is open');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#lcTagToggle').evaluate(node=>node===document.activeElement),true);
  await page.locator('#lcBrandToggle').click();await page.locator('#pageTitle').click();assert.equal(await page.locator('#lcBrandMenu').isVisible(),false,'outside click closes picker');
  const like=page.locator('[data-lc-like="livery-center-demo-1"]'),save=page.locator('[data-lc-save="livery-center-demo-1"]');
  await like.click();assert.equal(await like.getAttribute('aria-pressed'),'true');assert.match(await like.innerText(),/129/);
  assert.equal(await like.evaluate(node=>node===document.activeElement),true,'like retains keyboard focus');
  await save.click();assert.equal(await save.getAttribute('aria-pressed'),'true');
  await page.reload();assert.equal(await like.getAttribute('aria-pressed'),'true','likes persist locally');assert.equal(await save.getAttribute('aria-pressed'),'true','saved works persist locally');
  await like.click();assert.match(await like.innerText(),/128/);await save.click();assert.equal(await save.getAttribute('aria-pressed'),'false');
  await page.locator('#lcBrandToggle').click();await page.locator('[data-lc-brand="Ferrari"]').click();await page.locator('#logo').click();
  assert.equal(await page.locator('#subpage').evaluate(node=>node.classList.contains('livery-center-active')),false,'styles leave with the page');
  await page.goBack();await page.locator('.lc-card').waitFor();assert.equal(await page.locator('.lc-card').count(),1,'filters survive navigating away and back');
  const ferrariLike=page.locator('[data-lc-like="livery-center-demo-5"]');await ferrariLike.click();assert.match(await ferrariLike.innerText(),/66/,'handlers do not multiply after navigation');await ferrariLike.click();assert.match(await ferrariLike.innerText(),/65/);await clear();
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const width of [1600,1280,1024,850,768,700,390,320]){
    await page.setViewportSize({width,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} overflow ${width}`);
    assert.equal(await page.locator('.lc-gallery').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),width>1100?4:width>750?3:width>360?2:1);
    for(const id of ['lcBrandToggle','lcTagToggle']){
     await page.locator('#'+id).click();
     const menu=await page.locator(id==='lcBrandToggle'?'#lcBrandMenu':'#lcTagMenu').boundingBox();
     assert.ok(menu&&menu.x>=0&&menu.x+menu.width<=width+1,`${theme} picker fits ${width}`);
     await page.keyboard.press('Escape');
    }
    const reset=page.locator(width<=1100?'.lc-mobile-clear':'.lc-clear');assert.equal(await reset.isVisible(),true,'reset remains available');
   }
  }
  const damaged=await browser.newContext();
  await damaged.addInitScript(()=>{localStorage.setItem('horizon_web_v2_livery_center_liked','not-json');localStorage.setItem('horizon_web_v2_livery_center_saved',JSON.stringify({bad:true}));});
  const damagedPage=await damaged.newPage();await damagedPage.goto(base+'#liveryCenter');assert.equal(await damagedPage.locator('.lc-card').count(),8);assert.equal(await damagedPage.locator('.lc-card-actions [aria-pressed=true]').count(),0,'damaged stored data does not break browsing');await damaged.close();
  assert.deepEqual(errors,[]);
  console.log('Livery center passed: four-column cards, keyword search, alphabetical brands, hot tags, styles, empty/reset, keyboard disclosures, persisted likes/saves, navigation cleanup and responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
