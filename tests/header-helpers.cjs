async function openHeader(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const toggle=page.locator('#navigationToggle');
 if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
}
async function headerRoute(page,route){
 await openHeader(page);
 const item=page.locator('#primaryNavigation [data-route="'+route+'"]');
 const group=item.locator('xpath=..');
 if(await group.getAttribute('class')==='nav-dropdown'&&!await group.isVisible())await page.locator('[aria-controls="'+await group.getAttribute('id')+'"]').click();
 await item.click();
}
module.exports={openHeader,headerRoute};
