// Weekly album prototype. Existing site artwork and metadata are demonstration content.
(()=>{
const state={week:0,category:'',query:'',car:'',active:'',view:'carousel',tag:''};
const liked=readLocalIds('horizon_web_v2_album_liked'),saved=readLocalIds('horizon_web_v2_album_saved');
const scenes=[
 ['公路之间','风景','seasonal-guide-bg-v2.jpg',['公路','日落'],'远山与公路，都是这段旅程的主角。'],
 ['下一段旅程','车辆','car-library-bg-v2.jpg',['座驾','出发'],'为下一次出发留一张纪念。'],
 ['蓝色时刻','风景','blueprint-bg-v2.jpg',['海岸','夜景'],'沿着海岸，慢一点也很好。'],
 ['周末车友会','趣味','collection-bg-v2.jpg',['合影','周末'],'相聚的时刻，比终点更值得记住。'],
 ['弯道来信','车辆','tuning-bg-v2.jpg',['驾驶','山路'],'喜欢的车，熟悉的弯道。'],
 ['路上的意外发现','趣味','creator-ranking-bg-v2.jpg',['探索','随拍'],'计划之外，也有值得留下的画面。']
];
const names=['行路的人','山海之间','弯心笔记','周末车手','路过的风','慢拍俱乐部'];
const e=value=>esc(String(value));
let controller,dialog,previousFocus,seenTimer,sceneObserver;
const seen=readLocalIds('horizon_web_v2_album_seen');
const positionKey=()=> 'horizon_web_v2_album_position_'+baseDate.toISOString().slice(0,10)+'_'+state.week;
const baseDate=new Date();baseDate.setHours(12,0,0,0);baseDate.setDate(baseDate.getDate()-((baseDate.getDay()+6)%7));
function weekLabel(index){const start=new Date(baseDate);start.setDate(start.getDate()-index*7);const end=new Date(start);end.setDate(end.getDate()+6);const fmt=d=>`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;return fmt(start)+' — '+fmt(end);}
function works(week=state.week){
 const data=scenes.map(([title,category,image,tags,description],index)=>({
 id:`album-${baseDate.toISOString().slice(0,10)}-${week}-${index}`,
 title:week?['山路慢行','下一站见','入夜之前','一起出发','周末练习','小小停留'][index]:title,
 featured:true,category,src:'assets/home/'+image,tags,description,author:names[(index+week)%names.length],likes:24+index*13+week*7,
 cars:category==='车辆'?[libraryPreviewCars[index===1?1:0]]:index===3?[libraryPreviewCars[0],libraryPreviewCars[1]]:[]
 }));
 if(week===0)communityPhotos.slice(3).forEach((p,i)=>data.push({id:'album-local-'+i,title:p.title,src:p.src,author:p.author,category:'趣味',featured:false,tags:['本地投稿'],description:'本次页面中的本地投稿预览。',cars:[],likes:0}));
 return data;
}
function filtered(){
 if(state.view==='carousel')return works().filter(p=>p.featured);
 const terms=state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return [0,1,2].flatMap(week=>works(week)).filter(p=>(!state.tag||p.tags.includes(state.tag))&&(!state.category||p.category===state.category)&&(!state.car||p.cars.some(c=>c._id===state.car))&&terms.every(t=>[p.title,p.author,p.category,...p.tags,...p.cars.map(c=>c.brand+' '+c.name)].join(' ').toLowerCase().includes(t))).sort((a,b)=>(b.likes+Number(liked.has(b.id)))-(a.likes+Number(liked.has(a.id)))||a.id.localeCompare(b.id));
}
function actions(p){return `<button type="button" data-wa-like="${e(p.id)}" aria-label="点赞 ${e(p.title)}" aria-pressed="${liked.has(p.id)}">${liked.has(p.id)?'♥':'♡'} <span>${p.likes+(liked.has(p.id)?1:0)}</span></button><button type="button" data-wa-save="${e(p.id)}" aria-label="收藏 ${e(p.title)}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id)?'★':'☆'}</button>`;}
function paint(){
 const root=document.querySelector('.wa-shell');if(!root)return;
 root.querySelectorAll('[data-wa-week]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.waWeek)===state.week)));
 root.querySelector('.wa-week-label').textContent=state.week===0?'本周影集':state.week===1?'上周影集':'往期影集';
 root.querySelector('.wa-date').textContent=weekLabel(state.week);
 root.querySelectorAll('[data-wa-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waCategory===state.category)));
 root.querySelectorAll('[data-wa-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.waView===state.view)));
 root.querySelector('#waTag').value=state.tag;
 root.querySelector('#waCar').value=state.car;
 const library=state.view==='library';
 root.querySelector('.wa-covers').hidden=library;root.querySelector('.wa-week-heading').hidden=library;root.querySelector('.wa-filter').hidden=!library;root.querySelector('.wa-results').hidden=!library;
 const list=filtered();root.querySelector('.wa-count').textContent=`${list.length} 张相片`;
 root.querySelector('.wa-reset').hidden=!state.category&&!state.query&&!state.car&&!state.tag;
 paintCarousel();

}


function paintLibrary(list){
 const area=document.querySelector('.wa-carousel');
 area.innerHTML=`<div class="wa-library-heading"><h2>全部相片</h2><span>全部周次 · ${list.length} 张 · 按点赞量从高到低${state.tag?' · #'+e(state.tag):''}</span></div><div class="wa-grid">${list.map(p=>`<article class="wa-card" data-wa-likes="${p.likes+Number(liked.has(p.id))}"><button class="wa-photo" data-wa-library-pick="${e(p.id)}" aria-label="浏览相片：${e(p.title)}"><img src="${e(p.src)}" alt="${e(p.title)}" loading="lazy"><span class="wa-photo-category">${p.category}</span><span class="wa-enlarge" aria-hidden="true">↗</span></button><div class="wa-copy"><div class="wa-title-row"><h2><button data-wa-library-pick="${e(p.id)}">${e(p.title)}</button></h2><div class="wa-actions">${actions(p)}</div></div><div class="wa-author">摄影 / ${e(p.author)}</div><div class="wa-tags wa-library-tags">${p.tags.map(tag=>`<button data-wa-tag="${e(tag)}" aria-pressed="${state.tag===tag}"># ${e(tag)}</button>`).join('')}</div><div class="wa-car-links">${p.cars.map(carLink).join('')}</div></div></article>`).join('')||'<div class="wa-empty"><h2>没有匹配的相片</h2><p>换个标签、车辆或关键词试试。</p><button data-wa-reset>清空筛选</button></div>'}</div>`;
}
function remember(id){state.active=id;writeLocalValue(positionKey(),id);}
function paintCarousel(){
 clearTimeout(seenTimer);sceneObserver?.disconnect();
 const root=document.querySelector('.wa-shell'),list=filtered();
 if(state.view==='library'){paintLibrary(list);return;}
 const remembered=readLocalValue(positionKey(),'');
 const p=list.find(p=>p.id===state.active)||list.find(p=>p.id===remembered)||list[0];
 const area=root.querySelector('.wa-carousel');
 if(!p){area.innerHTML='<div class="wa-empty"><h2>这一周还没有匹配的相片</h2><p>试试其他分类、车辆或关键词。</p><button data-wa-reset>清空筛选</button></div>';return;}
 state.active=p.id;
 const index=list.indexOf(p);
 const oldStage=area.querySelector('.wa-carousel-stage');
 const staged=document.createElement('div');
 staged.innerHTML=`<div class="wa-carousel-position" role="status"><strong>第 ${index+1} 张 <span>/ ${list.length} 张</span></strong><span>${state.category||state.car||state.query||state.tag?'当前筛选':'整周影集'} · 左右切换，或点击下方缩略图</span></div><div class="wa-carousel-stage wa-depth-stage" data-list="${e(list.map(item=>item.id).join('|'))}" tabindex="0" role="group" aria-label="精选相片，使用左右方向键切换">${list.map(item=>`<button class="wa-depth-card" data-depth-id="${e(item.id)}"><img src="${e(item.src)}" alt="${e(item.title)}" draggable="false"></button>`).join('')}<button class="wa-carousel-prev" data-wa-browse="-1" aria-label="上一张" ${list.length<2?'disabled':''}>‹</button><button class="wa-carousel-next" data-wa-browse="1" aria-label="下一张" ${list.length<2?'disabled':''}>›</button></div><div class="wa-carousel-caption"><div class="wa-caption-title"><span class="wa-carousel-author">摄影 / ${e(p.author)}</span><h2>${e(p.title)}</h2></div><div class="wa-actions">${actions(p)}<a class="wa-download" href="${e(p.src)}" download="${e(p.title)}.jpg" aria-label="下载相片：${e(p.title)}">↓ 下载</a></div><div class="wa-tags">${p.tags.map(tag=>`<button data-wa-tag="${e(tag)}"># ${e(tag)}</button>`).join('')}<span>${p.category}</span></div><div class="wa-car-links">${p.cars.map(carLink).join('')}</div></div><div class="wa-contact-heading"><strong>本周全部相片</strong><span class="wa-seen-count"></span></div><div class="wa-contact-sheet" aria-label="本周相片缩略图">${list.map((item,i)=>`<button data-wa-pick="${e(item.id)}" aria-label="查看第 ${i+1} 张：${e(item.title)}" aria-pressed="${item.id===p.id}"><img src="${e(item.src)}" alt="" loading="lazy"><span>${String(i+1).padStart(2,'0')} · ${e(item.title)}</span><small data-wa-seen="${e(item.id)}">${seen.has(item.id)?'浏览过':''}</small></button>`).join('')}</div><p class="wa-reading-tip">喜欢的相片可以下载留存。再次回来，会继续停在上次浏览的位置。</p>`;
 const freshStage=staged.querySelector('.wa-depth-stage');
 if(oldStage&&oldStage.dataset.list===freshStage.dataset.list){
 const nodes=[...staged.children],pivot=nodes.indexOf(freshStage);
 [...area.children].filter(node=>node!==oldStage).forEach(node=>node.remove());
 nodes.slice(0,pivot).forEach(node=>area.insertBefore(node,oldStage));
 nodes.slice(pivot+1).forEach(node=>area.append(node));
 }else area.replaceChildren(...staged.childNodes);
 const depthStage=area.querySelector('.wa-depth-stage');
 depthStage.querySelectorAll('[data-depth-id]').forEach((card,i)=>{
 let offset=(i-index+list.length)%list.length;if(offset>list.length/2)offset-=list.length;
 const role=offset===0?'current':offset===-1?'previous':offset===1?'next':'far';
 card.dataset.depth=role;card.tabIndex=role==='far'?-1:0;card.inert=role==='far';card.setAttribute('aria-hidden',String(role==='far'));
 card.removeAttribute('data-wa-open');card.removeAttribute('data-wa-depth-pick');
 if(role==='current'){card.setAttribute('data-wa-open',list[i].id);card.classList.add('wa-carousel-image');card.setAttribute('aria-label','放大查看：'+list[i].title);}
 else{card.classList.remove('wa-carousel-image');card.setAttribute('data-wa-depth-pick',list[i].id);card.setAttribute('aria-label',(role==='previous'?'上一张：':'下一张：')+list[i].title);}
 });
 updateSeen();
 // Only mark a photo after it has loaded and remained visibly on screen.
 const stage=area.querySelector('.wa-carousel-stage'),img=stage.querySelector('[data-depth=current] img');
 sceneObserver=new IntersectionObserver(entries=>{
 clearTimeout(seenTimer);
 if(entries[0].isIntersecting&&entries[0].intersectionRatio>=.5&&!document.hidden){
 const schedule=()=>{seenTimer=setTimeout(()=>{if(state.active===p.id&&!document.hidden&&currentRoute==='weeklyPhotos'){seen.add(p.id);remember(p.id);writeLocalValue('horizon_web_v2_album_seen',[...seen]);updateSeen();}},1500);};
 if(img.complete&&img.naturalWidth)schedule();else img.addEventListener('load',schedule,{once:true,signal:controller.signal});
 }
 },{threshold:[0,.5]});
 sceneObserver.observe(stage);
}
function updateSeen(){
 const root=document.querySelector('.wa-shell');if(!root)return;
 root.querySelectorAll('[data-wa-seen]').forEach(node=>{node.textContent=seen.has(node.dataset.waSeen)?'浏览过':'';});
 const counter=root.querySelector('.wa-seen-count');if(counter){const all=works(),count=all.filter(p=>seen.has(p.id)).length;counter.textContent=`本周已浏览 ${count} / ${all.length} 张`;}
}
function browse(step){
 const list=filtered();if(!list.length)return;
 remember(list[(list.findIndex(p=>p.id===state.active)+step+list.length)%list.length].id);
 paintCarousel();
}
function carLink(c){return `<a href="#carDetail?view=garage&id=${encodeURIComponent(c._id)}&from=carSelection" data-wa-carlink>${e(c.brand+' '+c.name)} ↗</a>`;}
function viewer(){
 const list=filtered(),index=list.findIndex(p=>p.id===state.active),p=list[index];if(!p){dialog?.close();return;}
 dialog.innerHTML=`<div class="wa-viewer-top"><span>${state.week===0?'本周影集':'往期影集'} · ${index+1} / ${list.length}</span><button data-wa-close aria-label="关闭大图">×</button></div><div class="wa-viewer-content"><div class="wa-stage"><img src="${e(p.src)}" alt="${e(p.title)}"><button class="wa-previous" data-wa-cycle="-1" aria-label="上一张" ${list.length<2?'disabled':''}>‹</button><button class="wa-next" data-wa-cycle="1" aria-label="下一张" ${list.length<2?'disabled':''}>›</button></div><aside class="wa-details"><span class="wa-detail-category">${p.category}</span><h2 id="waViewerTitle">${e(p.title)}</h2><div class="wa-detail-author"><i aria-hidden="true">${e(p.author[0])}</i><div><small>摄影作者</small><strong>${e(p.author)}</strong></div></div><p>${e(p.description)}</p><div class="wa-tags">${p.tags.map(tag=>`<button data-wa-tag="${e(tag)}"># ${e(tag)}</button>`).join('')}</div><div class="wa-bound"><h3>画面中的车辆</h3>${p.cars.length?p.cars.map(c=>`<a href="#carDetail?view=garage&id=${encodeURIComponent(c._id)}&from=carSelection" data-wa-carlink><img src="${e(garageImage(c))}" alt=""><span>${e(c.brand)}<strong>${e(c.name)}</strong><small>查看车辆详情 ↗</small></span></a>`).join(''):'<p>这张相片未关联车辆。</p>'}</div><div class="wa-actions wa-viewer-actions">${actions(p)}</div><small class="wa-demo-note">示例相片与车辆关联，仅用于布局预览</small></aside></div>`;
}
function cycle(step){const list=filtered(),i=list.findIndex(p=>p.id===state.active),id=list[(i+step+list.length)%list.length].id;if(state.view==='carousel')remember(id);else state.active=id;viewer();}
function close(){dialog?.close();}
function cleanup(){if(currentRoute==='weeklyPhotos')return;document.querySelector('#subpage > .sub-header .wa-submit')?.remove();clearTimeout(seenTimer);sceneObserver?.disconnect();controller?.abort();dialog?.close();dialog?.remove();dialog=null;document.querySelector('#subpage').classList.remove('weekly-album-active');}
function mount(){
 clearTimeout(seenTimer);sceneObserver?.disconnect();controller?.abort();dialog?.close();dialog?.remove();controller=new AbortController();const signal=controller.signal;
 document.querySelector('#subpage').classList.add('weekly-album-active');
 const root=document.querySelector('#subcontent');
 const bound=[...new Map([libraryPreviewCars[0],libraryPreviewCars[1]].map(c=>[c._id,c])).values()];
 root.innerHTML=`<section class="wa-shell"><div class="wa-view-switch" role="group" aria-label="相册浏览方式"><button data-wa-view="carousel" aria-pressed="true">每周精选</button><button data-wa-view="library" aria-pressed="false">全部相片</button></div><div class="wa-covers" role="group" aria-label="每周影集封面">${[0,1,2].map(i=>`<button data-wa-week="${i}" aria-pressed="${state.week===i}"><img src="assets/home/${scenes[(i*2)%scenes.length][2]}" alt=""><span class="wa-cover-shade"></span><span class="wa-cover-copy"><small>${i===0?'本周影集':i===1?'上周影集':'往期影集'}</small><strong>${['在路上，遇见光','把周末交给远方','一路风景，一起收藏'][i]}</strong><span>${weekLabel(i)} · ${6+(i===0?communityPhotos.length-3:0)} 张</span></span></button>`).join('')}</div><div class="wa-week-heading"><strong class="wa-week-label"></strong><span class="wa-date"></span><small>示例封面与相片</small></div><div class="wa-filter"><div class="wa-categories" role="group" aria-label="相片分类"><span class="wa-category-label" aria-hidden="true">分类</span>${['','风景','车辆','趣味'].map(c=>`<button data-wa-category="${c}" aria-pressed="${state.category===c}">${c||'全部'}</button>`).join('')}</div><div class="wa-filter-fields"><label><span class="wa-sr">筛选相片标签</span><select id="waTag"><option value="">全部 tag</option>${[...new Set(scenes.flatMap(p=>p[3]).concat(communityPhotos.length>3?['本地投稿']:[]))].map(tag=>`<option value="${e(tag)}"># ${e(tag)}</option>`).join('')}</select></label><label><span class="wa-sr">筛选关联车辆</span><select id="waCar"><option value="">全部车辆</option>${bound.map(c=>`<option value="${e(c._id)}">${e(c.brand+' '+c.name)}</option>`).join('')}</select></label><label><span class="wa-sr">搜索相片、作者、标签或车辆</span><input id="waSearch" type="search" value="${e(state.query)}" placeholder="搜索相片、作者、tag…" maxlength="100"></label></div></div><div class="wa-results"><span class="wa-count" role="status" aria-live="polite"></span><button class="wa-reset" data-wa-reset hidden>清空筛选</button><small>每周一辑 · 当前为示例影集</small></div><section class="wa-carousel" aria-label="影集相片浏览"></section><footer class="wa-foot"><span>本周的风景，下周也可以回来看看。</span><span>源于玩家，用于玩家</span></footer></section>`;
 const pageHeading=document.querySelector('#subpage > .sub-header');
 if(!pageHeading.querySelector('.wa-submit'))pageHeading.insertAdjacentHTML('beforeend','<button type="button" class="wa-submit" data-submit-photo>投稿我的相片 ＋</button>');
 dialog=document.createElement('dialog');dialog.className='wa-viewer';dialog.setAttribute('aria-labelledby','waViewerTitle');document.body.append(dialog);
 root.querySelector('#waTag').addEventListener('change',event=>{state.tag=event.target.value;paint();},{signal});
 root.querySelector('#waCar').addEventListener('change',event=>{state.car=event.target.value;paint();},{signal});
 root.querySelector('#waSearch').addEventListener('input',event=>{state.query=event.target.value;paint();},{signal});
 let suppressImageClick=false;
 const click=event=>{
 if(suppressImageClick&&event.target.closest('.wa-carousel-stage')){suppressImageClick=false;event.preventDefault();return;}
 const target=event.target.closest('button,a');if(!target)return;
 if(target.hasAttribute('data-wa-view')){state.view=target.dataset.waView;paint();}
 if(target.hasAttribute('data-wa-library-pick')){previousFocus=target;state.active=target.dataset.waLibraryPick;viewer();dialog.showModal();dialog.querySelector('[data-wa-close]').focus();}
 if(target.hasAttribute('data-wa-week')){state.week=Number(target.dataset.waWeek);state.active='';paint();}
 if(target.hasAttribute('data-wa-browse')){const step=target.dataset.waBrowse;browse(Number(step));root.querySelector('[data-wa-browse="'+step+'"]')?.focus({preventScroll:true});}
 if(target.hasAttribute('data-wa-depth-pick')){remember(target.dataset.waDepthPick);paintCarousel();root.querySelector('[data-depth=current]').focus({preventScroll:true});return;}
 if(target.hasAttribute('data-wa-pick')){remember(target.dataset.waPick);paintCarousel();root.querySelector('[data-wa-pick="'+state.active+'"]')?.focus({preventScroll:true});}
 if(target.hasAttribute('data-wa-open')){previousFocus=target;state.active=target.dataset.waOpen;viewer();dialog.showModal();dialog.querySelector('[data-wa-close]').focus();}
 if(target.hasAttribute('data-wa-close'))close();
 if(target.hasAttribute('data-wa-carlink'))close();
 if(target.hasAttribute('data-wa-cycle'))cycle(Number(target.dataset.waCycle));
 if(target.hasAttribute('data-wa-category')){state.category=target.dataset.waCategory;paint();}
 if(target.hasAttribute('data-wa-reset')){state.query='';state.car='';state.category='';state.tag='';root.querySelector('#waSearch').value='';paint();}
 if(target.hasAttribute('data-wa-tag')){state.tag=state.tag===target.dataset.waTag?'':target.dataset.waTag;state.view='library';close();paint();root.querySelector('#waTag').focus();}
 for(const action of ['like','save'])if(target.hasAttribute('data-wa-'+action)){const id=target.dataset[action==='like'?'waLike':'waSave'],set=action==='like'?liked:saved;set.has(id)?set.delete(id):set.add(id);writeLocalValue('horizon_web_v2_album_'+(action==='like'?'liked':'saved'),[...set]);paint();if(dialog.open){viewer();dialog.querySelector('[data-wa-'+action+']').focus();}else root.querySelector('[data-wa-'+action+'="'+id+'"]')?.focus({preventScroll:true});}
 };
 document.querySelector('#photoSubmission').addEventListener('submit',()=>{state.week=0;state.category='';state.query='';state.car='';state.tag='';},{capture:true,signal});
 root.addEventListener('click',click,{signal});dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}else click(event);},{signal});
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();event.preventDefault();close();}if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();cycle(event.key==='ArrowLeft'?-1:1);}},{signal});
 dialog.addEventListener('close',()=>{if(currentRoute==='weeklyPhotos'){paintCarousel();const focus=root.querySelector(state.view==='library'?'[data-wa-library-pick="'+state.active+'"]':'[data-wa-open="'+state.active+'"]');(focus||previousFocus)?.focus({preventScroll:true});}},{signal});

 root.addEventListener('keydown',event=>{if(event.target.closest('input,select')||!event.target.closest('.wa-carousel'))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();browse(event.key==='ArrowLeft'?-1:1);root.querySelector('.wa-carousel-stage')?.focus({preventScroll:true});}},{signal});
 let touchStart;
 root.addEventListener('pointerdown',event=>{if(event.target.closest('.wa-carousel-stage')&&!event.target.closest('[data-wa-browse]'))touchStart={x:event.clientX,y:event.clientY};},{signal});
 root.addEventListener('pointerup',event=>{if(!touchStart)return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5){event.preventDefault();suppressImageClick=true;setTimeout(()=>{suppressImageClick=false;},300);browse(dx<0?1:-1);}},{signal});
 root.addEventListener('pointercancel',()=>{touchStart=null;},{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(seenTimer);else paintCarousel();},{signal});
 paint();
}
renderAlbum=mount;
const before=render;render=function(){before();cleanup();};render.tuner=before.tuner;
onAfterNavigate(cleanup);
window.addEventListener('hashchange',cleanup);window.addEventListener('popstate',cleanup);
if(currentRoute==='weeklyPhotos')render();
})();
