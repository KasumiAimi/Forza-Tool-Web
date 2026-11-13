/* Creator profiles use the same local fixtures as the vehicle, blueprint and livery views. */
(()=>{
 let profileName='',tab='tuning',level='',scene='',style='';
 const prior=render;
 render=function(){
  prior();
  if(currentRoute!=='tunerProfile')return;
  const name=render.tuner||'Demo Apex';
  if(profileName!==name){profileName=name;tab='tuning';level='';scene='';style='';}
  const creator=creators.find(item=>item.name===name);
  const tunes=garageAllCars.flatMap(car=>car.tuningData.filter(tune=>tune.tuner===name).map(tune=>({car,tune})));
  const blueprints=blueprintCollection.records.filter(work=>work.author===name);
  const liveries=liveryCenterWorks.filter(work=>work.artist===name);
  const likes=tunes.reduce((sum,item)=>sum+(item.tune.likes||0),0)+blueprints.reduce((sum,item)=>sum+item.likes,0)+liveries.reduce((sum,item)=>sum+item.likes,0);
  const count=tunes.length+blueprints.length+liveries.length;
  const root=document.querySelector('#subcontent');
  const follow=creator&&followed.has(creator.id);
  const groups=[['公路',['公路']],['拉力',['拉力']],['越野',['越野']],['漂移 / 直线加速',['漂移','直线加速']]];
  const button=(key,label,current)=>'<button type="button" data-cp-'+key+'="'+esc(label)+'" aria-pressed="'+(current===label)+'">'+esc(label||'全部')+'</button>';
  function content(){
   if(tab==='tuning'){
    const filtered=tunes.filter(item=>!level||item.tune.level===level);
    return '<div class="cp-filters"><span>调校等级</span>'+['',...levels].map(value=>button('level',value,level)).join('')+'</div>'+groups.map(([label,types])=>{
     const items=filtered.filter(item=>types.includes(item.tune.scenario));
     return '<details class="cp-group" open><summary>'+label+' <small>'+items.length+' 套</small></summary><div class="cp-garage">'+items.map(({car,tune})=>garageCard(car,tune.tier,[tune]).replace('data-garage-car=', 'data-cp-car=').replace('<span class="garage-car-title">','<span class="cp-tier-badge" data-tier="'+esc(tune.tier)+'">'+esc(tune.tier)+'</span><span class="garage-car-title">')).join('')+(items.length?'':'<p class="cp-empty">暂无匹配调校</p>')+'</div></details>';
    }).join('');
   }
   if(tab==='blueprint'){
    const items=blueprints.filter(work=>!scene||work.type.includes(scene));
    return '<div class="cp-filters"><span>蓝图场景</span>'+['','公路','泥地','漂移','拍照','趣味'].map(value=>button('scene',value,scene)).join('')+'</div><div class="cp-grid">'+items.map(work=>'<button type="button" class="cp-work cp-blueprint" data-open-blueprint="'+esc(work.id)+'"><img src="assets/home/'+esc(work.image)+'" alt=""><strong>'+esc(work.name)+'</strong><span>'+esc(work.type.join(' · '))+' · '+esc(work.code)+'</span></button>').join('')+(items.length?'':'<p class="cp-empty">暂无匹配蓝图</p>')+'</div>';
   }
   const items=liveries.filter(work=>!style||work.style===style);
   return '<div class="cp-filters"><span>涂装风格</span>'+['',...liveryCenterStyles].map(value=>button('style',value,style)).join('')+'</div><div class="cp-grid">'+items.map((work,index)=>'<button type="button" class="cp-work cp-livery" data-open-livery="'+esc(work.id)+'">'+renderLiveryToybox(work,index)+'<strong>'+esc(work.title)+'</strong><span>'+esc(work.brand+' · '+work.car+' · '+work.code)+'</span></button>').join('')+(items.length?'':'<p class="cp-empty">暂无匹配涂装</p>')+'</div>';
  }
  root.innerHTML='<section class="creator-profile"><header class="profile-heading cp-heading"><span class="cp-avatar" aria-hidden="true">'+esc(name[0])+'</span><div><h2>'+esc(name)+'</h2><p>创作者 · 演示资料</p></div><div class="cp-stats"><span><b>'+count+'</b>总作品</span><span><b>'+likes+'</b>总获赞</span><span><b>'+(follow?1:0)+'</b>总粉丝 · 示例</span></div><button id="follow" class="copy-tuner" type="button" aria-pressed="'+Boolean(follow)+'">'+(follow?'已关注':'关注创作者')+'</button></header><div class="cp-tabs" role="group" aria-label="创作者作品类型">'+[['tuning','调校',tunes.length],['blueprint','蓝图',blueprints.length],['livery','涂装',liveries.length]].map(([id,label,total])=>'<button type="button" data-cp-tab="'+id+'" aria-pressed="'+(tab===id)+'">'+label+' <small>'+total+'</small></button>').join('')+'</div><div class="cp-content">'+content()+'</div></section>';
  root.querySelector('#follow').onclick=()=>{if(!creator)return;followed.has(creator.id)?followed.delete(creator.id):followed.add(creator.id);saveFollowedCreators();render();root.querySelector('#follow').focus({preventScroll:true});};
  root.querySelector('.creator-profile').onclick=event=>{
   const b=event.target.closest('button');if(!b)return;
   if(b.dataset.cpTab){tab=b.dataset.cpTab;render();root.querySelector('[data-cp-tab="'+tab+'"]').focus({preventScroll:true});}
   for(const key of ['level','scene','style'])if(b.hasAttribute('data-cp-'+key)){if(key==='level')level=b.dataset.cpLevel;if(key==='scene')scene=b.dataset.cpScene;if(key==='style')style=b.dataset.cpStyle;render();root.querySelector('[data-cp-'+key+'="'+CSS.escape(b.dataset['cp'+key[0].toUpperCase()+key.slice(1)])+'"]')?.focus({preventScroll:true});}
   if(b.dataset.cpCar){detailCar=garageAllCars.find(car=>car._id===b.dataset.cpCar);detailOrigin='tunerProfile';detailTier='';showAll=true;selectedLiveryWorkId='';navigate('carDetail');}
  };
 };
 render.tuner=prior.tuner;
 if(currentRoute==='tunerProfile')render();
})();

(()=>{
 const body=document.querySelector('#drawer .drawer-body');
 body.insertAdjacentHTML('beforeend','<div class="drawer-extra"><section><h3>本周季节赛</h3><button class="de-link" data-route="seasonalEvents">冬季赛限定赛程 →</button><small>剩余时间为演示数据</small></section><section><h3>每周联赛 · 最新赛制</h3><button class="de-poster" type="button" data-drawer-poster aria-label="放大赛事海报"><img src="assets/home/latest_event.webp" alt="最新赛事海报"></button><button class="de-link" data-route="leagueStandings">积分榜公示 →</button><button class="de-link" data-copy="KMTTB">B站联系 KMTTB 报名 · 复制 ID</button></section><section><h3>关注与收藏最新调校</h3><div class="de-updates"></div></section><section><h3>最新热门蓝图推荐</h3><div class="de-blueprints"></div></section></div>');
 function refresh(){
  const updates=ActivityFeed.select({updates:homeUpdates,carIds:collected,creatorIds:followed,type:'tuning'}).slice(0,4);
  body.querySelector('.de-updates').innerHTML=updates.length?updates.map(item=>'<button class="de-link" data-car="'+esc(item.carId)+'">'+esc(item.tune.tuner+' · '+item.tune.scenario)+'</button>').join(''):'<small>暂无关注创作者或收藏车辆的最新调校</small>';
  body.querySelector('.de-blueprints').innerHTML=blueprintCollection.records.slice(0,4).map(item=>'<button class="de-link" data-open-blueprint="'+esc(item.id)+'">'+esc(item.name)+' ↗</button>').join('');
 }
 document.querySelector('#control').addEventListener('click',refresh);
 body.addEventListener('click',event=>{if(!event.target.closest('[data-drawer-poster]'))return;drawer(false);const dialog=document.querySelector('#photo');dialog.querySelector('img').src='assets/home/latest_event.webp';dialog.querySelector('img').alt='最新赛事海报';dialog.querySelector('p').textContent='每周联赛 · 最新赛事';dialog.showModal();});
})();

const updateBeforeCollectionProfile=updateNick;
updateNick=function(){updateBeforeCollectionProfile();if(currentRoute==='collection')renderCollection();};
