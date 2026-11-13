// Local skeleton data: official vehicle cutouts are placeholders, not actual livery previews.
const liveryCenterWorks=[
 {id:1,brand:'Toyota',car:'GR Supra RZ',title:'旭日街道',artist:'Mika Studio',style:'二次元',tags:['痛车','粉蓝'],likes:128,image:'FH6_Toyota_GR_Supra.webp'},
 {id:2,brand:'Porsche',car:'911 GT3',title:'复古耐力',artist:'Livery Works',style:'赛车',tags:['复古','条纹'],likes:96,image:'FH6_Porsche_911_GT3_2021.webp'},
 {id:3,brand:'Mercedes-Benz',car:'190E 2.5-16 Evolution II',title:'银箭致敬',artist:'Nord Design',style:'现实',tags:['原厂风','金属银'],likes:84,image:'FH6_Mercedes-Benz_190E_2.5-16_Evolution_II.webp'},
 {id:4,brand:'Nissan',car:'Skyline GT-R V-Spec',title:'城市夜行',artist:'Akira',style:'二次元',tags:['街头','黑白'],likes:72,image:'FH6_Nissan_Skyline_GT-R_V-Spec_1997.webp'},
 {id:5,brand:'Ferrari',car:'F8 Tributo',title:'意式红线',artist:'Rosso Lab',style:'赛车',tags:['极简','红色'],likes:65,image:'FH6_Ferrari_F8_Tributo.webp'},
 {id:6,brand:'BMW',car:'M4 Competition',title:'山路周末',artist:'Route 44',style:'现实',tags:['极简','双色'],likes:51,image:'FH6_BMW_M4_Competition_Coupe.webp'},
 {id:7,brand:'Honda',car:'Civic Type R',title:'赛道练习',artist:'Pit Lane',style:'赛车',tags:['编号','白色'],likes:43,image:'FH6_Honda_Civic_Type_R_2023.webp'},
 {id:8,brand:'Lamborghini',car:'Huracán EVO',title:'蓝调电台',artist:'Blue Note',style:'二次元',tags:['蓝色','痛车'],likes:37,image:'FH6_Lamborghini_Huracan_EVO.webp'}
].map(work=>({...work,code:'000 000 '+String(200+work.id),id:'livery-center-demo-'+work.id}));
liveryCenterWorks.forEach(work=>{if(!creators.some(creator=>creator.name===work.artist))creators.push({id:({'Mika Studio':'ranking_creator_5','Nord Design':'ranking_creator_6'})[work.artist]||'livery_creator_'+work.id,name:work.artist});});

const liveryBrandAliases={Toyota:'丰田',Porsche:'保时捷','Mercedes-Benz':'奔驰 梅赛德斯',Nissan:'日产',Ferrari:'法拉利',BMW:'宝马',Honda:'本田',Lamborghini:'兰博基尼'};
const liveryCenterStyles=['二次元','现实','赛车'];
const liveryCenterIds=new Set(liveryCenterWorks.map(work=>work.id));
const liveryCenterLiked=new Set([...readLocalIds('horizon_web_v2_livery_center_liked')].filter(id=>liveryCenterIds.has(id)));
const liveryCenterSaved=new Set([...readLocalIds('horizon_web_v2_livery_center_saved')].filter(id=>liveryCenterIds.has(id)));
const liveryCenterState={query:'',brand:'',tag:'',style:'',open:''};
let liveryCenterController;
function liverySearchText(value){return String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase();}
function renderLiveryToybox(work,index,showCarName=false){
 return `<div class="lc-preview-image lc-toybox lc-toy-color-${index%4}"><div class="lc-toy-top"><span>涂装作品</span><b class="lc-photo-style">${work.style}</b></div><div class="lc-toy-cavity"><div class="lc-toy-back"></div><div class="lc-toy-leftwall"></div><div class="lc-toy-rightwall"></div><div class="lc-toy-roof"></div><div class="lc-toy-floor"><i class="lc-toy-floor-line one"></i><i class="lc-toy-floor-line two"></i><i class="lc-toy-floor-line three"></i></div></div><div class="lc-toy-underbody"></div><div class="lc-toy-wheel-contact rear"></div><div class="lc-toy-wheel-contact front"></div><img src="assets/official-cars/${work.image}" alt="${esc(work.brand+' '+work.car)} 官方车图占位" loading="lazy">${showCarName==='split'?`<span class="lc-car-overlay"><em>${esc(work.title)}</em></span>`:showCarName?`<strong class="home-livery-car-name">${esc(work.brand+' '+work.car)}</strong>`:''}<div class="lc-toy-led-frame"><i></i><b></b></div><div class="lc-toy-glass"></div><div class="lc-toy-side"><span>${esc(work.brand)}</span></div><div class="lc-toy-lip"><span>编号 ${String(index+1).padStart(2,'0')}</span><small class="lc-photo-note">预览占位</small></div><div class="lc-toy-corner lc-toy-tl"></div><div class="lc-toy-corner lc-toy-tr"></div><div class="lc-toy-corner lc-toy-bl"></div><div class="lc-toy-corner lc-toy-br"></div></div>`;
}
function renderLiveryCenter(){
 liveryCenterController?.abort();
 liveryCenterController=new AbortController();
 const signal=liveryCenterController.signal;
 const root=document.querySelector('#subcontent'),state=liveryCenterState,data=liveryCenterWorks;
 const brands=[...new Set(data.map(work=>work.brand))].sort((a,b)=>a.localeCompare(b,'en'));
 const tagCounts=new Map();
 data.forEach(work=>new Set([work.style,...work.tags]).forEach(tag=>tagCounts.set(tag,(tagCounts.get(tag)||0)+1)));
 const tags=[...tagCounts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-CN'));
 const heart='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17 3.2 10.7C-1 6.4 5.1.8 10 5.2 14.9.8 21 6.4 16.8 10.7Z"/></svg>';
 const bookmark='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.5h10v15l-5-3.2-5 3.2Z"/></svg>';
 root.innerHTML=`<section class="lc-layout" aria-label="涂装作品浏览"><div class="lc-filter"><div class="lc-filter-top"><label class="lc-field"><span>搜索作品</span><div class="lc-search-wrap"><span aria-hidden="true">⌕</span><input id="lcSearch" type="search" maxlength="100" value="${esc(state.query)}" aria-label="搜索车辆、品牌或 tag" placeholder="搜索车辆、品牌、tag 关键词…"></div></label><div class="lc-field"><span>车辆品牌</span><button type="button" id="lcBrandToggle" aria-expanded="false" aria-controls="lcBrandMenu"><span>全部品牌</span><span aria-hidden="true">⌄</span></button></div><div class="lc-field"><span>作品标签</span><button type="button" id="lcTagToggle" aria-expanded="false" aria-controls="lcTagMenu"><span>全部 tag</span><span aria-hidden="true">⌄</span></button></div><button type="button" class="lc-clear" data-lc-clear>清空筛选</button></div><div class="lc-style-row"><span>风格</span><div class="lc-style-buttons" role="group" aria-label="涂装风格"><span class="lc-style-indicator" aria-hidden="true"></span>${['全部风格',...liveryCenterStyles].map((name,index)=>`<button type="button" data-lc-style="${index?name:''}" aria-pressed="${!index}">${name}</button>`).join('')}</div><small>源于玩家，用于玩家</small></div><section class="lc-popover lc-brand-popover" id="lcBrandMenu" aria-label="品牌选择" hidden></section><section class="lc-popover lc-tag-popover" id="lcTagMenu" aria-label="标签选择" hidden></section></div><div class="lc-active-tag" aria-live="polite"></div><div class="lc-results-heading"><div class="lc-results-left"><h2 class="lc-display-heading">把喜欢的涂装，收进展示盒。</h2><span class="lc-result-count" role="status" aria-live="polite"></span><button type="button" class="lc-mobile-clear" data-lc-clear>清空筛选</button></div><small>虚拟作品 · 官方车图仅作预览占位</small></div><div class="lc-gallery"></div></section>`;
 const brandMenu=root.querySelector('#lcBrandMenu'),tagMenu=root.querySelector('#lcTagMenu');
 const positionPopover=()=>{
  if(!state.open)return;
  const panel=state.open==='brand'?brandMenu:tagMenu;
  const trigger=root.querySelector(state.open==='brand'?'#lcBrandToggle':'#lcTagToggle');
  const field=root.querySelector('.lc-filter').getBoundingClientRect(),anchor=trigger.getBoundingClientRect();
  const width=Math.min(state.open==='brand'?490:510,field.width-24);
  panel.style.width=width+'px';panel.style.maxWidth='none';panel.style.boxSizing='border-box';panel.style.right='auto';
  panel.style.left=Math.max(12,Math.min(anchor.right-field.left-width,field.width-width-12))+'px';
  panel.style.top=(anchor.bottom-field.top+8)+'px';
  panel.style.maxHeight=Math.max(170,Math.min(440,innerHeight-anchor.bottom-18))+'px';
 };
 const updateStyleIndicator=()=>{
  const group=root.querySelector('.lc-style-buttons');
  if(!group)return;
  const active=group.querySelector('[data-lc-style][aria-pressed="true"]');
  if(!active)return;
  group.style.setProperty('--lc-indicator-x',active.offsetLeft+'px');
  group.style.setProperty('--lc-indicator-width',active.offsetWidth+'px');
 };
 const renderControls=()=>{
  root.querySelector('#lcBrandToggle>span').textContent=state.brand||'全部品牌';
  root.querySelector('#lcTagToggle>span').textContent=state.tag||'全部 tag';
  root.querySelector('.lc-active-tag').innerHTML=state.tag?'<span>已选标签 # '+esc(state.tag)+'</span> <button type="button" data-lc-clear-tag>清除 ×</button>':'';
  root.querySelectorAll('[data-lc-style]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lcStyle===state.style)));
  updateStyleIndicator();
  root.querySelector('#lcBrandToggle').toggleAttribute('data-active',!!state.brand);
  root.querySelector('#lcTagToggle').toggleAttribute('data-active',!!state.tag);
  root.querySelector('#lcBrandToggle').setAttribute('aria-expanded',String(state.open==='brand'));
  root.querySelector('#lcTagToggle').setAttribute('aria-expanded',String(state.open==='tag'));
  brandMenu.hidden=state.open!=='brand';tagMenu.hidden=state.open!=='tag';
  brandMenu.innerHTML=`<div class="lc-popover-heading"><strong>选择车辆品牌</strong><small>按名称首字母 A–Z 排序</small></div><button type="button" class="lc-all-choice" data-lc-brand="" aria-pressed="${!state.brand}">全部品牌 · ${data.length} 件</button><div class="lc-brand-grid">${brands.map(brand=>`<button type="button" class="lc-brand-choice" data-lc-brand="${esc(brand)}" aria-pressed="${state.brand===brand}"><i aria-hidden="true">${brand[0]}</i><span>${esc(brand)}</span><small>${data.filter(work=>work.brand===brand).length} 件</small></button>`).join('')}</div>`;
  tagMenu.innerHTML=`<div class="lc-popover-heading"><strong>全部 tag</strong><small>按作品使用热度排序 · ${tags.length} 个</small></div><button type="button" class="lc-all-choice" data-lc-tag="" aria-pressed="${!state.tag}">全部标签</button><div class="lc-tag-grid">${tags.map(([tag,count])=>`<button type="button" class="lc-tag-choice" data-lc-tag="${esc(tag)}" aria-pressed="${state.tag===tag}"><span>${esc(tag)}</span><small>${count}</small></button>`).join('')}</div>`;
  positionPopover();
 };
 const renderCards=()=>{
  const terms=liverySearchText(state.query.trim()).split(/\s+/).filter(Boolean);
  const list=data.filter(work=>{
   const search=liverySearchText([work.brand,liveryBrandAliases[work.brand]||'',work.car,work.title,work.artist,work.style,...work.tags].join(' '));
   return (!state.brand||work.brand===state.brand)&&(!state.style||work.style===state.style)&&(!state.tag||[work.style,...work.tags].includes(state.tag))&&terms.every(term=>search.includes(term));
  });
  root.querySelector('.lc-result-count').innerHTML=`<strong>${list.length}</strong> 件涂装作品`;

  root.querySelector('.lc-gallery').innerHTML=list.map((work,index)=>`<article class="lc-card" data-lc-work="${work.id}"><button type="button" class="lc-work-open" data-open-livery="${work.id}" aria-label="查看 ${esc(work.title)} 的车辆涂装">${renderLiveryToybox(work,index,'split')}</button><div class="lc-card-copy"><div class="lc-title-row"><div class="lc-car-line"><strong>${esc(work.brand)}</strong><span aria-hidden="true">·</span><span>${esc(work.car)}</span></div><span class="lc-card-actions"><button type="button" data-lc-like="${work.id}" aria-label="${liveryCenterLiked.has(work.id)?'取消点赞':'点赞'} ${esc(work.title)}" aria-pressed="${liveryCenterLiked.has(work.id)}">${heart}<span>${work.likes+(liveryCenterLiked.has(work.id)?1:0)}</span></button><button type="button" data-lc-save="${work.id}" aria-label="${liveryCenterSaved.has(work.id)?'取消收藏':'收藏'} ${esc(work.title)}" aria-pressed="${liveryCenterSaved.has(work.id)}">${bookmark}</button></span></div><div class="lc-share-code"><span>涂装代码：<strong>${esc(work.code)}</strong></span><button type="button" data-copy="${esc(work.code)}" aria-label="复制 ${esc(work.title)} 的涂装代码">复制</button></div><div class="lc-card-footer"><div class="lc-card-tags">${work.tags.map(tag=>`<button type="button" data-lc-tag="${esc(tag)}"># ${esc(tag)}</button>`).join('')}</div><button type="button" class="lc-artist" data-tuner="${esc(work.artist)}"><i aria-hidden="true">${work.artist[0]}</i><span><small>涂装师</small><strong>${esc(work.artist)}</strong></span></button></div></div></article>`).join('')||'<div class="lc-empty"><p>没有匹配作品，试试调整关键词或筛选条件。</p><button type="button" data-lc-clear>清空筛选</button></div>';

 };
 const focus=selector=>root.querySelector(selector)?.focus({preventScroll:true});
 const closePopover=(returnFocus=false)=>{
  if(!state.open)return;
  const previous=state.open;state.open='';renderControls();
  if(returnFocus)focus(previous==='brand'?'#lcBrandToggle':'#lcTagToggle');
 };
 root.querySelector('#lcSearch').addEventListener('input',event=>{state.query=event.target.value;renderCards();},{signal});
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!button.closest('.lc-layout'))return;
  if(button.id==='lcBrandToggle'||button.id==='lcTagToggle'){
   const type=button.id==='lcBrandToggle'?'brand':'tag';state.open=state.open===type?'':type;renderControls();return;
  }
  if(button.hasAttribute('data-lc-brand')){state.brand=button.dataset.lcBrand;state.open='';renderControls();renderCards();focus('#lcBrandToggle');return;}
  if(button.hasAttribute('data-lc-tag')){if(button.closest('.lc-card-tags')){state.query='';state.brand='';state.style='';root.querySelector('#lcSearch').value='';root.querySelector('.lc-filter').scrollIntoView({block:'start',behavior:'smooth'});}state.tag=button.dataset.lcTag;state.open='';renderControls();renderCards();focus('#lcTagToggle');return;}
  if(button.hasAttribute('data-lc-clear-tag')){state.tag='';renderControls();renderCards();focus('#lcTagToggle');return;}
  if(button.hasAttribute('data-lc-style')){state.style=button.dataset.lcStyle;closePopover();renderControls();renderCards();return;}
  if(button.hasAttribute('data-lc-clear')){
   Object.assign(state,{query:'',brand:'',tag:'',style:'',open:''});root.querySelector('#lcSearch').value='';renderControls();renderCards();focus('#lcSearch');return;
  }
  for(const [attribute,set,key] of [['data-lc-like',liveryCenterLiked,'horizon_web_v2_livery_center_liked'],['data-lc-save',liveryCenterSaved,'horizon_web_v2_livery_center_saved']]){
   if(!button.hasAttribute(attribute))continue;
   const id=button.getAttribute(attribute);if(!liveryCenterIds.has(id))return;
   set.has(id)?set.delete(id):set.add(id);writeLocalValue(key,[...set]);renderCards();focus(`[${attribute}="${id}"]`);return;
  }
 },{signal});
 root.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.open){event.preventDefault();event.stopPropagation();closePopover(true);return;}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const trigger=event.target.closest('#lcBrandToggle,#lcTagToggle');
  if(trigger){
   event.preventDefault();state.open=trigger.id==='lcBrandToggle'?'brand':'tag';renderControls();
   const buttons=[...(state.open==='brand'?brandMenu:tagMenu).querySelectorAll('button')];
   buttons[event.key==='ArrowUp'||event.key==='End'?buttons.length-1:0].focus();return;
  }
  const panel=event.target.closest('.lc-popover');if(!panel)return;
  event.preventDefault();const buttons=[...panel.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);
  buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();
 },{signal});
 const outside=event=>{if(state.open&&!event.target.closest('.lc-popover,#lcBrandToggle,#lcTagToggle'))closePopover();};
 document.addEventListener('click',outside,{signal});document.addEventListener('focusin',outside,{signal});
 window.addEventListener('resize',()=>{positionPopover();updateStyleIndicator();},{signal});
 renderControls();renderCards();requestAnimationFrame(updateStyleIndicator);
}
const renderBeforeLiveryCenter=render;
render=function(){
 renderBeforeLiveryCenter();
 const active=currentRoute==='liveryCenter';
 document.querySelector('#subpage').classList.toggle('livery-center-active',active);
 if(active)renderLiveryCenter();else{liveryCenterController?.abort();liveryCenterState.open='';}
};
render.tuner=renderBeforeLiveryCenter.tuner;
function leaveLiveryCenter(){
 if(currentRoute==='liveryCenter')return;
 liveryCenterController?.abort();liveryCenterState.open='';
 document.querySelector('#subpage').classList.remove('livery-center-active');
}
onAfterNavigate(leaveLiveryCenter);
window.addEventListener('popstate',leaveLiveryCenter);
window.addEventListener('hashchange',leaveLiveryCenter);
if(currentRoute==='liveryCenter'||currentRoute==='carDetail')render();

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-open-livery],[data-open-blueprint]');
 if(!button)return;
 if(button.dataset.openBlueprint){blueprintCollection.open(button.dataset.openBlueprint);return;}
 const work=liveryCenterWorks.find(item=>item.id===button.dataset.openLivery);
 const car=work&&libraryPreviewCars.find(item=>garageImage(item)==='assets/official-cars/'+work.image);
 if(!car){notify('暂未找到对应车辆');return;}
 selectedLiveryWorkId=work.id;detailCar=car;detailOrigin=currentRoute==='collection'?'liveryCollection':currentRoute==='tunerProfile'?'liveryProfile':'liveryCenter';detailTier='';showAll=false;navigate('carDetail');
});
