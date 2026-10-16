const siteHeader=$('.site-header'),headerInner=$('.header-inner');
const primaryNavigation=$('#primaryNavigation'),navigationToggle=$('#navigationToggle');
let navigationCollapsed=true,navigationExpanded=false,headerFrame=0;
function closeMainNavigation(restoreFocus=false){
 navigationExpanded=false;navigationToggle.setAttribute('aria-expanded','false');
 if(navigationCollapsed)primaryNavigation.hidden=true;
 closeNavigation();if(restoreFocus)navigationToggle.focus();
}
function openMainNavigation(){
 if(!navigationCollapsed)return;
 closeGlobalSearch();navigationExpanded=true;primaryNavigation.hidden=false;navigationToggle.setAttribute('aria-expanded','true');
}
function measureHeaderNavigation(){
 const wasHidden=primaryNavigation.hidden;primaryNavigation.hidden=false;siteHeader.classList.add('is-measuring');
 const navWidth=primaryNavigation.getBoundingClientRect().width;
 siteHeader.classList.remove('is-measuring');primaryNavigation.hidden=wasHidden;
 const style=getComputedStyle(headerInner),gap=parseFloat(style.columnGap)||18;
 const available=headerInner.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
 const required=$('#logo').getBoundingClientRect().width+navWidth+$('.header-tools').getBoundingClientRect().width+210+gap*3;
 const collapsed=required>available;
 if(collapsed!==navigationCollapsed){
  const focusInNavigation=primaryNavigation.contains(document.activeElement);
  navigationCollapsed=collapsed;navigationExpanded=false;closeNavigation();
  navigationToggle.setAttribute('aria-expanded','false');
  if(collapsed&&focusInNavigation)navigationToggle.focus();
  else if(!collapsed&&document.activeElement===navigationToggle)$('#logo').focus();
 }
 siteHeader.classList.toggle('is-collapsed',collapsed);primaryNavigation.hidden=collapsed&&!navigationExpanded;
}
function scheduleHeaderMeasure(){cancelAnimationFrame(headerFrame);headerFrame=requestAnimationFrame(measureHeaderNavigation);}
navigationToggle.onclick=()=>{if(navigationExpanded)closeMainNavigation();else openMainNavigation();};
navigationToggle.addEventListener('keydown',event=>{
 if(!['ArrowDown','ArrowUp'].includes(event.key))return;
 event.preventDefault();openMainNavigation();const buttons=primaryNavigation.querySelectorAll(':scope > button,:scope > .nav-group > .nav-toggle');
 buttons[event.key==='ArrowUp'?buttons.length-1:0]?.focus();
});
document.addEventListener('click',event=>{if(!primaryNavigation.contains(event.target)&&!navigationToggle.contains(event.target))closeMainNavigation();});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&navigationCollapsed&&navigationExpanded){event.preventDefault();closeMainNavigation(true);}
});
headerInner.addEventListener('focusout',event=>{if(navigationExpanded&&!headerInner.contains(event.relatedTarget))closeMainNavigation();});
$('#globalSearch').addEventListener('focusin',()=>{if(navigationExpanded)closeMainNavigation();});
const navigateWithHeader=navigate;
navigate=function(route,push=true){closeMainNavigation();navigateWithHeader(route,push);if(!route)$('#logo').setAttribute('aria-current','page');else $('#logo').removeAttribute('aria-current');};
if(currentRoute)$('#logo').removeAttribute('aria-current');
function syncHeaderRoute(){closeMainNavigation();if(currentRoute)$('#logo').removeAttribute('aria-current');else $('#logo').setAttribute('aria-current','page');}
window.addEventListener('popstate',syncHeaderRoute);window.addEventListener('hashchange',syncHeaderRoute);
window.addEventListener('resize',scheduleHeaderMeasure);
const headerResizeObserver=new ResizeObserver(scheduleHeaderMeasure);
headerResizeObserver.observe(headerInner);headerResizeObserver.observe($('.header-tools'));headerResizeObserver.observe($('#logo'));
document.fonts.ready.then(scheduleHeaderMeasure);measureHeaderNavigation();
