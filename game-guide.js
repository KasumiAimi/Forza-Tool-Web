// Original demonstration content for the local guide prototype.
(()=>{
const categories=[
 {id:'start',name:'刚开始玩',hint:'设置、机制与第一台车',mark:'01'},
 {id:'drive',name:'开得更快',hint:'走线、刹车与驾驶技巧',mark:'02'},
 {id:'tune',name:'改车与调校',hint:'选车、改装与参数',mark:'03'},
 {id:'explore',name:'探索与收集',hint:'地图、相册与收集计划',mark:'04'}
];
const guides=[
 {id:'settings',cat:'start',title:'出发前，先找到适合自己的驾驶设置',desc:'从视角与辅助开始，一次只改一个选项。',level:'入门',time:4,tags:['设置','辅助'],sections:[
 ['先让画面看得舒服','选择能看清弯心与出弯方向的视角，再调整界面与控制设置。先保证能稳定观察路线，不必一开始就照搬别人的配置。'],
 ['一次只调整一个辅助','选一段熟悉的路线作为练习场。每次只调整一个选项，对比车辆是否更容易控制；如果失误明显增加，可以先恢复原设置。'],
 ['保留自己的练习基准','记录车辆、路线和设置。下一次练习使用同一套条件，才能分辨进步来自驾驶，还是来自更换了车辆。']]},
 {id:'first-car',cat:'start',title:'第一台练习车，应该怎么选？',desc:'先看可控性，再看性能数字。',level:'入门',time:3,tags:['选车','车辆'],sections:[
 ['先明确用途','练习公路驾驶与探索地图，对车辆的需求并不完全相同。先确定要做什么，再缩小选择范围。'],
 ['选择反馈清楚的车辆','从动力适中、容易稳定行驶的车辆开始。同一台车多跑几次，比不断换车更容易建立对刹车和转向的判断。'],
 ['看懂信息再做比较','结合车辆类型、驱动形式与调校用途进行比较，性能分数只是参考之一。可以到全车辆库继续查看基础信息。']]},
 {id:'braking',cat:'drive',title:'刹车、入弯、出弯：把一个弯拆开练',desc:'用三个明确的动作，建立连贯的过弯节奏。',level:'入门',time:5,tags:['走线','刹车'],sections:[
 ['先找刹车参照','选择路边清楚、稳定的标志作为参照，先在直线阶段减速。连续几次都能顺利入弯之后，再小幅调整刹车时机。'],
 ['让入弯留有余量','如果总是在弯中冲向外侧，先降低入弯速度。不要一边修正失误，一边急着追求更高的速度。'],
 ['看向出口，逐步加速','把视线移向出弯方向，随着方向盘回正逐步增加油门。保持动作连贯，比突然大幅操作更容易复现。']]},
 {id:'drive-types',cat:'drive',title:'换了驱动形式，为什么手感不同？',desc:'观察加速时的反馈，重新安排你的操作节奏。',level:'进阶',time:4,tags:['驱动','控制'],sections:[
 ['先观察，再下结论','轮胎、动力和调校都会影响手感。比较驱动形式时，尽量保持其他条件接近。'],
 ['从低速弯开始熟悉','在熟悉的弯道逐渐增加油门，观察车辆前后部分的反应。避免用一次失误给整类车辆下结论。'],
 ['为不同车辆保留适应时间','更换车辆之后，先做几次稳定练习，再调整自己的刹车与出弯节奏。']]},
 {id:'pick-tune',cat:'tune',title:'如何挑选一套适合自己的调校',desc:'从用途和驱动形式出发，读懂推荐条目。',level:'入门',time:4,tags:['调校','选车'],sections:[
 ['先匹配比赛用途','先确认路线类型和车辆等级要求，再阅读调校的适用场景。不同用途的方案不能只按热度直接比较。'],
 ['读懂方案的信息','留意等级、驱动形式、轮胎与作者说明。推荐等级可以帮助缩小范围，但适合自己的控制手感同样重要。'],
 ['在相同条件下试跑','选同一段路线比较两套方案，先看能否稳定完成，再比较成绩。到全调校库继续寻找候选方案。']]},
 {id:'tune-notes',cat:'tune',title:'开始调参数之前，先学会描述问题',desc:'把“车不好开”变成可以逐项验证的观察。',level:'进阶',time:5,tags:['参数','调校'],sections:[
 ['描述问题出现的时刻','问题是在刹车时、弯中还是加速时出现？先记录具体场景，避免同时改变多个方向的参数。'],
 ['保存原方案','开始修改之前保留可恢复的基准。一次只做一处小调整，在同一段路线验证变化。'],
 ['记录结果而不是猜测','写下修改项、驾驶反馈与是否更稳定。如果变化没有帮助，就恢复基准后再尝试。']]},
 {id:'explore-plan',cat:'explore',title:'给自由探索安排一条轻松的路线',desc:'按区域做计划，让地图探索不再像清单打卡。',level:'入门',time:3,tags:['探索','地图'],sections:[
 ['选一个小区域','一次只选一片想去的区域，把附近的兴趣点安排在一起。不要让路线被过多的目标打断。'],
 ['为意外发现留时间','看到喜欢的道路或风景就停一停。探索的路线可以随时改变，完成数量不必成为唯一目标。'],
 ['把喜欢的地方留下来','用截图或笔记记录地点，下一次可以换一台车重游，也可以整理成自己的相册。']]},
 {id:'photo',cat:'explore',title:'拍车之前，先看光线和背景',desc:'从干净的构图开始，给喜欢的车留下一张相片。',level:'入门',time:3,tags:['摄影','相册'],sections:[
 ['先选背景','尽量避开穿过车身轮廓的杂乱元素，让车辆与背景有清楚的明暗或颜色区别。'],
 ['观察车身的受光','稍微改变车辆方向，比较车身轮廓与反光是否更清楚。先找到喜欢的光线，再调整构图。'],
 ['少量调整，多做比较','先保留一张基础版本，再逐项调整画面效果。对比时留意车辆是否仍然是画面中的重点。']]}
];
const state={cat:'',query:'',level:'',article:''};
let controller;
const catName=id=>categories.find(c=>c.id===id).name;
const e=value=>esc(String(value));
function mount(){
 controller?.abort();controller=new AbortController();
 const root=document.querySelector('#subcontent'),signal=controller.signal;
 state.article=guides.some(item=>item.id===guideArticleId)?guideArticleId:'';
 document.querySelector('#pageTitle').textContent='游戏攻略';
 root.innerHTML=`<section class="gg-shell"><div class="gg-intro"><div><span class="gg-kicker">车手手册</span><h2>今天想了解什么？</h2><p>从第一次出发，到找到自己的驾驶节奏。</p></div><label class="gg-search"><span>搜索攻略</span><input id="ggSearch" type="search" placeholder="搜索选车、刹车、调校…" value="${e(state.query)}"></label></div><div class="gg-entry-grid">${categories.map(c=>`<button class="gg-entry" data-gg-cat="${c.id}" aria-pressed="${state.cat===c.id}"><span class="gg-entry-number">${c.mark}</span><strong>${c.name}</strong><small>${c.hint}</small><span class="gg-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><div class="gg-body"></div></section>`;
 root.querySelector('#ggSearch').addEventListener('input',event=>{state.query=event.target.value;state.article='';draw();},{signal});
 root.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.hasAttribute('data-gg-cat')){state.cat=target.dataset.ggCat;state.article='';draw();}
  if(target.hasAttribute('data-gg-level')){state.level=target.dataset.ggLevel;draw();}
  if(target.hasAttribute('data-gg-open')){state.article=target.dataset.ggOpen;draw();root.querySelector('.gg-article-title').focus({preventScroll:true});root.querySelector('.gg-body').scrollIntoView({block:'start',behavior:'smooth'});}
  if(target.hasAttribute('data-gg-back')){const previous=state.article;state.article='';draw();root.querySelector(`[data-gg-open="${previous}"]`)?.focus({preventScroll:true});}
  if(target.hasAttribute('data-gg-clear')){state.cat='';state.query='';state.level='';state.article='';root.querySelector('#ggSearch').value='';draw();}
  if(target.hasAttribute('data-gg-section'))root.querySelector('#'+target.dataset.ggSection)?.scrollIntoView({behavior:'smooth',block:'start'});
 },{signal});
 draw();
}
function draw(){
 guideArticleId=state.article;syncVehicleHistory();
 const root=document.querySelector('#subcontent');
 root.querySelectorAll('.gg-entry').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ggCat===state.cat)));
 const body=root.querySelector('.gg-body');
 if(state.article){
 const a=guides.find(a=>a.id===state.article);
 body.innerHTML=`<div class="gg-reading"><article class="gg-article"><button class="gg-back" data-gg-back>← 返回攻略列表</button><div class="gg-meta">${catName(a.cat)} · ${a.level} · ${a.time} 分钟阅读</div><h2 class="gg-article-title" tabindex="-1">${a.title}</h2><p class="gg-deck">${a.desc}</p><div class="gg-notice">示例攻略 · 以下为通用驾驶与使用思路，用于预览正文排版。</div>${a.sections.map(([title,text],index)=>`<section class="gg-chapter" id="ggChapter${index}"><span>0${index+1}</span><div><h3>${title}</h3><p>${text}</p></div></section>`).join('')}<div class="gg-related"><strong>接下来，试试看</strong><p>把阅读中的思路带到选车和调校中。</p><button data-route="carSelection">打开全车辆库 ↗</button><button data-route="carRecommendation">打开全调校库 ↗</button></div></article><aside class="gg-toc"><span class="gg-kicker">本篇目录</span>${a.sections.map(([title],index)=>`<button data-gg-section="ggChapter${index}"><small>0${index+1}</small>${title}</button>`).join('')}<p>源于玩家，用于玩家</p></aside></div>`;return;
 }
 const terms=state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const list=guides.filter(a=>(!state.cat||a.cat===state.cat)&&(!state.level||a.level===state.level)&&terms.every(term=>[a.title,a.desc,catName(a.cat),...a.tags].join(' ').toLowerCase().includes(term)));
 body.innerHTML=`<aside class="gg-index"><span class="gg-kicker">手册索引</span><button data-gg-cat="" aria-pressed="${!state.cat}"><span>全部攻略</span><small>${guides.length}</small></button>${categories.map(c=>`<button data-gg-cat="${c.id}" aria-pressed="${state.cat===c.id}"><span>${c.name}</span><small>${guides.filter(a=>a.cat===c.id).length}</small></button>`).join('')}<div class="gg-index-note"><strong>慢慢来，也会更快。</strong><p>找一个感兴趣的问题，<br>从一篇攻略开始。</p></div></aside><section class="gg-list-panel"><div class="gg-list-heading"><div><h2>${state.cat?catName(state.cat):'从这里开始'}</h2><span role="status">${list.length} 篇攻略</span></div><div class="gg-levels" role="group" aria-label="攻略难度">${state.cat||state.query||state.level?'<button data-gg-clear>重置</button>':''}${['','入门','进阶'].map(level=>`<button data-gg-level="${level}" aria-pressed="${state.level===level}">${level||'全部'}</button>`).join('')}</div></div><div class="gg-list">${list.map((a,index)=>`<button class="gg-guide" data-gg-open="${a.id}"><span class="gg-guide-cover" aria-hidden="true"><span>${categories.find(c=>c.id===a.cat).mark}</span><i></i><small>${catName(a.cat)}</small></span><span class="gg-guide-copy"><span class="gg-meta">${catName(a.cat)}<b>${a.level}</b><span>图文 · ${a.time} 分钟</span></span><strong>${a.title}</strong><span class="gg-description">${a.desc}</span><span class="gg-tags">${a.tags.map(tag=>`<small># ${tag}</small>`).join('')}</span></span><span class="gg-open-arrow" aria-hidden="true">↗</span></button>`).join('')||'<div class="gg-empty"><h3>暂时没有匹配的攻略</h3><p>换个关键词，或清空筛选继续浏览。</p><button data-gg-clear>清空筛选</button></div>'}</div><div class="gg-list-foot">示例内容 · 正式攻略与作者信息后续接入<span>源于玩家，用于玩家</span></div></section>`;
}
const before=render;
render=function(){before();const active=currentRoute==='gameGuide';document.querySelector('#subpage').classList.toggle('game-guide-active',active);if(active)mount();else controller?.abort();};
render.tuner=before.tuner;
function cleanup(){if(currentRoute!=='gameGuide'){controller?.abort();document.querySelector('#subpage').classList.remove('game-guide-active');}}
onAfterNavigate(cleanup);
window.addEventListener('hashchange',cleanup);window.addEventListener('popstate',cleanup);
if(currentRoute==='gameGuide')render();
})();
