// Homepage composition follows the supplied reference; the established top navigation stays.
const homeMain=$('#home main');
const welcome=document.createElement('section');welcome.className='reference-welcome intro';
welcome.innerHTML='<div><h1>欢迎回来，<span id="welcomeDriverName"></span><b>.</b></h1><p class="home-slogan">源于玩家，用于玩家</p></div><time id="homeDate"></time>';
const layout=document.createElement('div');layout.className='reference-home-layout';
const mainColumn=document.createElement('div');mainColumn.className='reference-main-column';
const featureRow=document.createElement('div');featureRow.className='reference-feature-row';
const highlights=document.createElement('div');highlights.className='reference-highlights';
featureRow.append($('.photo-feature'),highlights);
const homeSeasonPanel=$('#homeSeason'),homeLeaguePanel=$('#homeLeague');
highlights.append(homeSeasonPanel,homeLeaguePanel);
const leagueHeading=homeLeaguePanel.querySelector('.section-heading');
leagueHeading.querySelector('h3').textContent='本周最新赛事';
leagueHeading.querySelector('button').textContent='积分公示 ↗';
const leagueSignup=homeLeaguePanel.querySelector('#copyContact');
leagueSignup.textContent='报名参与 ↗';
leagueSignup.setAttribute('aria-label','报名参与，复制 B 站联系人 KMTTB');
leagueSignup.title='复制 B 站联系人 KMTTB';
const leaguePoster=homeLeaguePanel.querySelector('.poster');
const leaguePosterSource='assets/home/latest_event.webp';
leaguePoster.innerHTML='<img src="'+leaguePosterSource+'" alt="KIT CUP S3-3 白川拉力赛海报">';
leaguePoster.setAttribute('aria-label','查看白川拉力赛海报');
leaguePoster.onclick=()=>{
 const dialog=$('#photo');
 dialog.querySelector('img').src=leaguePosterSource;
 dialog.querySelector('p').textContent='KIT CUP S3-3 · 白川拉力赛';
 dialog.showModal();
};
const discover=$('.discover-section');
discover.querySelector('.web-section-heading').innerHTML='<h2>发现下一辆好车</h2><button data-route="carRecommendation" class="text-link">查看全部 ↗</button>';
const homeTabs=document.createElement('div');homeTabs.className='reference-discover-tabs tabs';homeTabs.setAttribute('role','tablist');homeTabs.setAttribute('aria-label','精选推荐分类');
homeTabs.innerHTML=[['tunings','本周热门调校'],['liveries','热门涂装']].map(([key,label],i)=>`<button role="tab" id="homeTab-${key}" data-home-tab="${key}" aria-selected="${i===0}" aria-controls="homeCars" tabindex="${i===0?0:-1}">${label}</button>`).join('');
discover.querySelector('.web-section-heading').append(homeTabs);
$('#homeCars').setAttribute('role','tabpanel');
const rail=document.createElement('aside');rail.className='reference-profile-rail dashboard-card';rail.setAttribute('aria-label','个人收藏更新');
rail.innerHTML='<div class="dashboard-card-heading"><h3>个人收藏更新</h3><span id="activitySubSummary" class="activity-sub-summary"></span></div><div id="referenceActivity"></div>';
const personalSection=document.createElement('section');personalSection.className='reference-personal-section';personalSection.setAttribute('aria-labelledby','personalSectionTitle');
personalSection.innerHTML='<div class="web-section-heading"><h2 id="personalSectionTitle">个人中心</h2><button class="text-link favorite-link" data-route="collection" aria-label="个人收藏">全部收藏 ↗</button></div>';
personalSection.append(rail);
const activity=$('#homeActivity');activity.querySelector('h3').remove();rail.querySelector('#referenceActivity').append(activity);
mainColumn.append(featureRow);layout.append(mainColumn,personalSection,discover);homeMain.prepend(welcome,layout);
$('.home-dashboard').hidden=true;$('.tool-strip').hidden=true;$('.community-section').hidden=true;
$('.home-dashboard .favorite-link').classList.remove('favorite-link');




let selectedHomeTab='tunings';
function renderReferenceRecommendations(){
 homeTabs.querySelectorAll('[data-home-tab]').forEach(button=>{const active=button.dataset.homeTab===selectedHomeTab;button.setAttribute('aria-selected',String(active));button.classList.toggle('active',active);button.tabIndex=active?0:-1;});
 $('#homeCars').setAttribute('aria-labelledby','homeTab-'+selectedHomeTab);
 const isLivery=selectedHomeTab==='liveries';
 const link=discover.querySelector('.text-link');
 link.dataset.route=isLivery?'liveryCenter':'carRecommendation';
 link.textContent=isLivery?'进入涂装中心 ↗':'查看全部 ↗';
 const grid=$('#homeCars');
 grid.classList.toggle('home-livery-shelf',isLivery);
 if(isLivery){
  grid.innerHTML=liveryCenterWorks.slice(0,8).map((work,index)=>`<button type="button" class="home-livery-item" data-home-livery="${esc(work.image)}" aria-label="${esc(work.brand+' '+work.car+' · '+work.title+' · 查看车辆涂装')}">${renderLiveryToybox(work,index,true)}</button>`).join('');
  return;
 }
 renderHomeGarage();
}
let homeGarageColumns=0;
function renderHomeGarage(){
 if(!homeReady)return;
 const grid=$('#homeCars'),width=grid.clientWidth;
 if(!width)return;
 const columns=homeGarageColumnCount(width);
 const tier='META';
 const selectTunes=car=>car.tuningData.filter(tune=>tune.tier===tier);
 const list=garageAllCars.filter(car=>selectTunes(car).length);
 grid.style.setProperty('--home-garage-rows',Math.ceil(list.length/columns));
 homeGarageColumns=columns;
 if(selectedHomeTab!=='tunings')return;
 const rows=[];
 for(let start=0;start<list.length;start+=columns){
  const count=start===0?`<span class="garage-tier-count">${String(list.length).padStart(2,'0')} 辆</span>`:'';
  rows.push(renderGarageRow(list.slice(start,start+columns),tier,columns,count,selectTunes));
 }
 grid.innerHTML=`<section class="garage-tier home-garage-tier" data-tier="${tier}" aria-label="META 梯队">${rows.join('')}</section>`;
}
function homeGarageColumnCount(width){return width>=680?4:width>=510?3:width>=325?2:1;}
let homeReady=false;
new ResizeObserver(()=>{
 const width=$('#homeCars').clientWidth;
 const columns=homeGarageColumnCount(width);
 if(width&&columns!==homeGarageColumns)renderHomeGarage();
}).observe($('#homeCars'));
document.addEventListener('DOMContentLoaded',()=>{
 homeReady=true;
 renderHomeGarage();
 const groups=[['#primaryNavigation','.nav-link.active'],['.reference-discover-tabs','[aria-selected=true]'],['.activity-tabs','[aria-selected=true]']];
 for(const [selector,activeSelector] of groups){
  const group=$(selector);
  if(!group)continue;
  group.classList.add('sliding-indicator');
  const bar=document.createElement('span');
  bar.className='selection-pill';
  bar.setAttribute('aria-hidden','true');
  const track=document.createElement('span');
  track.className='selection-pill-track';
  track.append(bar);
  group.append(track);
  const update=()=>{
   const active=group.querySelector(activeSelector);
   const visible=!!active?.getClientRects().length;
   if(!visible){bar.classList.remove('is-visible');return;}
   const box=active.getBoundingClientRect(),base=group.getBoundingClientRect();

   const vertical=group.closest('.site-header')?.classList.contains('is-collapsed');
   const length=vertical?Math.min(48,box.width-24):Math.max(12,box.width-12);
   bar.style.width=length+'px';
   bar.style.height='3px';
   const x=box.left-base.left+(vertical?12:(box.width-length)/2)+group.scrollLeft;
   const y=(vertical?box.bottom-base.top-8:base.height-(group.id==='primaryNavigation'?4:3))+group.scrollTop;
   bar.style.transform=`translate(${x}px,${y}px)`;
   bar.classList.add('is-visible');
  };
  new MutationObserver(records=>{
   if(records.some(record=>record.target!==bar))update();
  }).observe(group,{subtree:true,attributes:true,attributeFilter:['class','aria-selected','hidden']});
  new ResizeObserver(update).observe(group);
  update();
 }
});
function refreshReferenceHome(){
 $('#welcomeDriverName').textContent=nick;

 renderReferenceRecommendations();
}
const refreshPreviousHome=refreshHomeSaved;
refreshHomeSaved=function(){refreshPreviousHome();refreshReferenceHome();};
onAfterNavigate(route=>document.body.classList.toggle('reference-home',!route));
const updatePreviousNick=updateNick;updateNick=function(){updatePreviousNick();$('#welcomeDriverName').textContent=nick;};
document.addEventListener('click',event=>{
 const livery=event.target.closest('[data-home-livery]');
 if(livery){
  const car=libraryPreviewCars.find(item=>garageImage(item)==='assets/official-cars/'+livery.dataset.homeLivery);
  if(!car){notify('暂未找到对应车辆');return;}
  detailCar=car;detailOrigin='homeLivery';detailTier='';showAll=false;
  vehicleScreenCar='';
  navigate('carDetail');
  return;
 }
 const tab=event.target.closest('[data-home-tab]');if(tab){selectedHomeTab=tab.dataset.homeTab;renderReferenceRecommendations();}

});
homeTabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...homeTabs.querySelectorAll('button')],index=tabs.indexOf(document.activeElement);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});
$('#homeDate').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'America/Chicago',month:'long',day:'numeric'}).format(new Date());
refreshHomeSaved();document.body.classList.add('reference-home');
