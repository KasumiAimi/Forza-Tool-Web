const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765/';

(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'#carSelection?view=garage');
  await page.locator('.library-garage-results').waitFor();
  assert.equal(await page.locator('.library-garage-car').count(),36,'official cutouts and seven library-only density examples appear');
  assert.equal(await page.locator('.library-brand-section').count(),19,'cars are split into brand sections');
  assert.equal(await page.locator('.library-brand-emblem').count(),19,'each brand has a leading logo placeholder');
  assert.equal(await page.locator('.library-brand-section').evaluateAll(sections=>sections.every(section=>[...section.querySelectorAll('.library-garage-car')].every(card=>card.getAttribute('aria-label').startsWith('查看 '+section.dataset.libraryBrand+' ')))),true,'brands never share a row');
  assert.equal(await page.locator('.library-brand-row').evaluateAll(rows=>rows.every(row=>row.querySelectorAll('.library-garage-car').length<=5&&row.style.getPropertyValue('--library-columns')==='5')),true,'desktop rows have five slots at most');
  assert.deepEqual(await page.locator('.library-brand-section[data-library-brand="Porsche"] .library-brand-row').evaluateAll(rows=>rows.map(row=>row.querySelectorAll('.library-garage-car').length)),[5,2],'the same brand continues on a new row after five vehicles');
  assert.deepEqual(await page.locator('.library-brand-section[data-library-brand="Toyota"] .library-brand-row').evaluateAll(rows=>rows.map(row=>row.querySelectorAll('.library-garage-car').length)),[5,1],'six vehicles in one brand span two rows');
  assert.match(await page.locator('.library-garage-car img').first().getAttribute('src'),/assets\/official-cars\/FH6_/);
  assert.equal(await page.locator('.library-garage-rating').count(),36,'every car shows level and demo score');
  assert.equal(await page.locator('.library-tune-badge.has-tuning').count(),29,'cars with tuning data show the orange badge');
  assert.equal(await page.locator('.library-tune-badge.no-tuning').count(),7,'cars without tuning data show the gray badge');
  assert.equal(await page.locator('.library-garage-name').count(),36,'every car shows its name below');
  assert.equal(await page.locator('.library-brand-section[data-library-brand=Toyota] .library-brand-country').innerText(),'日本','country appears beside the brand');
  assert.equal(await page.locator('[data-garage-car="library_demo_3"] .library-tune-badge').innerText(),'无调校');
  assert.equal(await page.locator('[data-garage-car="library_demo_3"] .library-garage-car-info').innerText(),'911 Carrera S','only the name remains below the car');
  await page.locator('#openBrand').click();
  await page.locator('#brandList [data-brand="Porsche"]').click();
  assert.equal(await page.locator('.library-garage-car').count(),7,'brand filter stays available');
  assert.equal(await page.locator('.library-brand-section').first().getAttribute('data-library-brand'),'Porsche');
  await page.locator('#resetVehicleFilters').click();
  await page.locator('#carSearch').fill('GT3');
  assert.equal(await page.locator('.library-garage-car').count(),2,'text search works in brand layout');
  await page.reload();
  assert.equal(await page.locator('#carSearch').inputValue(),'GT3','search and layout survive reload');
  await page.locator('#resetVehicleFilters').click();
  await page.locator('#advanced').click();
  await page.locator('#vehicleCountry').selectOption('德国');
  assert.ok(await page.locator('.library-garage-car').count()>3,'country filter works');
  await page.locator('#resetVehicleFilters').click();
  await page.locator('.library-garage-car').first().click();
  assert.match(page.url(),/#carDetail\?view=garage/,'detail links preserve library layout');
  assert.match(await page.locator('.masthead-car img').getAttribute('src'),/assets\/official-cars\/FH6_/,'detail uses official cutout');
  await page.reload();
  await page.locator('#backToVehicles').click();
  assert.match(page.url(),/#carSelection\?view=garage/,'return restores the brand layout');
  await page.locator('[data-garage-car="library_demo_3"]').click();
  assert.match(page.url(),/id=library_demo_3/,'library-only density example has a shareable detail');
  await page.reload();
  assert.match(await page.locator('.vehicle-masthead-copy h2').innerText(),/911 Carrera S/);
  await page.locator('#collectCar').click();
  await page.reload();
  assert.match(await page.locator('#collectCar').innerText(),/已收藏/,'library-only example can be saved');
  await page.locator('#backToVehicles').click();
  await page.locator('#logo').click();
  await page.locator('.favorite-link').click();
  assert.equal(await page.locator('.saved-vehicle').count(),1,'saved library-only example appears in collection');
  await page.goto(base+'#carSelection?view=garage');
  assert.equal(await page.locator('[data-library-view]').count(),0,'layout switch has been removed');
  await page.goto(base+'#carSelection?view=classic&q=GT3');
  await page.locator('.library-garage-results').waitFor();
  assert.match(page.url(),/view=garage/,'old classic links normalize to garage');
  assert.equal(await page.locator('.library-garage-car').count(),2,'legacy links retain search');
  await page.locator('#resetVehicleFilters').click();
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeToggle').click();
   for(const width of [1600,1280,960,760,520,390,320]){
    await page.setViewportSize({width,height:900});
    const columns=width<=520?1:width<=760?2:width<=960?3:width<=1160?4:5;
    await page.waitForFunction(expected=>document.querySelector('.library-brand-row')?.style.getPropertyValue('--library-columns')===String(expected),columns);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} library overflow ${width}`);
   }
  }
  assert.deepEqual(errors,[]);
  console.log('Brand garage library passed: official images, brand rows, five-slot density, filters, search, detail, legacy-link migration and responsive themes.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
