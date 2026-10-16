// Functional vehicle workflow. Data remains explicitly marked as demo content.
let vehicleQuery='',vehicleSort='default',vehicleCountry='',savedOnly=false,advancedOpen=false;
collected=new Set([...collected].filter(id=>cars.some(car=>car._id===id)));
const vehicleNameOrder=(a,b)=>(a.brand+' '+a.name).localeCompare(b.brand+' '+b.name,'zh-CN');
function matchesVehicleText(car,query){
 const text=[car.brand,car.name,car.country,...car.tuningData.map(t=>t.tuner)].join(' ').toLocaleLowerCase();
 return query.trim().toLocaleLowerCase().split(/\s+/).every(token=>text.includes(token));
}
function sortVehicles(list){
 return [...list].sort(vehicleSort==='name'?vehicleNameOrder:vehicleSort==='level'?
  (a,b)=>levels.indexOf(a.level)-levels.indexOf(b.level)||vehicleNameOrder(a,b):
  vehicleSort==='tunes'?(a,b)=>b.tuningData.length-a.tuningData.length||vehicleNameOrder(a,b):()=>0);
}
function vehicleToolbar(query,searchId,count){
 return `<section class="vehicle-tools" aria-label="车辆检索与排序">
  <label class="vehicle-search">搜索车辆、品牌或调校师<input type="search" id="${searchId}" value="${esc(query)}" placeholder="如 BMW、GT-R、Demo Apex" maxlength="100"></label>
  <label>排序<select id="vehicleSort">${[['default','默认顺序'],['name','品牌 / 名称'],['level','车辆等级'],['tunes','调校数量']].map(([key,name])=>`<option value="${key}" ${vehicleSort===key?'selected':''}>${name}</option>`).join('')}</select></label>
  <span role="status" aria-live="polite">${count} 辆车辆 · 演示数据</span>
 </section>`;
}
function bindVehicleTools(searchId,setQuery,rerender){
 $('#'+searchId).oninput=event=>{
  if(event.isComposing)return;
  const start=event.target.selectionStart,end=event.target.selectionEnd;
  setQuery(event.target.value);rerender();syncVehicleHistory();
  const input=$('#'+searchId);input.focus();input.setSelectionRange(start,end);
 };
 $('#'+searchId).oncompositionend=event=>$('#'+searchId).oninput(event);
 $('#vehicleSort').onchange=event=>{vehicleSort=event.target.value;rerender();syncVehicleHistory();$('#vehicleSort').focus();};
}
function vehicleEmpty(text){
 return `<div class="result-empty"><h2>${text}</h2><p>调整关键词或筛选条件后再试。</p><button class="copy-tuner" id="resetVehicleFilters">清空搜索与筛选</button></div>`;
}
function resetVehicleFilters(){
 filters={brand:'',level:'',scenario:'',driveType:''};vehicleCountry='';savedOnly=false;vehicleQuery='';libraryQuery='';vehicleSort='default';
 render();syncVehicleHistory();
}
function bindReset(){if($('#resetVehicleFilters'))$('#resetVehicleFilters').onclick=resetVehicleFilters;}

renderLibrary=function(){
 const source=currentRoute==='collection'?cars.filter(c=>collected.has(c._id)):cars;
 const list=sortVehicles(source.filter(c=>(!filters.brand||c.brand===filters.brand)&&(!filters.level||c.level===filters.level)&&(!filters.driveType||c.driveType===filters.driveType)&&(!vehicleCountry||c.country===vehicleCountry)&&(!savedOnly||collected.has(c._id))&&matchesVehicleText(c,libraryQuery)));
 const hasFilters=libraryQuery||Object.values(filters).some(Boolean)||vehicleCountry||savedOnly;
 $('#subcontent').innerHTML=`${currentRoute==='collection'?`<p class="vehicle-note">已收藏 ${source.length} 辆车辆，保存在当前浏览器。</p>`:''}
  ${vehicleToolbar(libraryQuery,'carSearch',list.length)}
  <div class="library-controls"><button class="brand-trigger" id="openBrand">${esc(filters.brand||'全部车厂')} ▾</button><button class="copy-tuner" id="advanced" aria-expanded="${advancedOpen}" aria-controls="advancedVehicleFilters">高级筛选</button>${hasFilters&&list.length?'<button class="copy-tuner" id="resetVehicleFilters">清空搜索与筛选</button>':''}</div>
  <div class="library-pills"><div class="vehicle-note">车辆等级</div>${pill('level',['',...levels]).replace('></button>','>全部等级</button>')}<div class="vehicle-note">驱动形式</div>${pill('driveType',['','四驱','后驱','前驱']).replace('></button>','>全部驱动</button>')}</div>
  <section class="vehicle-advanced" id="advancedVehicleFilters" ${advancedOpen?'':'hidden'} aria-label="高级筛选">
   <label>国家 / 地区<select id="vehicleCountry"><option value="">全部地区</option>${[...new Set(cars.map(c=>c.country))].sort().map(country=>`<option ${vehicleCountry===country?'selected':''}>${esc(country)}</option>`).join('')}</select></label>
   ${currentRoute==='collection'?'':'<label class="vehicle-checkbox"><input id="savedOnly" type="checkbox" '+(savedOnly?'checked':'')+'>仅看已收藏</label>'}
  </section>
  ${source.length?list.length?`<div class="car-grid library-grid">${list.map(c=>currentRoute==='collection'?`<article class="saved-vehicle">${card(c,'',true)}<button class="copy-tuner remove-saved" data-remove-saved="${c._id}" aria-label="取消收藏 ${esc(c.name)}">取消收藏</button></article>`:card(c,'',true)).join('')}</div>`:vehicleEmpty('没有找到符合条件的车辆'):
   '<div class="placeholder"><h2>暂无收藏车辆</h2><p>进入车辆详情，点击收藏车辆，随后可在这里搜索和管理。</p><button class="copy-tuner" data-route="carSelection">浏览车辆库</button></div>'}`;
 $('#openBrand').onclick=openBrand;
 $('#advanced').onclick=()=>{advancedOpen=!advancedOpen;$('#advancedVehicleFilters').hidden=!advancedOpen;$('#advanced').setAttribute('aria-expanded',String(advancedOpen));syncVehicleHistory();};
 $('#vehicleCountry').onchange=event=>{vehicleCountry=event.target.value;renderLibrary();syncVehicleHistory();$('#vehicleCountry').focus();};
 if($('#savedOnly'))$('#savedOnly').onchange=event=>{savedOnly=event.target.checked;renderLibrary();syncVehicleHistory();$('#savedOnly').focus();};
 bindVehicleTools('carSearch',value=>libraryQuery=value,renderLibrary);bindReset();
};
renderBrands=function(query){
 const source=currentRoute==='carRecommendation'?cars.filter(c=>c.tuningData.some(t=>mode==='online'?t.online:['漂移','直线加速'].includes(t.scenario))):cars;
 const brands=[...new Set(source.map(c=>c.brand))].sort().filter(brand=>brand.toLowerCase().includes(query.trim().toLowerCase()));
 $('#brandList').innerHTML=`<button data-brand="">全部车厂 ${!filters.brand?'✓':''}</button>`+brands.map(brand=>`<button data-brand="${esc(brand)}">${esc(brand)} ${filters.brand===brand?'✓':'›'}</button>`).join('')+(brands.length?'':'<p role="status">没有匹配的车厂</p>');
};

const renderBasicTuning=renderTuning;
renderTuning=function(){
 renderBasicTuning();
 const matching=cars.filter(c=>(!filters.brand||c.brand===filters.brand)&&c.tuningData.some(tuneMatches)&&matchesVehicleText(c,vehicleQuery));
 const container=$('.recommendation-list');
 container.innerHTML=tiers.map(tier=>{
  const list=sortVehicles(matching.filter(c=>c.tuningData.some(t=>tuneMatches(t)&&t.tier===tier)));
  return list.length?`<section class="tier-section"><div class="tier-heading tier-${tier}"><h2>${tier==='常规'?'常规调校':tier+' 梯队'}</h2><span>${list.length} 辆</span></div><div class="car-grid">${list.map(c=>card(c,tier)).join('')}</div></section>`:'';
 }).join('')||vehicleEmpty('没有找到匹配的调校');
 $('.web-modebar>span').textContent=matching.length+' 辆匹配车辆 · 演示数据';
 $('.web-modebar').insertAdjacentHTML('afterend',vehicleToolbar(vehicleQuery,'tuningSearch',matching.length));
 bindVehicleTools('tuningSearch',value=>vehicleQuery=value,renderTuning);bindReset();
};
// Tuning cards show only the tune tags for the selected mode, filters and tier.
const renderVehicleCard=card;
card=function(car,tier='',library=false){
 if(library)return renderVehicleCard(car,tier,true);
 const tunes=car.tuningData.filter(t=>tuneMatches(t)&&(!tier||t.tier===tier));
 return renderVehicleCard({...car,tuningData:tunes},tier,true);
};
const renderBasicDetail=renderDetail;
renderDetail=function(){
 renderBasicDetail();if(!detailCar)return;
 $('#subcontent').insertAdjacentHTML('afterbegin','<div class="vehicle-detail-actions"><button class="copy-tuner" id="backToVehicles">返回车辆列表</button><button class="copy-tuner" id="shareVehicle">复制详情链接</button></div>');
 $('#backToVehicles').onclick=()=>navigate(['carSelection','collection','carRecommendation'].includes(detailOrigin)?detailOrigin:'carSelection');
 $('#shareVehicle').onclick=()=>copy(location.href);
 if($('#showAll')){const toggle=$('#showAll').onclick;$('#showAll').onclick=()=>{toggle();syncVehicleHistory();};}
};
const renderVehiclePage=render;
render=function(){if(currentRoute==='collection')renderLibrary();else renderVehiclePage();syncVehicleHistory();};
document.addEventListener('click',event=>{
 const remove=event.target.closest('[data-remove-saved]');
 if(remove){collected.delete(remove.dataset.removeSaved);saveCollect();renderLibrary();refreshHomeSaved();notify('已取消收藏');}
 syncVehicleHistory();
});

// Shareable hashes and history snapshots retain filters and detail context.
function vehicleState(){
 return {route:currentRoute,mode,filters:{...filters},query:vehicleQuery,libraryQuery,sort:vehicleSort,country:vehicleCountry,savedOnly,advancedOpen,car:detailCar?detailCar._id:'',origin:detailOrigin,tier:detailTier,showAll,tuner:render.tuner||''};
}
function vehicleHash(state){
 if(!state.route)return location.pathname+location.search;
 const p=new URLSearchParams();
 if(['carRecommendation','carDetail'].includes(state.route)&&state.mode!=='online')p.set('mode',state.mode);
 if(['carSelection','collection','carRecommendation','carDetail'].includes(state.route)){
  for(const [key,value] of Object.entries(state.filters))if(value)p.set(key,value);
  if(state.sort!=='default')p.set('sort',state.sort);
  if(state.route==='carRecommendation'){if(state.query)p.set('q',state.query);}
  else if(state.libraryQuery)p.set('q',state.libraryQuery);
  if(state.route==='carDetail'&&state.query)p.set('tuningQ',state.query);
  if(state.country)p.set('country',state.country);
  if(state.savedOnly)p.set('saved','1');
 }
 if(state.route==='carDetail'){
  p.set('id',state.car);p.set('from',state.origin||'carSelection');
  if(state.tier)p.set('tier',state.tier);if(state.showAll)p.set('all','1');
 }
 if(state.route==='tunerProfile'&&state.tuner)p.set('name',state.tuner);
 return '#'+state.route+(p.size?'?'+p.toString():'');
}
function syncVehicleHistory(){
 if(!vehicleHistoryReady)return;
 const state=vehicleState();history.replaceState(state,'',vehicleHash(state));
}
let vehicleHistoryReady=false;
const navigateVehiclePage=navigate;
navigate=function(route,push=true){
 if(route==='carSelection'&&currentRoute!== 'carDetail'){vehicleCountry='';savedOnly=false;}
 if(route==='collection'&&currentRoute!=='carDetail'){filters={brand:'',level:'',scenario:'',driveType:''};libraryQuery='';vehicleCountry='';savedOnly=false;}
 navigateVehiclePage(route,push);syncVehicleHistory();
};
function stateFromHash(){
 const [route,query='']=location.hash.slice(1).split('?'),p=new URLSearchParams(query);
 return {route:route||'',mode:p.get('mode'),filters:Object.fromEntries(['brand','level','scenario','driveType'].map(key=>[key,p.get(key)||''])),query:route==='carRecommendation'?p.get('q')||'':p.get('tuningQ')||'',libraryQuery:route==='carRecommendation'?'':p.get('q')||'',sort:p.get('sort'),country:p.get('country'),savedOnly:p.get('saved')==='1',car:p.get('id'),origin:p.get('from'),tier:p.get('tier'),showAll:p.get('all')==='1',tuner:p.get('name')};
}
function restoreVehicleState(state){
 vehicleHistoryReady=false;
 const route=state.route===''||Object.hasOwn(routeDescriptions,state.route)?state.route:'';
 mode=state.mode==='all'?'all':'online';
 const f=state.filters||{};
 filters={brand:cars.some(c=>c.brand===f.brand)?f.brand:'',level:levels.includes(f.level)?f.level:'',scenario:modeOptions().scenarios.includes(f.scenario)?f.scenario:'',driveType:modeOptions().drives.includes(f.driveType)?f.driveType:''};
 if(!scenarios().includes(filters.scenario))filters.scenario='';
 vehicleQuery=String(state.query||'').slice(0,100);libraryQuery=String(state.libraryQuery||'').slice(0,100);
 vehicleSort=['name','level','tunes'].includes(state.sort)?state.sort:'default';
 vehicleCountry=cars.some(c=>c.country===state.country)?state.country:'';savedOnly=state.savedOnly===true;advancedOpen=state.advancedOpen===true||!!vehicleCountry||savedOnly;
 detailCar=cars.find(c=>c._id===state.car)||null;
 detailOrigin=['carRecommendation','carSelection','collection','globalSearch'].includes(state.origin)?state.origin:'carSelection';
 detailTier=tiers.includes(state.tier)?state.tier:'';showAll=state.showAll===true;
 render.tuner=typeof state.tuner==='string'?state.tuner:'';
 const missing=route==='carDetail'&&!detailCar;
 navigateVehiclePage(missing?'carSelection':route,false);
 vehicleHistoryReady=true;syncVehicleHistory();
 if(missing)notify('找不到这台车辆，已返回车辆库');
}
window.onpopstate=event=>restoreVehicleState(event.state&&Object.hasOwn(event.state,'filters')?event.state:stateFromHash());
window.addEventListener('hashchange',()=>{if((currentRoute?vehicleHash(vehicleState()):'')!==location.hash)restoreVehicleState(stateFromHash());});
restoreVehicleState(stateFromHash());
