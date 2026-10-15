// Web presentation layer; filtering, navigation parameters and demo state stay in app.js.
const routeDescriptions={carRecommendation:['FIND YOUR SETUP','全调校库','先选用途，再找车辆。把合适的调校带进下一场比赛。'],carSelection:['THE COMPLETE GARAGE','全车辆库','探索车辆性能、获取方式，以及它们的调校潜力。'],seasonalEvents:['THIS WEEK IN HORIZON','季节赛攻略','本周的赛程、奖励与推荐车辆，一次看清。'],seasonPreview:['NEXT ON THE HORIZON','下期季节赛预告','提前了解下一期的赛程与奖励。'],collection:['SAVED FOR YOUR NEXT DRIVE','个人收藏','喜欢的车辆与蓝图，随时回来接着看。'],ranking:['MEET THE CREATORS','创作者榜','发现调校背后的人，与他们一起驶向更远的地方。'],blueprintRecommendation:['TAKE A DIFFERENT ROAD','蓝图推荐','离开熟悉的路线，探索车手创造的新世界。'],gameGuide:['KNOW YOUR HORIZON','游戏攻略','从第一段旅程，到每一个值得探索的角落。'],leagueStandings:['MEET YOU AT THE START LINE','赛事系统','KIT CUP 每周联赛 · 赛制与成绩公示。'],carDetail:['VEHICLE & SETUPS','车辆详情',''],feedback:['MAKE IT BETTER','意见反馈','告诉我们你在使用过程中的想法。'],tunerProfile:['BEHIND THE WHEEL','调校师主页','']};
const originalNavigate=navigate;
navigate=function(route,push=true){originalNavigate(route,push);const d=routeDescriptions[route]||['HORIZON JOURNAL',$('#pageTitle').textContent,''];$('#breadcrumbLabel').textContent=d[1];$('#pageKicker').textContent=d[0];$('#pageDescription').textContent=d[2];document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.route===route||(route==='carDetail'&&b.dataset.route==='carRecommendation')||(route==='seasonPreview'&&b.dataset.route==='seasonalEvents')));};
$('#logo').onclick=()=>navigate('');$('#control').onclick=()=>drawer(true);$('#closeDrawer').onclick=()=>drawer(false);$('#backdrop').onclick=()=>drawer(false);$('#editFromDrawer').onclick=editName;$('#heroHit').onclick=()=>{$('#photo img').src='assets/home/seasonal-guide-bg-v2.jpg';$('#photo p').textContent='每周精选摄影 · 演示配图';$('#photo').showModal()};
card=function(c,tier='',library=false){const ts=library?c.tuningData:(mode==='online'?c.tuningData:c.tuningData.filter(t=>['漂移','直线加速'].includes(t.scenario)));const ls=[...new Set(ts.map(t=>t.level))].sort((a,b)=>levels.indexOf(a)-levels.indexOf(b));return `<button class="vehicle web-vehicle" data-car="${c._id}" data-tier="${tier}"><div class="vehicle-image"><img src="assets/cars/${c.image}" alt="${esc(c.name)} 演示配图"><div class="level-badges">${ls.map(l=>`<b class="level-${l}">${l}</b>`).join('')}</div><span class="vehicle-open">↗</span></div><div class="vehicle-info"><p>${c.brand.toUpperCase()}</p><h3>${esc(c.name)}</h3><div class="vehicle-bottom"><div class="tags">${[...new Set(ts.map(t=>t.scenario))].map(s=>`<span class="${s===filters.scenario?'selected':''}">${s}</span>`).join('')}</div><span>查看调校 →</span></div></div></button>`};
$('#homeCars').innerHTML=[cars[0],cars[3],cars[5],cars[8]].map(c=>card(c,'',true)).join('');
$('#homeCreators').innerHTML=['Demo Apex','Demo Horizon','Demo Driver'].map((n,i)=>`<button class="home-author" data-tuner="${n}"><span class="author-rank">0${i+1}</span><span class="author-avatar a${i}">${n.split(' ')[1][0]}</span><span><strong>${n}</strong><small>${['公路竞速 · 手感与速度','拉力与越野 · 稳定出发','多种玩法 · 更多可能'][i]}</small></span><b>↗</b></button>`).join('');
renderTuning=function(){const visible=cars.filter(c=>(!filters.brand||c.brand===filters.brand)&&c.tuningData.some(tuneMatches));$('#subcontent').innerHTML=`<div class="web-modebar"><div class="tabs"><button class="${mode==='online'?'active':''}" data-mode="online">线上竞速</button><button class="${mode==='all'?'active':''}" data-mode="all">漂移/直线加速</button></div><span>${visible.length} 辆匹配车辆 <i>· 演示数据</i></span></div><section class="web-filters" aria-label="车辆筛选"><div class="filter-section brand-section"><label>车厂品牌</label><button class="brand-trigger" id="openBrand">${filters.brand||'全部车厂'}<span>⌄</span></button></div><div class="filter-section"><label>车辆等级</label>${pill('level',modeOptions().levels)}</div><div class="filter-section"><label>使用场景</label>${pill('scenario',scenarios())}</div><div class="filter-section"><label>驱动形式</label>${pill('driveType',modeOptions().drives)}</div>${Object.values(filters).some(Boolean)?'<button class="clear-filter" id="clearFilters">清空筛选 ×</button>':''}</section><div class="recommendation-list">${tiers.map(tier=>{const list=visible.filter(c=>c.tuningData.some(t=>tuneMatches(t)&&t.tier===tier));return list.length?`<section class="tier-section"><div class="tier-heading tier-${tier}"><span class="tier-dot"></span><h2>${tier==='常规'?'常规调校':tier==='Overpower'?'Overpower':tier+' 梯队'}</h2><span class="tier-subtitle">${tier==='META'?'以表现为先':tier==='T1'?'速度与手感的平衡':'找到你的驾驶节奏'}</span><span class="tier-count">${list.length} 辆</span></div><div class="car-grid">${list.map(c=>card(c,tier)).join('')}</div></section>`:''}).join('')||'<div class="result-empty"><span class="empty-mark">⌕</span><h2>没有找到符合条件的车辆</h2><p>调整或清空筛选，探索更多选择。</p></div>'}</div>`;$('#openBrand').onclick=openBrand;if($('#clearFilters'))$('#clearFilters').onclick=()=>{filters={brand:'',level:'',scenario:'',driveType:''};renderTuning()};};
renderDetail=function(){const c=detailCar;if(!c){navigate('carRecommendation');return}const matched=c.tuningData.filter(t=>tuneMatches(t)&&(!detailTier||t.tier===detailTier));const list=detailOrigin==='carRecommendation'&&!showAll?matched:c.tuningData;$('#subcontent').innerHTML=`<section class="vehicle-masthead"><div class="vehicle-masthead-copy"><span class="eyebrow">${c.brand.toUpperCase()}</span><h2>${esc(c.name)}</h2><div class="masthead-meta"><span>${c.category}</span><span>${c.driveType}</span><b class="class-tag">${c.level}</b></div><button id="collectCar" class="save-button ${collected.has(c._id)?'saved':''}" aria-label="${collected.has(c._id)?'取消收藏':'收藏车辆'}">${collected.has(c._id)?'★ 已收藏':'☆ 收藏车辆'}</button><small>车辆与配图为演示内容</small></div><div class="masthead-car"><span class="masthead-number">${c.level}</span><img src="assets/cars/${c.image}" alt="${esc(c.name)} 演示配图"></div></section><div class="setup-layout"><aside class="spec-card"><span class="eyebrow">THE DETAILS</span><h3>认识这台车</h3><dl>${[['品牌',c.brand],['国家',c.country],['类别',c.category],['驱动',c.driveType],['获取方式',c.obtainMethod]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p>演示车辆数据，仅用于布局与交互预览。</p></aside><section><div class="detail-heading"><div><span class="eyebrow">FIND THE RIGHT FEEL</span><h2>调校推荐 <small>${list.length} 套方案</small></h2></div>${detailOrigin==='carRecommendation'&&matched.length<c.tuningData.length?`<button id="showAll">${showAll?'仅看匹配':'全部调校'} ${showAll?matched.length:c.tuningData.length} ↗</button>`:''}</div>${list.map(t=>`<article class="tune"><div class="tune-top"><div class="tags"><b class="tier-chip">${t.tier}</b><b class="level-${t.level}">${t.level}</b>${t.online?'<span class="online">线上竞速</span>':''}<span>${t.scenario}</span><span>${t.driveType}</span><span>${t.tireType}</span></div><button class="like ${liked.has(t.tuningId)?'liked':''}" data-like="${t.tuningId}">${liked.has(t.tuningId)?'♥':'♡'} ${t.likes+(liked.has(t.tuningId)?1:0)}</button></div><div class="tuner-row"><button class="tuner-profile" data-tuner="${t.tuner}"><span class="author-avatar">${t.tuner.split(' ')[1][0]}</span><span><small>调校师</small><strong>${t.tuner}</strong></span><span class="tuner-more">查看主页 ↗</span></button><button class="copy-tuner" data-copy="${t.tuner}">复制调校师 ID <span>⧉</span></button></div><p class="tune-desc"><span>调校简评</span>${t.description}</p></article>`).join('')||'<div class="placeholder">暂无匹配调校</div>'}</section></div>`;$('#collectCar').onclick=()=>{collected.has(c._id)?collected.delete(c._id):collected.add(c._id);saveCollect();renderDetail()};if($('#showAll'))$('#showAll').onclick=()=>{showAll=!showAll;renderDetail()};};
// Give each secondary page its own web page heading through the same navigation.
updateNick();

// Header navigation uses disclosures so every destination remains a normal button.
routeDescriptions.liveryCenter=['MAKE IT YOURS','涂装中心','为你的座驾，找到属于自己的风格。'];
routeDescriptions.weeklyPhotos=['THROUGH THE LENS','每周相片','公路、风景与座驾，记录驾驶之外的瞬间。'];
routeDescriptions.leagueStandings[1]='赛事中心';
routeDescriptions.ranking[1]='创作者排行榜';
const navigationGroups=[...document.querySelectorAll('.nav-group')];
function closeNavigation(except=null){navigationGroups.forEach(group=>{if(group===except)return;group.querySelector('.nav-toggle').setAttribute('aria-expanded','false');group.querySelector('.nav-dropdown').hidden=true;});}
navigationGroups.forEach(group=>{
 const toggle=group.querySelector('.nav-toggle'),panel=group.querySelector('.nav-dropdown');
 const open=()=>{closeNavigation(group);toggle.setAttribute('aria-expanded','true');panel.hidden=false;};
 toggle.addEventListener('click',()=>{if(panel.hidden)open();else closeNavigation();});
 group.addEventListener('focusout',event=>{if(!group.contains(event.relatedTarget))closeNavigation();});
 group.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.stopPropagation();event.preventDefault();closeNavigation();toggle.focus();return;}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  event.preventDefault();const items=[...panel.querySelectorAll('button')];
  if(event.target===toggle){open();items[event.key==='ArrowUp'?items.length-1:0].focus();return;}
  const index=items.indexOf(document.activeElement);
  items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();
 });
});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-group')||event.target.closest('[data-route],[data-open-profile]'))closeNavigation();if(event.target.closest('[data-open-profile]'))drawer(true);});
const renderExistingPage=render;
render=function(){
 if(currentRoute==='liveryCenter'){
  $('#subcontent').innerHTML='<section class="placeholder livery-preview"><span class="eyebrow">LIVERY STUDIO</span><h2>给座驾一点自己的颜色</h2><p>涂装中心已设为独立入口。目前为界面预览，涂装作品与分享码尚未接入。</p><button data-route="carSelection">先逛逛全车辆库 →</button></section>';
 }else if(currentRoute==='weeklyPhotos'){
  renderAlbum();
 }else renderExistingPage();
};
const navigateExistingPage=navigate;
navigate=function(route,push=true){
 closeNavigation();navigateExistingPage(route,push);
 if(routeDescriptions[route])$('#pageTitle').textContent=routeDescriptions[route][1];
 navigationGroups.forEach(group=>group.querySelector('.nav-toggle').classList.toggle('active',[...group.querySelectorAll('[data-route]')].some(item=>item.dataset.route===route)));
 document.querySelectorAll('.primary-navigation [data-route]').forEach(button=>{if(button.dataset.route===route&&(!button.dataset.tuningMode||button.dataset.tuningMode===mode))button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 if(!route)refreshHomeSaved();
};
document.querySelector('.primary-navigation [data-route=""]').setAttribute('aria-current','page');

// Choose the tuning mode before app.js handles the destination click.
document.addEventListener('click',event=>{const entry=event.target.closest('[data-tuning-mode]');if(entry){mode=entry.dataset.tuningMode;filters={brand:'',level:'',scenario:'',driveType:''};}},true);

// Personal content lives on the homepage; the driver control retains profile editing.
const formerDrawerSections=[...document.querySelectorAll('#drawer .drawer-body>section')];
$('#homeLeague').append(formerDrawerSections[0]);
$('#homeActivity').append(formerDrawerSections[1]);
$('#homeBlueprint').append(formerDrawerSections[2]);
$('#drawer .drawer-body').innerHTML='<section class="driver-profile-summary"><span class="eyebrow">YOUR DRIVER PROFILE</span><h3>我的车手档案</h3><p>记录你的代号，继续下一段旅程。</p><button id="editProfileName" class="copy-tuner">修改车手代号</button><button data-route="" class="profile-home-link">回到首页 · 收藏与推荐 →</button></section>';
$('#editProfileName').onclick=editName;
function refreshHomeSaved(){
 const saved=cars.filter(car=>collected.has(car._id));
 $('#homeSaved').innerHTML=saved.length?`<div class="saved-preview-list">${saved.slice(0,2).map(car=>`<button data-car="${car._id}"><img src="assets/cars/${car.image}" alt="${esc(car.name)}"><span><small>${car.brand}</small><strong>${esc(car.name)}</strong></span><b>↗</b></button>`).join('')}</div>`:'<div class="saved-empty"><span>♡</span><div><strong>下一台心仪座驾，留在这里。</strong><p>收藏车辆，回到首页就能接着看。</p><button data-route="carSelection">逛逛车辆库 →</button></div></div>';
}
refreshHomeSaved();

routeDescriptions.weeklyPhotos[1]='玩家相册';
const communityPhotos=[
 {src:'assets/home/seasonal-guide-bg-v2.jpg',title:'公路之间',author:'演示相片',headline:'把你的地平线，<br>分享给所有人。'},
 {src:'assets/home/car-library-bg-v2.jpg',title:'下一段旅程',author:'演示相片',headline:'一台车，一段路，<br>也是你的作品。'},
 {src:'assets/home/blueprint-bg-v2.jpg',title:'沿途风景',author:'演示相片',headline:'不必追求最快，<br>也能留下精彩。'}
];
let featuredPhotoIndex=0,photoRotationPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function showFeaturedPhoto(index){
 featuredPhotoIndex=(index+communityPhotos.length)%communityPhotos.length;
 const photo=communityPhotos[featuredPhotoIndex];
 $('#featuredPhoto').src=photo.src;$('#featuredPhoto').alt=photo.title+' · '+photo.author;
 $('#featuredPhotoTitle').innerHTML=photo.headline||esc(photo.title);
 $('#featuredPhotoAuthor').textContent=photo.title+' · '+photo.author;
 $('#photoCount').textContent=String(featuredPhotoIndex+1).padStart(2,'0')+' / '+String(communityPhotos.length).padStart(2,'0');
 $('#photoDots').innerHTML=communityPhotos.map((item,i)=>`<button data-photo-index="${i}" aria-label="第 ${i+1} 张：${esc(item.title)}" aria-pressed="${i===featuredPhotoIndex}"></button>`).join('');
}
function updatePhotoRotationControl(){const button=$('#pausePhotos');button.textContent=photoRotationPaused?'▶':'Ⅱ';button.setAttribute('aria-label',photoRotationPaused?'播放轮播':'暂停轮播');button.setAttribute('aria-pressed',String(photoRotationPaused));}
$('#previousPhoto').onclick=()=>showFeaturedPhoto(featuredPhotoIndex-1);
$('#nextPhoto').onclick=()=>showFeaturedPhoto(featuredPhotoIndex+1);
$('#pausePhotos').onclick=()=>{photoRotationPaused=!photoRotationPaused;updatePhotoRotationControl();};
$('#heroHit').onclick=()=>{const photo=communityPhotos[featuredPhotoIndex];$('#photo img').src=photo.src;$('#photo img').alt=photo.title;$('#photo p').textContent=photo.title+' · '+photo.author;$('#photo').showModal();};
$('.photo-feature').addEventListener('keydown',event=>{if(event.target!==event.currentTarget)return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();showFeaturedPhoto(featuredPhotoIndex+(event.key==='ArrowRight'?1:-1));}});
setInterval(()=>{const feature=$('.photo-feature');if(!photoRotationPaused&&!currentRoute&&!document.hidden&&!feature.matches(':hover')&&!feature.contains(document.activeElement)&&!document.querySelector('dialog[open]'))showFeaturedPhoto(featuredPhotoIndex+1);},6000);
function renderAlbum(){
 $('#subcontent').innerHTML=`<div class="album-intro"><p>不必是调校师或赛道作者，一张相片也能成为社区的一部分。</p><button class="web-primary" data-submit-photo>投稿我的相片 ＋</button></div><div class="weekly-photo-grid">${communityPhotos.map((photo,index)=>`<button class="weekly-photo" data-album-photo="${index}"><img src="${photo.src}" alt="${esc(photo.title)}"><span><small>PHOTO ${String(index+1).padStart(2,'0')} · ${esc(photo.author)}</small><strong>${esc(photo.title)}</strong><b>查看大图 ↗</b></span></button>`).join('')}</div>`;
}
document.addEventListener('click',event=>{
 const dot=event.target.closest('[data-photo-index]');if(dot)showFeaturedPhoto(Number(dot.dataset.photoIndex));
 if(event.target.closest('[data-submit-photo]'))$('#photoSubmission').showModal();
 const albumPhoto=event.target.closest('[data-album-photo]');if(albumPhoto){const photo=communityPhotos[Number(albumPhoto.dataset.albumPhoto)];$('#photo img').src=photo.src;$('#photo img').alt=photo.title;$('#photo p').textContent=photo.title+' · '+photo.author;$('#photo').showModal();}
});
$('#photoSubmissionForm').onsubmit=async event=>{
 event.preventDefault();const file=$('#submissionFile').files[0],title=$('#submissionTitle').value.trim();if(!file||!title)return;
 if(!file.type.startsWith('image/')){notify('请选择图片文件');return;}
 const src=URL.createObjectURL(file),image=new Image();image.src=src;
 try{await image.decode();}catch{URL.revokeObjectURL(src);notify('这张图片无法读取，请重新选择');return;}
 communityPhotos.push({src,title,author:nick+' · 本地预览'});$('#photoSubmission').close();event.target.reset();showFeaturedPhoto(communityPhotos.length-1);
 if(currentRoute==='weeklyPhotos')renderAlbum();else navigate('');notify('相片已加入本次页面预览');
};
showFeaturedPhoto(0);updatePhotoRotationControl();
