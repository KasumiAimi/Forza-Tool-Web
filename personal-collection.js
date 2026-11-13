const collectionTabs=[
 ['vehicles','车辆收藏','carSelection','浏览车辆库'],
 ['creators','创作者收藏','ranking','浏览创作者榜'],
 ['liveries','涂装收藏','liveryCenter','浏览涂装中心'],
 ['blueprints','蓝图收藏','blueprintRecommendation','浏览蓝图推荐']
];
let collectionTab='vehicles';
const collectionFacet={creators:'',liveries:'',blueprints:''};
function collectionCreatorTypes(creator){
 return [
  homeUpdates.some(work=>work.creatorId===creator.id&&work.type==='tuning')?'车辆':null,
  blueprintCollection.records.some(work=>work.author===creator.name)?'蓝图':null,
  homeUpdates.some(work=>work.creatorId===creator.id&&work.type==='livery')||liveryCenterWorks.some(work=>work.artist===creator.name)?'涂装':null
 ].filter(Boolean);
}
function renderCollection(){
 const root=$('#subcontent');
 const data={
  vehicles:libraryPreviewCars.filter(car=>collected.has(car._id)),
  creators:creators.filter(creator=>followed.has(creator.id)),
  liveries:liveryCenterWorks.filter(work=>liveryCenterSaved.has(work.id)),
  blueprints:blueprintCollection.records.filter(work=>blueprintCollection.saved.has(work.id))
 };
 const [,label,destination,link]=collectionTabs.find(tab=>tab[0]===collectionTab);
 const choices={creators:['车辆','蓝图','涂装'],liveries:liveryCenterStyles,blueprints:['公路','泥地','漂移','拍照','趣味']};
 const option=(value,selected)=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(value)}</option>`;
 const select=(name,title,all,values,selected)=>`<label>${title}<select data-collection-filter="${name}"><option value="">${all}</option>${values.map(value=>option(value,selected)).join('')}</select></label>`;
 const tunes=data.vehicles.flatMap(car=>car.tuningData);
 const toolbar=collectionTab==='vehicles'?
  `<label>搜索车辆<input id="carSearch" type="search" maxlength="100" value="${esc(libraryQuery)}" placeholder="车名或品牌"></label>
  ${select('level','调校等级','全部等级',levels.filter(level=>tunes.some(tune=>tune.level===level)||filters.level===level),filters.level)}
  ${select('scenario','使用场景','全部场景',[...new Set([...tunes.map(tune=>tune.scenario),filters.scenario].filter(Boolean))],filters.scenario)}`:
  select(collectionTab,{creators:'作品类型',liveries:'涂装风格',blueprints:'使用场景'}[collectionTab],'全部',choices[collectionTab],collectionFacet[collectionTab]);
 root.innerHTML=`<section class="pc-shell" aria-label="个人资料与收藏"><div class="pc-profile-summary"><span class="cp-avatar" aria-hidden="true">${esc(nick[0]||'车')}</span><div><strong>${esc(nick)}</strong><p>个人资料 · 小程序账号关联待接入</p></div><button type="button" class="copy-tuner" id="pc-edit-name">修改昵称</button></div>
  <div class="pc-tabs" role="tablist" aria-label="收藏分区">${collectionTabs.map(([key,title])=>`<button type="button" role="tab" id="pc-tab-${key}" data-collection-tab="${key}" aria-controls="pc-panel" aria-selected="${key===collectionTab}" tabindex="${key===collectionTab?0:-1}">${title}<small>${data[key].length}</small></button>`).join('')}</div>
  <section id="pc-panel" role="tabpanel" aria-labelledby="pc-tab-${collectionTab}">
   <div class="pc-tools">${toolbar}<span class="pc-count" role="status"></span><button class="copy-tuner pc-browse" data-route="${destination}">${link} ↗</button></div>
   <div class="pc-results"></div>
  </section>
 </section>`;
 const unsave=(id,text)=>`<button type="button" class="copy-tuner" data-collection-remove="${esc(id)}">${text}</button>`;
 function paint(){
  const facet=collectionFacet[collectionTab];
  const matches=data[collectionTab].filter(item=>{
   switch(collectionTab){
    case 'vehicles':return matchesVehicleText(item,libraryQuery)&&(!filters.level&&!filters.scenario||item.tuningData.some(tune=>(!filters.level||tune.level===filters.level)&&(!filters.scenario||tune.scenario===filters.scenario)));
    case 'creators':return !facet||collectionCreatorTypes(item).includes(facet);
    case 'liveries':return !facet||item.style===facet;
    default:return !facet||item.type.includes(facet);
   }
  });
  root.querySelector('.pc-browse').hidden=!matches.length;
  root.querySelector('.pc-count').textContent=`显示 ${matches.length} / ${data[collectionTab].length}`;
  const cards=matches.map(item=>{
   switch(collectionTab){
    case 'vehicles':return `<article class="saved-vehicle"><span class="pc-tune-state">${item.tuningData.length?'有调校':'无调校'}</span>${cars.includes(item)?card(item,'',true):card(item,'',true).replace('data-car=','data-garage-car=')}<button class="copy-tuner remove-saved" data-remove-saved="${esc(item._id)}" aria-label="取消收藏 ${esc(item.name)}">取消收藏</button></article>`;
    case 'creators':return `<article class="pc-card"><button type="button" class="pc-creator" data-tuner="${esc(item.name)}"><span aria-hidden="true">${esc(item.name[0])}</span><strong>${esc(item.name)}</strong> ↗</button><p>${esc(collectionCreatorTypes(item).join(' · '))}</p>${unsave(item.id,'取消关注')}</article>`;
    case 'liveries':return `<article class="pc-card"><button type="button" class="lc-work-open" data-open-livery="${esc(item.id)}" aria-label="查看 ${esc(item.title)} 的车辆涂装">${renderLiveryToybox(item,0)}</button><h3>${esc(item.title)}</h3><p>${esc(item.brand+' '+item.car+' · '+item.artist)}</p><p>${esc(item.style+' · '+item.tags.join(' · '))}</p>${unsave(item.id,'取消收藏')}</article>`;
    default:return `<article class="pc-card"><button type="button" data-open-blueprint="${esc(item.id)}" aria-label="查看 ${esc(item.name)}"><img src="assets/home/${esc(item.image)}" alt=""><h3>${esc(item.name)}</h3></button><p>${esc(item.author+' · '+item.type.join(' / '))}</p><div class="pc-actions"><button class="copy-tuner" data-copy="${esc(item.code)}">复制蓝图代码</button>${unsave(item.id,'取消收藏')}</div></article>`;
   }
  });
  root.querySelector('.pc-results').innerHTML=cards.length?`<div class="${collectionTab==='vehicles'?'car-grid library-grid':'pc-grid'}">${cards.join('')}</div>`:`<div class="placeholder pc-empty"><h2>${data[collectionTab].length?'没有符合筛选条件的收藏':collectionTab==='vehicles'?'暂无收藏车辆':'暂无'+label}</h2><p>${data[collectionTab].length?'试试调整筛选条件。':'从喜欢的作品开始，收藏后可随时回来查看。'}</p><button class="copy-tuner" data-route="${destination}">${link} ↗</button></div>`;
 }
 root.querySelector('#pc-edit-name').onclick=editName;
 const search=root.querySelector('#carSearch');
 if(search)search.addEventListener('input',()=>{libraryQuery=search.value;paint();syncVehicleHistory();});
 root.querySelectorAll('[data-collection-filter]').forEach(field=>field.onchange=()=>{
  const key=field.dataset.collectionFilter;
  if(collectionTab==='vehicles')filters[key]=field.value;else collectionFacet[key]=field.value;
  paint();syncVehicleHistory();
 });
 const tabs=root.querySelector('.pc-tabs');
 const switchTab=button=>{collectionTab=button.dataset.collectionTab;renderCollection();document.querySelector('#pc-tab-'+collectionTab).focus();};
 tabs.onclick=event=>{const button=event.target.closest('[data-collection-tab]');if(button)switchTab(button);};
 tabs.onkeydown=event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const buttons=[...tabs.querySelectorAll('button')], index=buttons.indexOf(event.target);
  if(index<0)return;
  event.preventDefault();
  switchTab(buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length]);
 };
 root.querySelector('.pc-results').onclick=event=>{
  const button=event.target.closest('[data-collection-remove]');
  if(!button)return;
  const id=button.dataset.collectionRemove;
  if(collectionTab==='creators'){followed.delete(id);saveFollowedCreators();}
  if(collectionTab==='liveries'){liveryCenterSaved.delete(id);writeLocalValue('horizon_web_v2_livery_center_saved',[...liveryCenterSaved]);}
  if(collectionTab==='blueprints')blueprintCollection.remove(id);
  renderCollection();
  document.querySelector('#pc-tab-'+collectionTab).focus();
  notify(collectionTab==='creators'?'已取消关注':'已取消收藏');
 };
 paint();
}
if(currentRoute==='collection')renderCollection();
