// Creator identity is shared by tuning and livery works. Names remain display/search fields.
const creators=['Demo Apex','Demo Horizon','Demo Driver','Demo Drift'].map((name,index)=>({id:'creator_'+index,name}));
function creatorIdFor(name){return creators.find(creator=>creator.name===name)?.id||'';}
function creatorNameFor(id){return creators.find(creator=>creator.id===id)?.name||'未知创作者';}
followed=new Set([...readLocalIds('horizon_web_v2_followed_creators')].map(value=>creatorIdFor(value)||value).filter(id=>creators.some(creator=>creator.id===id)));
routeDescriptions.tunerProfile=['','创作者主页','关注创作者后，同时接收其调校与涂装更新。'];
function saveFollowedCreators(){writeLocalValue('horizon_web_v2_followed_creators',[...followed]);renderHomeUpdates();}

// Relative dates are demo fixtures only; production must supply server publication/update timestamps.
const demoUpdateDay=new Date();demoUpdateDay.setUTCHours(0,0,0,0);
const demoUpdateTime=(days,hours=1)=>new Date(demoUpdateDay.getTime()-days*86400000-hours*3600000).toISOString();
const homeUpdates=[];
cars.forEach((car,index)=>{
 car.tuningData.forEach((tune,tuneIndex)=>{
  tune.creatorId=creatorIdFor(tune.tuner);
  homeUpdates.push({id:tune.tuningId,type:'tuning',carId:car._id,creatorId:tune.creatorId,updatedAt:demoUpdateTime(index,tuneIndex+1),tune});
 });
 homeUpdates.push({id:'demo_livery_'+index,type:'livery',carId:car._id,creatorId:creators[index%creators.length].id,updatedAt:demoUpdateTime(index,3),title:['赛道条纹','公路巡游','经典赛车'][index%3]+' · 演示涂装'});
});
let homeUpdateType='tuning',homeUpdatesExpanded=false;
const updateHost=$('#homeActivity');
updateHost.innerHTML='<div class="activity-tabs" role="tablist" aria-label="收藏更新分类"><button id="activityTab-tuning" role="tab" aria-controls="activityPanel" data-activity-type="tuning">调校</button><button id="activityTab-livery" role="tab" aria-controls="activityPanel" data-activity-type="livery">涂装</button></div><p class="activity-period">最近 7 天 · 演示更新</p><div id="activityPanel" role="tabpanel" tabindex="0"><p id="activityStatus" role="status" aria-live="polite"></p><div id="activityList"></div></div><button id="expandHomeUpdates" class="activity-expand" aria-controls="activityList" hidden></button>';
function activityTime(iso){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso));}
function renderHomeUpdates(){
 const list=ActivityFeed.select({updates:homeUpdates,carIds:collected,creatorIds:followed,type:homeUpdateType});
 updateHost.querySelectorAll('[data-activity-type]').forEach(button=>{
  const active=button.dataset.activityType===homeUpdateType;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 });
 $('#activityPanel').setAttribute('aria-labelledby','activityTab-'+homeUpdateType);
 const name=homeUpdateType==='tuning'?'调校':'涂装',visible=homeUpdatesExpanded?list:list.slice(0,3);
 $('#activityStatus').textContent=list.length?`共 ${list.length} 条${name}更新，当前显示 ${visible.length} 条`:'';
 $('#activityList').innerHTML=visible.map(update=>{
  const car=cars.find(item=>item._id===update.carId);if(!car)return '';
  const badges=update.type==='tuning'?`<span class="activity-tags tags"><b class="activity-level level-${esc(update.tune.level)}">${esc(update.tune.level)}</b><span>${esc(update.tune.scenario)}</span><b class="tier-chip">${esc(update.tune.tier)}</b></span>`:`<span class="activity-work-name">${esc(update.title)}</span>`;
  const reason=[collected.has(update.carId)?'收藏的车辆':'',followed.has(update.creatorId)?'关注的创作者':''].filter(Boolean).join(' · ');
  return `<button class="activity-item drawer-update" data-update-id="${esc(update.id)}" data-update-type="${update.type}" aria-label="${esc(car.name)}，${update.type==='tuning'?esc(update.tune.level+' · '+update.tune.scenario+' · '+update.tune.tier):esc(update.title)}，查看${name}"><img src="assets/cars/${esc(car.image)}" alt="${esc(car.name)} 演示车辆配图" loading="lazy"><span class="activity-copy"><strong>${esc(car.name)}</strong>${badges}<span class="activity-creator">${esc(creatorNameFor(update.creatorId))}</span><time datetime="${update.updatedAt}">${activityTime(update.updatedAt)} 更新</time><span class="activity-reason">${reason}</span></span></button>`;
 }).join('')||`<div class="activity-empty"><p>最近 7 天暂无${name}更新</p><small>${collected.size||followed.size?'已收藏车辆或关注创作者有新作品时，会显示在这里。':'收藏车辆或关注创作者，即可在这里查看更新。'}</small><button class="copy-tuner" data-route="carSelection">浏览车辆库</button></div>`;
 const toggle=$('#expandHomeUpdates');toggle.hidden=list.length<=3;toggle.setAttribute('aria-expanded',String(homeUpdatesExpanded));
 toggle.textContent=homeUpdatesExpanded?'收起':'展开全部（共 '+list.length+' 条）';
}
function selectHomeUpdateType(type){homeUpdateType=type;homeUpdatesExpanded=false;renderHomeUpdates();}
$('#expandHomeUpdates').onclick=()=>{homeUpdatesExpanded=!homeUpdatesExpanded;renderHomeUpdates();$('#expandHomeUpdates').focus();};
updateHost.querySelector('.activity-tabs').addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();selectHomeUpdateType(event.key==='Home'?'tuning':event.key==='End'?'livery':homeUpdateType==='tuning'?'livery':'tuning');
 $('#activityTab-'+homeUpdateType).focus();
});
const liveryDialog=document.createElement('dialog');liveryDialog.id='liveryUpdateDialog';liveryDialog.setAttribute('aria-labelledby','liveryUpdateTitle');document.body.append(liveryDialog);
function openLiveryUpdate(update){
 const car=cars.find(item=>item._id===update.carId);
 liveryDialog.innerHTML=`<button type="button" class="close dialog-close" id="closeLiveryUpdate" aria-label="关闭涂装详情">×</button><h2 id="liveryUpdateTitle">${esc(update.title)}</h2><img class="activity-livery-image" src="assets/cars/${esc(car.image)}" alt="${esc(car.name)} 演示车辆配图"><p>${esc(car.name)}</p><p>创作者：${esc(creatorNameFor(update.creatorId))}</p><p><time datetime="${update.updatedAt}">${activityTime(update.updatedAt)}</time> 更新</p><p class="vehicle-note">当前为演示作品，图片为车辆配图，正式涂装图片与分享码尚未接入。</p><div class="dialog-actions"><button id="liveryCreator">查看创作者</button><button id="followLiveryCreator">${followed.has(update.creatorId)?'取消关注创作者':'关注创作者'}</button></div>`;
 $('#closeLiveryUpdate').onclick=()=>liveryDialog.close();
 $('#liveryCreator').onclick=()=>{render.tuner=creatorNameFor(update.creatorId);navigate('tunerProfile');};
 $('#followLiveryCreator').onclick=()=>{followed.has(update.creatorId)?followed.delete(update.creatorId):followed.add(update.creatorId);saveFollowedCreators();$('#followLiveryCreator').textContent=followed.has(update.creatorId)?'取消关注创作者':'关注创作者';};
 liveryDialog.showModal();
}
document.addEventListener('click',event=>{
 const tab=event.target.closest('[data-activity-type]');if(tab)selectHomeUpdateType(tab.dataset.activityType);
 const item=event.target.closest('[data-update-id]');if(!item)return;
 const update=homeUpdates.find(entry=>entry.id===item.dataset.updateId&&entry.type===item.dataset.updateType);if(!update)return;
 if(update.type==='livery'){openLiveryUpdate(update);return;}
 detailCar=cars.find(car=>car._id===update.carId);detailOrigin='carRecommendation';detailTier=update.tune.tier;showAll=false;
 mode=update.tune.online?'online':'all';filters={brand:'',level:update.tune.level,scenario:update.tune.scenario,driveType:update.tune.driveType};navigate('carDetail');
});
const refreshSavedWithActivity=refreshHomeSaved;
refreshHomeSaved=function(){refreshSavedWithActivity();renderHomeUpdates();};
const saveCollectedWithActivity=saveCollect;
saveCollect=function(){saveCollectedWithActivity();renderHomeUpdates();};
window.addEventListener('storage',event=>{
 if(event.key===null||event.key==='horizon_web_v2_collected')collected=readLocalIds('horizon_web_v2_collected');
 if(event.key===null||event.key==='horizon_web_v2_followed_creators')followed=readLocalIds('horizon_web_v2_followed_creators');
 renderHomeUpdates();
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHomeUpdates();});
setInterval(()=>{if(!document.hidden&&!currentRoute&&!updateHost.contains(document.activeElement))renderHomeUpdates();},60000);
renderHomeUpdates();
