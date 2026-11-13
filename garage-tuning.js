// The tuning library uses the garage presentation throughout.
let garageColumns=4;
// Garage-only layout fixtures. Tier/class/tune values are illustrative, not game rankings.
const garageExtraSpecs=[
 ['Ferrari','F8 Tributo','意大利','FH6_Ferrari_F8_Tributo.webp','S2','META','公路','后驱'],
 ['Lamborghini','Huracán EVO','意大利','FH6_Lamborghini_Huracan_EVO.webp','S2','META','公路','四驱'],
 ['McLaren','765LT','英国','FH6_McLaren_765LT.webp','S2','META','公路','后驱'],
 ['Koenigsegg','Jesko','瑞典','FH6_Koenigsegg_Jesko.webp','R','META','公路','后驱'],
 ['Porsche','911 GT3 RS','德国','FH6_Porsche_911_GT3_RS_2023.webp','S2','META','公路','后驱'],
 ['Chevrolet','Corvette Z06','美国','FH6_Chevrolet_Corvette_Z06_2023.webp','S1','T1','公路','后驱'],
 ['Audi','R8 V10 performance','德国','FH6_Audi_R8_V10_performance.webp','S1','T1','公路','四驱'],
 ['Ferrari','488 Pista','意大利','FH6_Ferrari_488_Pista.webp','S1','T1','公路','后驱'],
 ['Lamborghini','Huracán STO','意大利','FH6_Lamborghini_Huracan_STO.webp','S2','T1','公路','后驱'],
 ['BMW','M2 Competition','德国','FH6_BMW_M2_Competition_Coupe.webp','A','T1','公路','后驱'],
 ['Subaru','Impreza 22B','日本','FH6_Subaru_Impreza_22B_STi-Version.webp','A','T2','拉力','四驱'],
 ['Mitsubishi','Lancer Evolution IX','日本','FH6_Mitsubishi_Lancer_Evolution_IX_MR.webp','A','T2','拉力','四驱'],
 ['Hyundai','IONIQ 5 N','韩国','FH6_Hyundai_IONIQ_5_N.webp','S1','T2','公路','四驱'],
 ['Porsche','718 Cayman GT4 RS','德国','FH6_Porsche_718_Cayman_GT4_RS.webp','S1','T2','公路','后驱'],
 ['Volkswagen','Golf R','德国','FH6_Volkswagen_Golf_R_2022.webp','B','T2','公路','四驱'],
 ['Acura','Integra Type-R','日本','FH6_Acura_Integra_Type-R.webp','B','T3','公路','前驱'],
 ['Mazda','MX-5','日本','FH6_Mazda_MX-5_2016.webp','B','T3','公路','后驱'],
 ['Toyota','GR86','日本','FH6_Toyota_GR86.webp','B','T3','公路','后驱'],
 ['Volkswagen','Scirocco R','德国','FH6_Volkswagen_Scirocco_R.webp','B','T3','公路','前驱'],
 ['Hyundai','i30 N','韩国','FH6_Hyundai_i30_N.webp','B','T3','公路','前驱']
];
const garageDemoCars=garageExtraSpecs.map((spec,index)=>{
 const [brand,name,country,image,level,tier,scenario,driveType]=spec;
 const number=index+9;
 return {_id:'garage_demo_'+number,brand,name,country,image:'../official-cars/'+image,officialImage:image,level,driveType,category:'演示车辆',obtainMethod:'仅用于布局预览',description:'车库版新增的布局示例。强度梯队、车辆等级、调校与参数均为演示值，不代表真实游戏数据。',tuningData:[
  {tuningId:'garage_tune_'+number,tier,level,scenario,driveType,online:true,tuner:['Demo Apex','Demo Horizon','Demo Driver'][index%3],likes:16+index*3,tireType:'演示轮胎',description:'布局示例：该梯队和调校信息仅用于预览排版。'},
  {tuningId:'garage_alt_'+number,tier:index%2?'玩具':'常规',level:index%2?'S1':'A',scenario:index%2?'漂移':'直线加速',driveType:'后驱',online:false,tuner:'Demo Drift',likes:3+index,tireType:'演示轮胎',description:'布局示例：仅用于测试模式切换与筛选。'}
 ]};
});
const garageAllCars=[...cars,...garageDemoCars];
const garageOfficialImages={
 demo_0:'FH6_Mercedes-Benz_190E_2.5-16_Evolution_II.webp',
 demo_1:'FH6_Porsche_911_GT3_2021.webp',
 demo_2:'FH6_Toyota_GR_Supra.webp',
 demo_3:'FH6_BMW_M4_Competition_Coupe.webp',
 demo_4:'FH6_Nissan_Skyline_GT-R_V-Spec_1997.webp',
 demo_5:'FH6_Ford_Bronco_Raptor.webp',
 demo_6:'FH6_Mazda_Savanna_RX-7.webp',
 demo_7:'FH6_Honda_Civic_Type_R_2023.webp',
 demo_8:'FH6_Toyota_Sprinter_Trueno_GT_Apex.webp'
};
const garageImage=car=>'assets/official-cars/'+(car.officialImage||garageOfficialImages[car._id]);
function garageEffectiveColumns(){return innerWidth<=520?1:innerWidth<=800?2:innerWidth<=1100?3:innerWidth<=1320?4:garageColumns;}
function garageOption(value,label,current){return `<option value="${esc(value)}" ${current===value?'selected':''}>${esc(label)}</option>`;}
function garageSelect(key,label,values,allLabel){return `<label class="garage-control"><span>${label}</span><select data-garage-filter="${key}" aria-label="${label}">${garageOption('',allLabel,filters[key])}${values.map(value=>garageOption(value,value,filters[key])).join('')}</select></label>`;}
function garageCard(car,tier,matches=car.tuningData.filter(t=>tuneMatches(t)&&t.tier===tier)){
 const tune=matches[0];
 return `<button class="garage-car" type="button" data-garage-car="${car._id}" data-tier="${esc(tier)}" aria-label="查看 ${esc(car.brand+' '+car.name)} 的${esc(tier)}调校">
  <span class="garage-car-title"><strong>${esc(car.brand+' '+car.name)}</strong><span aria-hidden="true">↗</span></span>
  <span class="garage-car-stage"><img src="${garageImage(car)}" alt="${esc(car.brand+' '+car.name)} 官方车图" loading="lazy"></span>
  <span class="garage-car-meta"><b class="garage-class garage-class-${esc(tune.level)}">${esc(tune.level)}</b><span>${esc(tune.scenario)}</span><span>${esc(tune.driveType)}</span><strong>${matches.length} 套调校</strong></span>
 </button>`;
}
function renderGarageRow(rowCars,tier,rowSize,count,selectTunes){
 return `<div class="garage-row" style="--row-columns:${rowSize}"><div class="garage-ceiling-lights" aria-hidden="true">${rowCars.map(()=>'<span class="garage-ceiling-light"></span>').join('')}</div>${count}${rowCars.map(car=>garageCard(car,tier,selectTunes?.(car))).join('')}</div>`;
}
function renderGarageTuning(){
 const matching=sortVehicles(garageAllCars.filter(car=>(!filters.brand||car.brand===filters.brand)&&car.tuningData.some(tuneMatches)&&matchesVehicleText(car,vehicleQuery)));
 const sections=tiers.map(tier=>{
  const list=matching.filter(car=>car.tuningData.some(t=>tuneMatches(t)&&t.tier===tier));
  if(!list.length)return '';
  const title=tier==='常规'?'常规调校':tier==='Overpower'?'Overpower':tier+' 梯队';
  const rowSize=garageEffectiveColumns(),rows=[];
  for(let start=0;start<list.length;start+=rowSize){
   const first=start===0;
   const count=first?`<span class="garage-tier-count" aria-hidden="true">${String(list.length).padStart(2,'0')} 辆</span>`:'';
   const rowCars=list.slice(start,start+rowSize);
   rows.push(renderGarageRow(rowCars,tier,rowSize,count));
  }
  return `<section class="garage-tier" data-tier="${esc(tier)}" id="garage-tier-${encodeURIComponent(tier)}" aria-label="${esc(title)} · ${list.length} 辆"><div class="garage-grid" data-columns="${garageColumns}">${rows.join('')}</div></section>`;
 }).join('');
 $('#subcontent').innerHTML=`<div class="garage-page">
  <div class="garage-intro"><div><span class="garage-kicker">车库调校库 · 演示数据</span><h1>全调校库</h1><p>先选用途，再找车辆。沿着梯队浏览适合下一场比赛的调校。</p></div></div>
  <section class="garage-filter-hud" aria-label="调校筛选"><div class="garage-hud-main"><div class="garage-modes" aria-label="推荐模式"><button type="button" data-mode="online" class="${mode==='online'?'active':''}" aria-pressed="${mode==='online'}">线上竞速</button><button type="button" data-mode="all" class="${mode==='all'?'active':''}" aria-pressed="${mode==='all'}">漂移 / 直线加速</button></div><label class="garage-control garage-search"><span>搜索车辆、品牌或调校师</span><input id="garageSearch" type="search" value="${esc(vehicleQuery)}" placeholder="如 BMW、GT-R、Demo Apex" maxlength="100"></label><span class="garage-count" role="status">${matching.length} 辆匹配车辆</span></div>
  <div class="garage-hud-filters"><div class="garage-control garage-brand"><span>车厂品牌</span><button type="button" id="openBrand">${esc(filters.brand||'全部车厂')} <span aria-hidden="true">⌄</span></button></div>${garageSelect('level','车辆等级',modeOptions().levels,'全部等级')}${garageSelect('scenario','使用场景',scenarios(),'全部场景')}${garageSelect('driveType','驱动形式',modeOptions().drives,'全部驱动')}<label class="garage-control"><span>排序</span><select id="garageSort" aria-label="排序">${[['default','默认顺序'],['name','品牌 / 名称'],['level','车辆等级'],['tunes','调校数量']].map(([key,name])=>garageOption(key,name,vehicleSort)).join('')}</select></label><button type="button" class="garage-clear" id="garageClear">清空筛选</button></div></section>
  <div class="garage-view-controls"><p>官方车辆图片 · 调校和车辆参数仍为本地演示数据</p><div role="group" aria-label="每行车辆数量"><span>每行</span><button type="button" data-garage-columns="4" aria-pressed="${garageColumns===4}">4 辆</button><button type="button" data-garage-columns="5" aria-pressed="${garageColumns===5}">5 辆</button></div></div>
  <nav class="garage-shortcuts" aria-label="梯队快速定位"><span>跳至梯队</span>${tiers.map(tier=>`<button type="button" data-garage-jump="${esc(tier)}">${esc(tier)}</button>`).join('')}</nav><div class="garage-results">${sections||`<div class="garage-empty"><h2>没有找到匹配的调校</h2><p>试试更换关键词或清空筛选。</p><button type="button" id="resetVehicleFilters">清空搜索与筛选</button></div>`}</div>
 </div>`;
 $('#openBrand').onclick=openBrand;
 $('#garageSearch').oninput=event=>{if(event.isComposing)return;const start=event.target.selectionStart,end=event.target.selectionEnd;vehicleQuery=event.target.value;renderGarageTuning();syncVehicleHistory();const input=$('#garageSearch');input.focus();input.setSelectionRange(start,end);};
 $('#garageSearch').oncompositionend=event=>$('#garageSearch').oninput(event);
 document.querySelectorAll('[data-garage-filter]').forEach(select=>select.onchange=event=>{const key=event.target.dataset.garageFilter;filters[key]=event.target.value;if(key==='level'&&!scenarios().includes(filters.scenario))filters.scenario='';renderGarageTuning();syncVehicleHistory();$(`[data-garage-filter="${key}"]`).focus();});
 $('#garageSort').onchange=event=>{vehicleSort=event.target.value;renderGarageTuning();syncVehicleHistory();$('#garageSort').focus();};
 $('#garageClear').onclick=()=>{filters={brand:'',level:'',scenario:'',driveType:''};vehicleQuery='';vehicleSort='default';renderGarageTuning();syncVehicleHistory();};
 if($('#resetVehicleFilters'))$('#resetVehicleFilters').onclick=()=>{filters={brand:'',level:'',scenario:'',driveType:''};vehicleQuery='';vehicleSort='default';renderGarageTuning();syncVehicleHistory();};
}
document.addEventListener('click',event=>{
 const carButton=event.target.closest('[data-garage-car]');
 if(carButton){detailCar=(['carSelection','collection'].includes(currentRoute)?libraryPreviewCars:garageAllCars).find(car=>car._id===carButton.dataset.garageCar);detailOrigin=currentRoute;detailTier=carButton.dataset.tier||'';showAll=false;navigate('carDetail');return;}
 const jump=event.target.closest('[data-garage-jump]');
 if(jump){const target=document.getElementById('garage-tier-'+encodeURIComponent(jump.dataset.garageJump));if(target)target.scrollIntoView({block:'start',behavior:'smooth'});else notify('当前筛选下没有此梯队');return;}
 const columns=event.target.closest('[data-garage-columns]');
 if(columns){garageColumns=Number(columns.dataset.garageColumns)===5?5:4;renderGarageTuning();syncVehicleHistory();}
});
let garageViewportColumns=garageEffectiveColumns();
window.addEventListener('resize',()=>{const next=garageEffectiveColumns();if(next!==garageViewportColumns){garageViewportColumns=next;if(currentRoute==='carRecommendation')renderGarageTuning();}});
