/* KIT CUP local demo. Scores are derived from the same weekly records shown in the detail panel. */
(() => {
 const groups = [{id:'high',name:'PRO组',base:28},{id:'mid',name:'熟练者组',base:25},{id:'low',name:'雏鹰组',base:22}];
 const names = ['KMTTB','Apex Kaze','Nori 86','Rally Echo','Mika Drift','Sora','Tomo','Kaito'];
 const seasons = [{id:'S3_202610',label:'S3 赛季 · 2026年10月',weeks:3},{id:'S2_202609',label:'S2 赛季 · 2026年9月',weeks:4}];
 const state = {season:seasons[0].id,group:'high',view:'weekly',week:3,query:'',player:null};
 const season = () => seasons.find(item=>item.id===state.season);
 const group = () => groups.find(item=>item.id===state.group);
 function records(driverIndex, groupId) {
  const spec = groups.find(item=>item.id===groupId);
  return Array.from({length:season().weeks},(_,weekIndex)=>{
   const rank = (driverIndex + weekIndex + (state.season===seasons[1].id?1:0)) % names.length + 1;
   const base = Math.max(1,spec.base-(rank-1)*2);
   const fastest = rank===1, safe = rank!==8;
   const bonus = Number(fastest)+Number(safe);
   return {week:weekIndex+1,rank,base,fastest,safe,bonus,total:base+bonus};
  });
 }
 function player(driverIndex, groupId=state.group, throughWeek=season().weeks) {
  const weeks = records(driverIndex,groupId).filter(item=>item.week<=throughWeek);
  const complete = weeks.length===4;
  const dropped = complete?[...weeks].sort((a,b)=>a.base-b.base||b.week-a.week)[0]:null;
  const official = weeks.filter(item=>item!==dropped).reduce((sum,item)=>sum+item.base,0);
  const bonus = weeks.reduce((sum,item)=>sum+item.bonus,0);
  return {id:driverIndex,name:names[driverIndex],number:String(7+driverIndex*7+groups.findIndex(item=>item.id===groupId)*100),weeks,dropped,official,bonus,total:official+bonus,
   fastest:weeks.filter(item=>item.fastest).length,safe:weeks.filter(item=>item.safe).length};
 }
 function standings(throughWeek=season().weeks) {
  return names.map((_,i)=>player(i,state.group,throughWeek)).sort((a,b)=>b.total-a.total||a.id-b.id).map((item,index)=>({...item,rank:index+1}));
 }
 function results() {
  const previous = standings(Math.max(1,season().weeks-1));
  const all = state.view==='weekly'
   ? names.map((_,i)=>({...player(i),match:records(i,state.group).find(item=>item.week===state.week)})).filter(item=>item.match).sort((a,b)=>a.match.rank-b.match.rank).map(item=>({...item,rank:item.match.rank}))
   : standings().map(item=>({...item,movement:previous.find(entry=>entry.id===item.id).rank-item.rank}));
  const q = state.query.trim().toLowerCase();
  return all.filter(item=>[item.name,item.number,'#'+item.number,String(item.rank)].some(value=>value.toLowerCase().includes(q)));
 }
 function points(value) { return '<b class="lc-points">'+value+'</b>'; }
 function table(rows) {
  if(!rows.length)return '<div class="lc-empty"><h3>'+(state.query?'没有符合条件的车手':'本周暂无正式比赛记录')+'</h3><p>'+(state.query?'试试其他名称、车号或名次。':'选择其他周次查看成绩。')+'</p>'+(state.query?'<button type="button" data-lc-clear>清空搜索</button>':'')+'</div>';
  const weekly=state.view==='weekly';
  const headers=weekly?['名次','车手','本场成就','基础分','加分','本场积分','明细']:['排名','车手','最快圈 / 安全完赛','有效正赛','额外加分','去一情况','总积分','明细'];
  return '<table class="lc-table"><caption class="lc-sr-only">'+esc(group().name)+' '+(weekly?'W'+state.week:'赛季总榜')+'</caption><thead><tr>'+headers.map(value=>'<th scope="col">'+value+'</th>').join('')+'</tr></thead><tbody>'+rows.map(item=>{
   const selected=item.id===state.player,match=item.match;
   const movement=!weekly&&item.movement?'<span class="lc-movement">'+(item.movement>0?'↑':'↓')+Math.abs(item.movement)+'</span>':'';
   return '<tr class="'+(selected?'is-selected':'')+'"><td>'+String(item.rank).padStart(2,'0')+movement+'</td><td><button type="button" class="lc-driver" data-lc-player="'+item.id+'" aria-label="查看 '+esc(item.name)+' 的积分明细" aria-pressed="'+selected+'"><small>#'+item.number+'</small><strong>'+esc(item.name)+'</strong></button></td>'+
    (weekly?'<td>'+[match.fastest?'最快圈 +1':'',match.safe?'安全完赛 +1':''].filter(Boolean).join(' · ')+'</td><td>'+match.base+'</td><td>+'+match.bonus+'</td><td>'+points(match.total)+'</td>':
    '<td>'+item.fastest+' / '+item.safe+'</td><td>'+item.official+'</td><td>+'+item.bonus+'</td><td>'+(item.dropped?'去 W'+item.dropped.week:'暂计')+'</td><td>'+points(item.total)+'</td>')+'<td><button type="button" class="lc-detail-link" data-lc-player="'+item.id+'" aria-label="查看 '+esc(item.name)+' 的详细积分" aria-pressed="'+selected+'">查看明细 ↗</button></td></tr>';
  }).join('')+'</tbody></table>';
 }
 function detail() {
  if(state.player===null)return '<header><h2 id="lc-detail-title">选手详细积分</h2></header><div class="lc-detail-placeholder"><span aria-hidden="true">≡</span><h3>选择一位车手</h3><p>点击榜单中的车手名称或“查看明细”，在这里查看本场积分、赛季总分与逐周成绩。</p></div>';
  const item=player(state.player), rank=standings().find(entry=>entry.id===item.id).rank;
  const match=item.weeks.find(entry=>entry.week===state.week), complete=season().weeks===4;
  return '<header><h2 id="lc-detail-title">选手详细积分</h2><button type="button" data-lc-close aria-label="清除选手选择">×</button></header>'+
   '<h3>'+esc(item.name)+' <small>#'+item.number+'</small></h3>'+
   (state.view==='weekly'&&match?'<p class="lc-match-summary">W'+state.week+' 本场第 '+match.rank+' 名 · 基础 '+match.base+'　加分 +'+match.bonus+'　<b>合计 '+match.total+'</b></p>':'')+
   '<p class="lc-season-rank">赛季第 '+rank+' 名 · '+(complete?'有效总积分':'暂计总积分')+' <strong>'+item.total+'</strong></p>'+
   '<div class="lc-stats"><div><b>'+item.official+'</b><span>有效正赛</span></div><div><b>+'+item.bonus+'</b><span>额外加分</span></div><div><b>'+(item.dropped?'W'+item.dropped.week:'—')+'</b><span>'+(item.dropped?'已剔除':'等待去一')+'</span></div></div>'+
   '<ol class="lc-records">'+Array.from({length:4},(_,index)=>{
    const week=index+1,record=item.weeks.find(entry=>entry.week===week),dropped=item.dropped?.week===week;
    return '<li class="'+(dropped?'is-dropped':'')+'"><b>W'+week+'</b><div>'+(record?'第 '+record.rank+' 名 · '+record.base+' + '+record.bonus+' 分<small>'+[record.fastest?'最快圈 +1':'',record.safe?'安全完赛 +1':''].filter(Boolean).join(' · ')+'</small>':'暂无成绩')+'</div><span>'+(!record?'未开始':dropped?'已剔除':complete?'已计入':'暂计')+'</span></li>';
   }).join('')+'</ol><p class="lc-detail-note">最快圈 '+item.fastest+' 次 · 安全完赛 '+item.safe+' 次<br>四周完成后剔除最低一周正赛分，加分独立累计。</p>';
 }
 function paint() {
  const root=document.querySelector('.lc-center');
  if(!root)return;
  const rows=results();
  if(!rows.some(item=>item.id===state.player))state.player=null;
  root.querySelector('.lc-count').textContent=group().name+' · '+(state.view==='weekly'?'W'+state.week:'赛季总榜')+'　｜　'+rows.length+' 位车手';
  root.querySelector('.lc-results').innerHTML=table(rows);
  root.querySelector('.lc-detail').innerHTML=detail();
  root.querySelector('.lc-detail').hidden=false;
  root.querySelector('.lc-workspace').classList.add('has-detail');
  root.querySelector('.lc-weeks').hidden=state.view!=='weekly';
  root.querySelectorAll('[data-lc-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lcView===state.view)));
  root.querySelectorAll('[data-lc-group]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lcGroup===state.group)));
  root.querySelectorAll('[data-lc-week]').forEach(button=>{button.setAttribute('aria-pressed',String(Number(button.dataset.lcWeek)===state.week));});
 }
 function renderLeague() {
  const root=document.querySelector('#subcontent'),complete=season().weeks===4;
  if(state.player!==null&&!results().some(item=>item.id===state.player))state.player=null;
  if(state.player===null)state.player=results()[0]?.id??null;
  root.innerHTML='<section class="lc-center" aria-label="KIT CUP 赛事中心"><div class="lc-overview">'+
   '<section class="lc-season"><div class="lc-season-info"><h2><i>KIT CUP</i> 月度联赛</h2><label><span class="lc-sr-only">选择赛季</span><select data-lc-season>'+seasons.map(item=>'<option value="'+item.id+'" '+(item.id===state.season?'selected':'')+'>'+item.label+'</option>').join('')+'</select></label><p>第 '+season().weeks+'/4 周 <b>'+(complete?'已结算':'进行中')+'</b></p></div>'+
   '<div class="lc-progress" role="progressbar" aria-label="已录入比赛周数" aria-valuemin="0" aria-valuemax="4" aria-valuenow="'+season().weeks+'">'+Array.from({length:4},(_,i)=>'<span class="'+(i<season().weeks?'is-recorded':'')+'"></span>').join('')+'</div><p class="lc-progress-hint">'+(complete?'四周正式赛事已完成 · 赛季已结算':'当前为暂计积分 · 已录入 '+season().weeks+' 周')+'</p></section>'+
   '<article class="lc-poster"><button type="button" data-lc-poster aria-label="放大最新赛事海报"><img src="assets/home/latest_event.webp" alt="KIT CUP 白川拉力赛海报"></button><div><h2>最新赛事</h2><button type="button" data-copy="KMTTB" aria-label="报名参与，复制 B站联系人 KMTTB">报名参与 ↗</button></div></article></div>'+
   '<p class="lc-rule"><strong>积分规则</strong>四周完成后算 3 去 1，剔除最低一周正赛分，加分独立累计。</p>'+
   '<div class="lc-workspace"><section class="lc-main" aria-label="赛事排名"><div class="lc-views" role="group" aria-label="榜单类型">'+[['weekly','本周赛事排名'],['season','赛季选手总积分']].map(([value,label])=>'<button type="button" data-lc-view="'+value+'" aria-pressed="'+(value===state.view)+'">'+label+'</button>').join('')+'</div>'+
   '<div class="lc-main-grid"><nav class="lc-weeks" aria-label="比赛周次">'+Array.from({length:4},(_,i)=>'<button type="button" data-lc-week="'+(i+1)+'" aria-pressed="'+(state.week===i+1)+'"><b>W'+(i+1)+'</b><small>'+(complete||i+1<season().weeks?'已结束':i+1===season().weeks?'当前':'未开始')+'</small></button>').join('')+'</nav>'+
   '<div class="lc-board"><div class="lc-toolbar"><div class="lc-groups" role="group" aria-label="参赛组别">'+groups.map(item=>'<button type="button" data-lc-group="'+item.id+'" aria-pressed="'+(item.id===state.group)+'">'+item.name+'</button>').join('')+'</div>'+
   '<div class="lc-search"><input type="search" aria-label="搜索车手名称、ID、车号或名次" placeholder="车手名 / ID / 车号 / 名次" value="'+esc(state.query)+'"><button type="button" data-lc-clear aria-label="清空车手搜索">×</button></div></div>'+
   '<p class="lc-count" role="status"></p><div class="lc-results"></div></div></div></section><aside class="lc-detail" tabindex="-1" aria-labelledby="lc-detail-title"></aside></div>'+
   '<p class="lc-disclaimer">演示赛事与积分 · 源于玩家，用于玩家</p></section>';
  root.querySelector('[data-lc-season]').onchange=event=>{
   state.season=event.target.value;state.week=season().weeks;state.player=null;state.query='';renderLeague();
   root.querySelector('[data-lc-season]').focus({preventScroll:true});
  };
  root.querySelector('.lc-search input').oninput=event=>{state.query=event.target.value;paint();};
  root.querySelector('.lc-center').onclick=event=>{
   const button=event.target.closest('button');
   if(!button)return;
   let focusSelector='';
   if(button.dataset.lcView){state.view=button.dataset.lcView;state.query='';root.querySelector('.lc-search input').value='';focusSelector='[data-lc-view="'+state.view+'"]';}
   if(button.dataset.lcGroup){state.group=button.dataset.lcGroup;state.player=null;focusSelector='[data-lc-group="'+state.group+'"]';}
   if(button.dataset.lcWeek){state.week=Number(button.dataset.lcWeek);state.player=null;focusSelector='[data-lc-week="'+state.week+'"]';}
   if(button.hasAttribute('data-lc-player'))state.player=Number(button.dataset.lcPlayer);
   if(button.hasAttribute('data-lc-close')){focusSelector='[data-lc-player="'+state.player+'"]';state.player=null;}
   if(button.hasAttribute('data-lc-clear')){state.query='';root.querySelector('.lc-search input').value='';focusSelector='.lc-search input';}
   if(button.hasAttribute('data-lc-poster')){
    const dialog=document.querySelector('#photo');
    dialog.querySelector('img').src='assets/home/latest_event.webp';
    dialog.querySelector('img').alt='KIT CUP 白川拉力赛完整海报';
    dialog.querySelector('p').textContent='KIT CUP 白川拉力赛 · 演示赛事海报';
    dialog.showModal();
    return;
   }
   paint();
   if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});
   if(button.hasAttribute("data-lc-player")&&matchMedia("(max-width:1150px)").matches){const detailPanel=root.querySelector(".lc-detail");detailPanel.focus({preventScroll:true});detailPanel.scrollIntoView({block:"start"}); }
  };
  paint();
 }
 const previousRender=render;
 render=function(){
  document.querySelector('#subpage').classList.toggle('league-center-active',currentRoute==='leagueStandings');
  if(currentRoute==='leagueStandings')renderLeague();else previousRender();
 };
 render.tuner=previousRender.tuner;
 if(currentRoute==='leagueStandings')render();
})();
