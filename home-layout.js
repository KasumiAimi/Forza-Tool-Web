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
const discover=$('.discover-section');
discover.querySelector('.web-section-heading').innerHTML='<h2>发现下一辆好车</h2><button data-route="carRecommendation" class="text-link">查看全部 ↗</button>';
const homeTabs=document.createElement('div');homeTabs.className='reference-discover-tabs tabs';homeTabs.setAttribute('role','tablist');homeTabs.setAttribute('aria-label','精选推荐分类');
homeTabs.innerHTML=[['tunings','本周热门调校'],['liveries','热门涂装']].map(([key,label],i)=>`<button role="tab" id="homeTab-${key}" data-home-tab="${key}" aria-selected="${i===0}" aria-controls="homeCars" tabindex="${i===0?0:-1}">${label}</button>`).join('');
discover.querySelector('.web-section-heading').append(homeTabs);
$('#homeCars').setAttribute('role','tabpanel');
const rail=document.createElement('aside');rail.className='reference-profile-rail dashboard-card';rail.setAttribute('aria-label','个人收藏更新');
rail.innerHTML='<div class="dashboard-card-heading"><h3>个人收藏更新</h3><button class="favorite-link" data-route="collection" aria-label="个人收藏">全部收藏 ↗</button></div><div id="referenceActivity"></div>';
const activity=$('#homeActivity');activity.querySelector('h3').remove();rail.querySelector('#referenceActivity').append(activity);
mainColumn.append(featureRow);layout.append(mainColumn,rail,discover);homeMain.prepend(welcome,layout);
$('.home-dashboard').hidden=true;$('.tool-strip').hidden=true;$('.community-section').hidden=true;
$('.home-dashboard .favorite-link').classList.remove('favorite-link');




let selectedHomeTab='tunings';
function renderReferenceRecommendations(){
 homeTabs.querySelectorAll('[data-home-tab]').forEach(button=>{const active=button.dataset.homeTab===selectedHomeTab;button.setAttribute('aria-selected',String(active));button.classList.toggle('active',active);button.tabIndex=active?0:-1;});
 $('#homeCars').setAttribute('aria-labelledby','homeTab-'+selectedHomeTab);
 discover.querySelector('.text-link').dataset.route=selectedHomeTab==='liveries'?'liveryCenter':'carRecommendation';
 if(selectedHomeTab==='liveries'){$('#homeCars').innerHTML='<div class="reference-tab-empty placeholder"><span>✧</span><h3>为座驾，添一点自己的风格。</h3><p>涂装作品尚未接入，先看看涂装中心的布局。</p><button data-route="liveryCenter">进入涂装中心 ↗</button></div>';return;}
 const visible=cars.slice(0,3);
 $('#homeCars').innerHTML=visible.length?visible.map(car=>'<div class="reference-car-card">'+card(car,'',true)+'</div>').join(''):'<div class="reference-tab-empty placeholder"><h3>收藏更新会出现在这里</h3><p>收藏一台车辆，再回来查看它的调校。</p><button data-route="carSelection">浏览车辆库 ↗</button></div>';
}
function refreshReferenceHome(){
 $('#welcomeDriverName').textContent=nick;

 renderReferenceRecommendations();
}
const refreshPreviousHome=refreshHomeSaved;
refreshHomeSaved=function(){refreshPreviousHome();refreshReferenceHome();};
const navigatePreviousHome=navigate;
navigate=function(route,push=true){navigatePreviousHome(route,push);document.body.classList.toggle('reference-home',!route);};
const updatePreviousNick=updateNick;updateNick=function(){updatePreviousNick();$('#welcomeDriverName').textContent=nick;};
document.addEventListener('click',event=>{
 const tab=event.target.closest('[data-home-tab]');if(tab){selectedHomeTab=tab.dataset.homeTab;renderReferenceRecommendations();}

});
homeTabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...homeTabs.querySelectorAll('button')],index=tabs.indexOf(document.activeElement);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});
$('#homeDate').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'America/Chicago',month:'long',day:'numeric'}).format(new Date());
refreshHomeSaved();document.body.classList.add('reference-home');
