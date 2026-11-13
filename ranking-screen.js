// Local leaderboard fixtures. Replace metrics with server-side period aggregates when connected.
(()=>{
const state={category:'all',period:'week'};
const categories=[['all','综合榜'],['road','公路榜单'],['rally','拉力 / 越野榜单'],['blueprint','蓝图榜单'],['visual','拍照 / 涂装榜单']];
const fields=['road','rally','blueprint','visual'];
const fixtures=[
 ['Demo Apex',[910,190,100,86],[12,6,4,2]],
 ['Demo Horizon',[210,118,560,180],[4,3,8,3]],
 ['Demo Driver',[160,500,106,180],[6,14,4,8]],
 ['Demo Drift',[500,210,60,42],[10,3,2,1]],
 ['山海行者',[320,240,88,120],[8,7,2,4]],
 ['Mika Studio',[70,54,30,500],[2,2,1,9]],
 ['Nord Design',[190,92,60,240],[6,4,3,6]],
 ['周末车手',[100,116,140,80],[3,3,4,2]]
];
const records=fixtures.map(([name,weekly,counts],index)=>{
 let creator=creators.find(c=>c.name===name);
 if(!creator){creator={id:'ranking_creator_'+index,name};creators.push(creator);}
 return {...creator,weekly,counts,index};
});
for(const id of readLocalIds('horizon_web_v2_followed_creators'))if(creators.some(c=>c.id===id))followed.add(id);
let controller,viewportObserver;
const e=value=>esc(String(value));
const fmt=value=>value.toLocaleString('en-US');
function metrics(record){
 const indexes=state.category==='all'?[0,1,2,3]:[fields.indexOf(state.category)];
 const multiplier=state.period==='week'?1:state.period==='month'?3+record.index*.2:14+record.index*1.5;
 return {record,likes:indexes.reduce((n,i)=>n+Math.round(record.weekly[i]*multiplier),0),works:indexes.reduce((n,i)=>n+record.counts[i],0)};
}
function periodLabel(){
 if(state.period==='total')return '累计获赞';
 const now=new Date(),start=new Date(now),end=new Date(now);
 if(state.period==='week'){start.setDate(now.getDate()-(now.getDay()+6)%7);end.setTime(start.getTime());end.setDate(start.getDate()+6);}
 else{start.setDate(1);end.setMonth(now.getMonth()+1,0);}
 const date=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('.');
 return date(start)+' — '+date(end);
}
function helmet(index){
 return `<span class="rk-avatar rk-helmet-${index}" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="var(--rk-helmet)"/><path d="M10 29V21c0-9 6-15 14-15s14 6 14 15v8l-6 9H17Z" fill="var(--rk-helmet-face)" stroke="var(--rk-outline)" stroke-width="2.3" stroke-linejoin="round"/><path d="M14 19h21l1 8H14Z" fill="var(--rk-visor)" stroke="var(--rk-outline)" stroke-width="2"/><path d="M18 22h10" stroke="var(--rk-visor-shine)" stroke-width="2" stroke-linecap="round"/><path d="m16 29 16 1-4 8h-8Z" fill="var(--rk-helmet)" stroke="var(--rk-outline)" stroke-width="2"/><path d="M23 7v9" stroke="var(--rk-helmet)" stroke-width="5"/></svg></span>`;
}
function drawRows(){
 const root=document.querySelector('.rk-screen');if(!root)return;
 root.querySelectorAll('[data-rk-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rkCategory===state.category)));
 root.querySelectorAll('[data-rk-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rkPeriod===state.period)));
 root.querySelector('.rk-date').textContent=periodLabel();
 root.querySelector('.rk-likes-heading').textContent=state.period==='week'?'本周获赞':state.period==='month'?'本月获赞':'累计获赞';
 const list=records.map(metrics).filter(m=>m.works>0).sort((a,b)=>b.likes-a.likes||a.record.id.localeCompare(b.record.id));
 const rows=root.querySelector('.rk-rows'),previousScroll=rows.scrollTop;
 let rank=0,previous=-1;
 root.querySelector('.rk-rows').innerHTML=list.map((m,index)=>{
 if(m.likes!==previous)rank=index+1;previous=m.likes;
 const c=m.record,isFollowed=followed.has(c.id);
 return `<article class="rk-row ${rank<=3?'rk-top rk-top-'+rank:''}" data-rk-id="${e(c.id)}" data-rk-rank="${rank}" data-rk-likes="${m.likes}"><span class="rk-place" aria-label="第 ${rank} 名">${String(rank).padStart(2,'0')}</span><button class="rk-author" type="button" data-tuner="${e(c.name)}" aria-label="查看 ${e(c.name)} 的创作者主页">${helmet(c.index)}<span><strong>${e(c.name)}</strong><small>作者主页 ↗</small></span></button><span class="rk-works"><b>${m.works}</b><small>件作品</small></span><span class="rk-score"><b>${fmt(m.likes)}</b><small>获赞</small></span><button class="rk-follow" type="button" data-rk-follow="${e(c.id)}" aria-label="${isFollowed?'取消关注':'关注'} ${e(c.name)}" aria-pressed="${isFollowed}">${isFollowed?'✓ 已关注':'＋ 关注'}</button></article>`;
 }).join('');
 rows.scrollTop=previousScroll;
 root.querySelector('.rk-status').textContent=`${categories.find(c=>c[0]===state.category)[1]} · ${{week:'本周',month:'本月',total:'总榜'}[state.period]} · ${list.length} 位创作者`;
}
function mount(){
 controller?.abort();viewportObserver?.disconnect();controller=new AbortController();const signal=controller.signal,root=document.querySelector('#subcontent');
 root.innerHTML=`<section class="rk-housing" aria-label="创作者排行榜显示屏"><i class="rk-screw rk-tl" aria-hidden="true"></i><i class="rk-screw rk-tr" aria-hidden="true"></i><i class="rk-screw rk-bl" aria-hidden="true"></i><i class="rk-screw rk-br" aria-hidden="true"></i><div class="rk-screen"><div class="rk-heading"><h2><i aria-hidden="true"></i>创作者排行榜</h2><span>每一份喜欢，都算数。<i class="rk-checker" aria-hidden="true"></i></span></div><div class="rk-categories" role="group" aria-label="榜单分类">${categories.map(([id,name])=>`<button type="button" data-rk-category="${id}" aria-pressed="${state.category===id}"><span>${name}</span></button>`).join('')}</div><div class="rk-period-row"><div class="rk-periods" role="group" aria-label="统计周期">${[['week','本周'],['month','本月'],['total','总榜']].map(([id,name])=>`<button type="button" data-rk-period="${id}" aria-pressed="${state.period===id}">${name}</button>`).join('')}</div><span class="rk-date"></span><small>按点赞数排名 · 演示数据</small></div><p class="rk-status" role="status" aria-live="polite"></p><div class="rk-table-heading" aria-hidden="true"><span>排名</span><span>创作者</span><span>作品数量</span><span class="rk-likes-heading">本周获赞</span><span>关注作者</span></div><div class="rk-rows" tabindex="0" role="region" aria-label="可滚动排名列表"></div><div class="rk-footer"><span>统计所选周期新增获赞 · 同赞并列 · 数据为本地示例</span><span>源于玩家，用于玩家</span></div></div></section>`;
 root.addEventListener('click',event=>{
 const category=event.target.closest('[data-rk-category]'),period=event.target.closest('[data-rk-period]'),follow=event.target.closest('[data-rk-follow]');
 if(category){state.category=category.dataset.rkCategory;drawRows();root.querySelector('.rk-rows').scrollTop=0;}
 if(period){state.period=period.dataset.rkPeriod;drawRows();root.querySelector('.rk-rows').scrollTop=0;}
 if(follow){const id=follow.dataset.rkFollow;followed.has(id)?followed.delete(id):followed.add(id);saveFollowedCreators();drawRows();root.querySelector('[data-rk-follow="'+id+'"]').focus({preventScroll:true});}
 },{signal});
 root.addEventListener('keydown',event=>{
 if(event.target.matches('.rk-rows')&&['Home','End','PageUp','PageDown','ArrowUp','ArrowDown'].includes(event.key)){
 const rows=event.target;event.preventDefault();
 if(event.key==='Home')rows.scrollTop=0;
 else if(event.key==='End')rows.scrollTop=rows.scrollHeight;
 else rows.scrollTop+=(['PageUp','ArrowUp'].includes(event.key)?-1:1)*(event.key.startsWith('Page')?rows.clientHeight*.85:64);
 return;
 }
 const group=event.target.closest('.rk-categories,.rk-periods');if(!group||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const buttons=[...group.querySelectorAll('button')],i=buttons.indexOf(event.target.closest('button'));
 const next=buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length];next.focus();next.click();
 },{signal});
 window.addEventListener('storage',event=>{if(event.key===null||event.key==='horizon_web_v2_followed_creators')drawRows();},{signal});

 const fitViewport=()=>{
 if(currentRoute!=='ranking')return;
 const housing=root.querySelector('.rk-housing');if(!housing)return;
 const top=housing.getBoundingClientRect().top;
 housing.style.setProperty('--rk-viewport-gap',Math.ceil(top+12)+'px');
 };
 window.addEventListener('resize',fitViewport,{signal});
 window.visualViewport?.addEventListener('resize',fitViewport,{signal});
 viewportObserver=new ResizeObserver(fitViewport);
 viewportObserver.observe(document.querySelector('.site-header'));
 viewportObserver.observe(document.querySelector('.web-breadcrumb'));
 document.addEventListener('wheel',event=>{
 if(event.ctrlKey||!event.deltaY||event.target.closest('dialog,.drawer,.nav-dropdown,.global-search-panel,.rk-rows'))return;
 if(!event.target.closest('.rk-housing,.web-breadcrumb,#subpage'))return;
 const rows=root.querySelector('.rk-rows');event.preventDefault();
 rows.scrollBy({top:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?rows.clientHeight:1),behavior:'instant'});
 },{passive:false,signal});
 drawRows();fitViewport();requestAnimationFrame(()=>{if(!signal.aborted)fitViewport();});
}
function cleanup(){if(currentRoute==='ranking')return;controller?.abort();viewportObserver?.disconnect();document.body.classList.remove('ranking-viewport');document.querySelector('#subpage').classList.remove('ranking-screen-active');}
const before=render;
render=function(){
 before();
 const active=currentRoute==='ranking';document.body.classList.toggle('ranking-viewport',active);document.querySelector('#subpage').classList.toggle('ranking-screen-active',active);
 if(active)mount();else cleanup();
 if(currentRoute==='tunerProfile'&&records.some(c=>c.name===render.tuner)&&!document.querySelector('#subcontent .vehicle')){const grid=document.querySelector('#subcontent .car-grid');if(grid&&!grid.children.length)grid.innerHTML='<p class="rk-profile-note">该创作者的作品内容尚未接入，当前可预览主页与关注操作。</p>';}
};render.tuner=before.tuner;
onAfterNavigate(cleanup);
window.addEventListener('hashchange',cleanup);window.addEventListener('popstate',cleanup);
if(currentRoute==='ranking'||currentRoute==='tunerProfile')render();
})();
