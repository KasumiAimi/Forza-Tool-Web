// Blueprint fixtures and filter rules mirror the mini-program blueprintRecommendation page.
const blueprintCollection=(()=>{
const records=[
 ['山间公路 · 连续弯挑战','Demo Apex',['公路'],'是','否','多人','短途','seasonal-guide-bg-v2.jpg',328,36],
 ['海岸环线 · 蓝色时刻','Demo Horizon',['公路'],'否','是','单人','中途','blueprint-bg-v2.jpg',286,90],
 ['车库漂移练习场','Demo Drift',['漂移'],'是','否','多人','短途','car-library-bg-v2.jpg',241,65],
 ['林间泥地 · 周末拉力','Demo Driver',['泥地'],'否','否','多人','长途','seasonal-guide-bg-v2.jpg',198,41],
 ['光影车库 · 拍照空间','Mika Studio',['拍照'],'否','否','单人','短途','collection-bg-v2.jpg',176,56],
 ['夜间寻路 · 趣味挑战','周末车手',['趣味','拍照'],'否','否','多人','中途','tuning-bg-v2.jpg',152,24]
].map(([name,author,type,isCircuitRace,isRealTrack,playerCount,trackLength,image,likes,collectCount],i)=>({
 id:'bp_demo_'+String(i+1).padStart(3,'0'),name,author,type,isCircuitRace,isRealTrack,playerCount,trackLength,image,likes,collectCount,code:'000000'+String(101+i)
}));
const ids=new Set(records.map(p=>p.id)),liked=new Set([...readLocalIds('horizon_web_v2_blueprint_liked')].filter(id=>ids.has(id))),saved=new Set([...readLocalIds('horizon_web_v2_blueprint_saved')].filter(id=>ids.has(id)));
const state={type:'全部',venue:false,real:false,sort:'hot',player:'',circuit:'',length:''};
const sortOptions=[['hot','最热推荐'],['new','最新上架'],['collect','最多收藏']];
const advancedFields=[['player','适合人数',['单人','多人']],['circuit','赛道形式',['环道','单程']],['length','路线长度',['短途','中途','长途']]];
let draft={},controller,advanced,detail,activeDetail='',opener;
const e=value=>esc(String(value)),formatted=code=>code.replace(/(\d{3})(?=\d)/g,'$1 ');
function matches(){
 // In the mini-program the advanced circuit condition overrides the venue toggle.
 const circuit=state.circuit?(state.circuit==='环道'?'是':'否'):state.venue?'是':'';
 return records.filter(p=>(state.type==='全部'||p.type.includes(state.type))&&(!circuit||p.isCircuitRace===circuit)&&(!state.real||p.isRealTrack==='是')&&(!state.player||p.playerCount===state.player)&&(!state.length||p.trackLength===state.length)).sort((a,b)=>
 state.sort==='new'?b.id.localeCompare(a.id):
 state.sort==='collect'?(b.collectCount+Number(saved.has(b.id)))-(a.collectCount+Number(saved.has(a.id)))||(b.likes+Number(liked.has(b.id)))-(a.likes+Number(liked.has(a.id)))||a.id.localeCompare(b.id):
 (b.likes+Number(liked.has(b.id)))-(a.likes+Number(liked.has(a.id)))||b.id.localeCompare(a.id));
}
const actions=p=>`<div class="bm-actions"><button type="button" data-bm-like="${p.id}" aria-label="${liked.has(p.id)?'取消点赞':'点赞'} ${e(p.name)}" aria-pressed="${liked.has(p.id)}">${liked.has(p.id)?'♥':'♡'} <span>${p.likes+Number(liked.has(p.id))}</span></button><button type="button" data-bm-save="${p.id}" aria-label="${saved.has(p.id)?'取消收藏':'收藏'} ${e(p.name)}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id)?'★':'☆'}</button></div>`;
const badges=p=>`<div class="bm-badges">${p.type.map(t=>`<span>${t}</span>`).join('')}${p.isCircuitRace==='是'?'<span class="bm-feature-badge">场地赛</span>':''}${p.isRealTrack==='是'?'<span class="bm-feature-badge">现实复刻</span>':''}</div>`;
const code=p=>`<div class="bm-code"><span><small>共享码</small><b>${formatted(p.code)}</b></span><button type="button" data-bm-copy="${p.id}" aria-label="复制 ${e(p.name)} 的演示共享码">复制代码 ⧉</button></div>`;
const author=p=>`<button class="bm-author" type="button" data-tuner="${e(p.author)}" aria-label="查看 ${e(p.author)} 的作者主页"><i aria-hidden="true">${e(p.author[0])}</i><span>${e(p.author)}</span><b aria-hidden="true">↗</b></button>`;
function paint(){
 const root=document.querySelector('.bm-layout');if(!root)return;
 root.querySelectorAll('[data-bm-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bmType===state.type)));
 root.querySelectorAll('[data-bm-sort]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bmSort===state.sort)));
 root.querySelector('.bm-sort-label').textContent=sortOptions.find(([id])=>id===state.sort)?.[1]||'最热推荐';
 root.querySelector('.bm-sort-dropdown summary').setAttribute('aria-label','蓝图排序：'+root.querySelector('.bm-sort-label').textContent);
 root.querySelector('[data-bm-venue]').setAttribute('aria-pressed',String(state.venue));root.querySelector('[data-bm-real]').setAttribute('aria-pressed',String(state.real));
 const count=[state.player,state.circuit,state.length].filter(Boolean).length;
 const trigger=root.querySelector('[data-bm-advanced]');trigger.innerHTML=`高级筛选${count?' · '+count:''} <span aria-hidden="true">⌄</span>`;trigger.setAttribute('aria-expanded',String(advanced.open));
 root.querySelector('[data-bm-clear]').hidden=state.type==='全部'&&!state.venue&&!state.real&&!count;
 const list=matches();root.querySelector('.bm-count').textContent=list.length+' 张蓝图';
 root.querySelector('.bm-grid').innerHTML=list.map((p,i)=>`<article class="bm-card" data-bm-card="${p.id}"><div class="bm-image"><button class="bm-cover-link" type="button" data-bm-open="${p.id}" aria-label="查看蓝图：${e(p.name)}"><img src="assets/home/${p.image}" alt="${e(p.name)} 示例封面" loading="${i<3?'eager':'lazy'}"><span class="bm-shade"></span></button><span class="bm-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${actions(p)}<div class="bm-title">${badges(p)}<h2><button type="button" data-bm-open="${p.id}">${e(p.name)}</button></h2>${author(p)}</div></div>${code(p)}</article>`).join('')||'<div class="bm-empty"><h2>暂无符合条件的路线蓝图</h2><p>可以调整分类、特性开关或高级筛选。</p><button type="button" data-bm-clear>清空筛选</button></div>';
}
function drawAdvanced(){
 advanced.innerHTML=`<div class="bm-dialog-heading"><h2 id="bmAdvancedTitle">高级赛道筛选</h2><button type="button" data-bm-close aria-label="关闭高级筛选">×</button></div><div class="bm-drawer-groups">${advancedFields.map(([key,label,options])=>`<section><h3>${label}</h3><div role="group" aria-label="${label}">${options.map(value=>`<button type="button" data-bm-option="${key}" data-value="${value}" aria-pressed="${draft[key]===value}">${value}</button>`).join('')}</div></section>`).join('')}</div><div class="bm-drawer-footer"><button type="button" data-bm-reset-advanced>重置</button><button type="button" data-bm-apply>确定应用</button></div>`;
}
function drawDetail(){
 const p=records.find(p=>p.id===activeDetail);if(!p)return;
 detail.innerHTML=`<div class="bm-dialog-heading"><h2 id="bmDetailTitle">${e(p.name)}</h2><button type="button" data-bm-close aria-label="关闭蓝图预览">×</button></div><img class="bm-detail-image" src="assets/home/${p.image}" alt="${e(p.name)} 示例封面"><div class="bm-detail-copy">${badges(p)}${author(p)}<dl>${[['适合人数',p.playerCount],['赛道形式',p.isCircuitRace==='是'?'环道':'单程'],['路线长度',p.trackLength]].map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>${actions(p)}${code(p)}<p class="bm-detail-note">封面、数据和共享码均为本地占位示例；共享码无法用于游戏下载。</p></div>`;
}
function clear(){Object.assign(state,{type:'全部',venue:false,real:false,player:'',circuit:'',length:''});paint();}
function cleanup(){
 if(currentRoute==='blueprintRecommendation')return;
 controller?.abort();advanced?.close();detail?.close();advanced?.remove();detail?.remove();document.querySelector('#subpage').classList.remove('blueprint-magazine-active');
}
function mount(){
 controller?.abort();advanced?.close();detail?.close();advanced?.remove();detail?.remove();controller=new AbortController();const signal=controller.signal;
 const root=document.querySelector('#subcontent');
 root.innerHTML=`<section class="bm-layout"><div class="bm-filter"><div class="bm-filter-primary"><div class="bm-types" role="group" aria-label="蓝图主分类">${['全部','公路','泥地','漂移','拍照','趣味'].map(t=>`<button type="button" data-bm-type="${t}" aria-pressed="${state.type===t}">${t}</button>`).join('')}</div><div class="bm-features"><button type="button" data-bm-venue aria-pressed="false"><i aria-hidden="true"></i>场地赛</button><button type="button" data-bm-real aria-pressed="false"><i aria-hidden="true"></i>现实复刻</button><button type="button" data-bm-advanced aria-controls="bmAdvanced" aria-expanded="false">高级筛选 ⌄</button></div></div></div><div class="bm-results"><h2>路线之外，还有新的玩法。</h2><span class="bm-count" role="status" aria-live="polite"></span><button type="button" class="bm-clear" data-bm-clear hidden>清空筛选</button><details class="bm-sort-dropdown"><summary aria-label="选择蓝图排序方式"><span>排序：</span><b class="bm-sort-label">${sortOptions.find(([id])=>id===state.sort)[1]}</b><i aria-hidden="true">⌄</i></summary><div class="bm-sort-menu" role="group" aria-label="蓝图排序">${sortOptions.map(([id,label])=>`<button type="button" data-bm-sort="${id}" aria-pressed="${state.sort===id}">${label}</button>`).join('')}</div></details></div><div class="bm-grid"></div><div class="bm-footer"><span>当前展示本地演示内容</span><span>源于玩家，用于玩家</span></div></section>`;
 advanced=document.createElement('dialog');advanced.id='bmAdvanced';advanced.className='bm-advanced-dialog';advanced.setAttribute('aria-labelledby','bmAdvancedTitle');document.body.append(advanced);
 detail=document.createElement('dialog');detail.className='bm-detail-dialog';detail.setAttribute('aria-labelledby','bmDetailTitle');document.body.append(detail);
 const click=event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-bm-type')){state.type=b.dataset.bmType;paint();}
 if(b.hasAttribute('data-bm-venue')){state.venue=!state.venue;paint();}
 if(b.hasAttribute('data-bm-real')){state.real=!state.real;paint();}
 if(b.hasAttribute('data-bm-sort')){state.sort=b.dataset.bmSort;paint();const menu=root.querySelector('.bm-sort-dropdown');menu.open=false;menu.querySelector('summary').focus({preventScroll:true});}
 if(b.hasAttribute('data-bm-clear'))clear();
 if(b.hasAttribute('data-bm-advanced')){opener=b;draft={player:state.player,circuit:state.circuit,length:state.length};drawAdvanced();advanced.showModal();b.setAttribute('aria-expanded','true');}
 if(b.hasAttribute('data-bm-option')){const key=b.dataset.bmOption;draft[key]=draft[key]===b.dataset.value?'':b.dataset.value;advanced.querySelectorAll('[data-bm-option="'+key+'"]').forEach(option=>option.setAttribute('aria-pressed',String(option.dataset.value===draft[key])));}
 if(b.hasAttribute('data-bm-reset-advanced')){draft={player:'',circuit:'',length:''};Object.assign(state,draft);drawAdvanced();paint();advanced.querySelector('[data-bm-reset-advanced]').focus();}
 if(b.hasAttribute('data-bm-apply')){Object.assign(state,draft);advanced.close();paint();}
 if(b.hasAttribute('data-bm-close'))b.closest('dialog')?.close();
 if(b.hasAttribute('data-bm-open')){opener=b;activeDetail=b.dataset.bmOpen;blueprintWorkId=activeDetail;drawDetail();detail.showModal();detail.querySelector('[data-bm-close]').focus();}
 if(b.hasAttribute('data-bm-copy')){const p=records.find(p=>p.id===b.dataset.bmCopy);if(p)copy(p.code);}
 for(const action of ['like','save'])if(b.hasAttribute('data-bm-'+action)){
 const id=b.dataset[action==='like'?'bmLike':'bmSave'],set=action==='like'?liked:saved;set.has(id)?set.delete(id):set.add(id);
 writeLocalValue('horizon_web_v2_blueprint_'+(action==='like'?'liked':'saved'),[...set]);paint();
 if(detail.open){drawDetail();detail.querySelector('[data-bm-'+action+'="'+id+'"]').focus({preventScroll:true});}
 else root.querySelector('[data-bm-'+action+'="'+id+'"]')?.focus({preventScroll:true});
 }
 };
 root.addEventListener('click',click,{signal});
 for(const dialog of [advanced,detail]){
 dialog.addEventListener('click',event=>{
 if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
 else click(event);
 },{signal});
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dialog.close();}},{signal});
 dialog.addEventListener('close',()=>{if(dialog===detail&&currentRoute==='blueprintRecommendation'){blueprintWorkId='';syncVehicleHistory();}if(currentRoute==='blueprintRecommendation'){root.querySelector('[data-bm-advanced]').setAttribute('aria-expanded','false');if(opener?.isConnected)opener.focus({preventScroll:true});}},{signal});
 }
 document.addEventListener('click',event=>{const menu=root.querySelector('.bm-sort-dropdown');if(menu?.open&&!menu.contains(event.target))menu.open=false;},{signal});
 root.addEventListener('keydown',event=>{
 const menu=event.target.closest('.bm-sort-dropdown');
 if(menu&&event.key==='Escape'&&menu.open){event.preventDefault();menu.open=false;menu.querySelector('summary').focus({preventScroll:true});return;}
 if(menu&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
  event.preventDefault();menu.open=true;const options=[...menu.querySelectorAll('[data-bm-sort]')],current=options.indexOf(document.activeElement);
  const index=event.key==='Home'?0:event.key==='End'?options.length-1:current<0?(event.key==='ArrowDown'?0:options.length-1):(current+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
  options[index].focus();return;
 }
 const group=event.target.closest('.bm-types');if(!group||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const list=[...group.querySelectorAll('button')],i=list.indexOf(event.target.closest('button'));const next=list[event.key==='Home'?0:event.key==='End'?list.length-1:(i+(event.key==='ArrowRight'?1:-1)+list.length)%list.length];next.focus();next.click();
 },{signal});
 paint();
 if(blueprintWorkId&&records.some(item=>item.id===blueprintWorkId)){activeDetail=blueprintWorkId;drawDetail();detail.showModal();}
}
const before=render;render=function(){before();const active=currentRoute==='blueprintRecommendation';document.querySelector('#subpage').classList.toggle('blueprint-magazine-active',active);if(active)mount();else cleanup();};render.tuner=before.tuner;
onAfterNavigate(cleanup);
window.addEventListener('hashchange',cleanup);window.addEventListener('popstate',cleanup);
if(currentRoute==='blueprintRecommendation')render();
return {records,saved,open(id){if(!records.some(record=>record.id===id))return;clear();blueprintWorkId=id;navigate("blueprintRecommendation");},remove(id){saved.delete(id);writeLocalValue('horizon_web_v2_blueprint_saved',[...saved]);}};
})();
