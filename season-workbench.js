const seasonPreviewEvents=[
 ['赛事','终极考验','本土车冲锋','B','复古车型','2023 迈凯伦 P1',[
  ['1991 Honda Beat','163 178 557'],['1991 Honda Beat','168 979 056']
 ]],
 ['赛事','公路锦标赛','都市传奇','S2','传奇稀有度','2009 法拉利 458 Italia',[
  ['2020 Lamborghini Essenza SCV12','261 228 647'],['2008 Mazda Furai','382 333 784'],
  ['1990 Alfa Romeo SE 048SP','605 027 138'],['2020 Lamborghini Essenza SCV12','109 854 576']
 ]],
 ['赛事','街头锦标赛','奋起挑战','A','道奇 Challenger','道奇 Viper SRT-10 ACR',[
  ['2015 Dodge Challenger SRT Hellcat','138 864 667'],['2023 Dodge Challenger SRT Demon 170','181 870 434'],['2015 Dodge Challenger SRT Hellcat','135 109 156']
 ]],
 ['赛事','公路锦标赛','街头狂欢','S1','法拉利','雪佛兰 Corvette Z06',[
  ['2015 Ferrari 488 GTB','180 742 896'],['2005 Ferrari FXX','103 419 123'],['2009 Ferrari 458 Italia','553 409 973']
 ]],
 ['特技','季节特技挑战','伊东半英里','B','丰田 Sera','抽奖 ×1',[['1991 Toyota Sera','126 911 925'],['1991 Toyota Sera','148 685 026']]],
 ['特技','季节特技挑战','秋叶原直道','B','丰田 Sera','抽奖 ×1',[['1991 Toyota Sera','126 911 925'],['1991 Toyota Sera','148 685 026']]],
 ['特技','季节特技挑战','市内竞速','B','丰田 Sera','抽奖 ×1',[['1991 Toyota Sera','423 523 262'],['1991 Toyota Sera','148 685 026']]],
 ['挑战','拍照挑战','城市生活','无限制','自由选择','表情奖励',[],'在东京房屋拍摄一张照片。'],
 ['挑战','寻宝挑战','东京市','无限制','自由选择','100,000 CR',[],'在东京市查找宝藏。'],
 ['挑战','每周挑战','大城小城','无限制','1984 Honda City E II','150,000 CR',[['1984 Honda City E II','118 280 195'],['1984 Honda City E II','148 380 791']]]
];
const seasonCurrentEvents=['公路竞速','拉力竞速','越野竞速','每周挑战'].map((name,index)=>{
 const car=cars[index], tune=car.tuningData[0];
 return [index===3?'挑战':'赛事','演示任务',name,tune.level,'演示车辆限制','待公布',[[car.name,'',car]],''];
});
const seasonIllustrations=['FH6_Lamborghini_Huracan_EVO.webp','FH6_Mazda_Savanna_RX-7.webp','FH6_Ferrari_F8_Tributo.webp'];
function renderSeason(preview=false){
 const events=preview?seasonPreviewEvents:seasonCurrentEvents;
 const rewards=preview?[['2025 Citroën','Ami'],['1996 Toyota','Starlet Glanza V']]:cars.slice(0,2).map(car=>[car.brand,car.name]);
 const root=$('#subcontent');
 let selected=preview?1:0, filter='';
 root.innerHTML=`<section class="season-workbench" aria-label="季节赛攻略">
  <div class="sw-nav" aria-label="选择赛季">
   <button type="button" data-route="seasonalEvents" aria-current="${preview?'false':'page'}">本周攻略</button>
   <button type="button" data-route="seasonPreview" aria-current="${preview?'page':'false'}">下期预告</button>
  </div>
  <section class="sw-stage" aria-label="赛季时间与奖励">
   <div class="sw-season">
    <svg class="sw-season-mark" viewBox="0 0 307 190" preserveAspectRatio="xMinYMid slice" aria-hidden="true"><text x="-13" y="186">${preview?'S7':'S3'}</text></svg>
    <div class="sw-season-info"><small>${preview?'下期预告 · 尚未开始':'当前赛季'}</small><h2>${preview?'夏季赛':'冬季赛'}</h2>
     <p>${preview?'距离开启':'剩余时间'} <b>${preview?'00':'03'}</b> 天 <b>14</b> 小时</p><progress max="100" value="${preview?0:48}" aria-label="示例赛季时间进度"></progress>
    </div>
   </div>
   ${rewards.map(([brand,name],i)=>{
    const car=cars[i], score=i?30:15;
    const content=`<span class="sw-reward-lamp" aria-hidden="true"></span><span class="sw-reward-platform" aria-hidden="true"></span>
     <img src="${esc(garageImage(car))}" alt=""><span class="sw-reward-caption"><b>${score} <small>分</small></b><strong><span>${esc(brand)}</span><span>${esc(name)}</span></strong></span>`;
    return preview?`<div class="sw-reward">${content}</div>`:`<button type="button" class="sw-reward" data-car="${esc(car._id)}" aria-label="查看 ${esc(car.name)} 车辆详情">${content}</button>`;
   }).join('')}
  </section>
  <div class="sw-work">
   <aside class="sw-menu"><div class="sw-menu-heading"><h2>赛程与任务</h2><span>${events.length} 项</span></div>
    <div class="sw-filters" role="group" aria-label="筛选赛程">${['','赛事','特技','挑战'].map(type=>`<button type="button" data-sw-filter="${type}" aria-pressed="${!type}">${type||'全部'}</button>`).join('')}</div>
    <div class="sw-list" aria-label="赛程列表"></div>
   </aside>
   <section class="sw-detail" aria-label="所选赛事详情" aria-live="polite"></section>
  </div>
  <footer class="sw-foot"><span>演示数据 · 车图与倒计时仅供预览</span><button type="button" data-sw-archive>查看往期季节赛攻略 ↗</button></footer>
  <dialog class="sw-archive"><h2>往期季节赛攻略</h2><p>目前暂无可查看的往期攻略。</p><form method="dialog"><button>关闭</button></form></dialog>
 </section>`;
 const list=root.querySelector('.sw-list'), detail=root.querySelector('.sw-detail');
 function paint(){
  list.innerHTML=events.map(([category,type,name,level],i)=>filter&&category!==filter?'':`<button type="button" class="sw-race" data-sw-event="${i}" aria-pressed="${i===selected}"><i>${String(i+1).padStart(2,'0')}</i><strong>${esc(name)}</strong><small>${esc(type)}</small><b class="sw-rank level-${esc(level)}">${esc(level)}</b></button>`).join('')||'<p class="sw-empty">本期暂无此类项目</p>';
  if(selected<0){detail.innerHTML='<p class="sw-empty">选择其他分类查看赛程。</p>';return;}
  const [,type,name,level,limit,reward,tunes,notes]=events[selected];
  detail.innerHTML=`<header class="sw-event"><div><small>${String(selected+1).padStart(2,'0')}　/　${esc(type)}</small><h2>${esc(name)}</h2><p><b class="sw-rank level-${esc(level)}">${esc(level)}</b> 车辆限制 · ${esc(limit)}</p></div><span class="sw-watermark" ${level.length>2?'data-long':''} aria-hidden="true">${esc(level)}</span></header>
   <div class="sw-content">${tunes.length?`<div class="sw-table-head"><b>推荐车辆与调校</b><span>${tunes.length} 套方案</span></div>${tunes.map(([carName,code,car],i)=>`<div class="sw-tune"><i>${String(i+1).padStart(2,'0')}</i><img src="assets/${car?'cars/'+esc(car.image):'official-cars/'+seasonIllustrations[i%seasonIllustrations.length]}" alt="">
    ${car?`<button type="button" class="sw-car-link" data-car="${esc(car._id)}">${esc(carName)} ↗</button>`:`<strong>${esc(carName)}</strong>`}
    <code>${esc(code||car.tuningData[0].tuner)}</code><button type="button" class="sw-copy" data-copy="${esc(code||car.tuningData[0].tuner)}">${code?'复制':'复制 ID'}</button></div>`).join('')}`:`<div class="sw-task"><h3>任务指引</h3><p>${esc(notes)}</p><small>地图与实景图待接入</small></div>`}
   <div class="sw-prize"><small>赛事奖励</small><b>${esc(reward)}</b></div></div>`;
 }
 list.onclick=event=>{const button=event.target.closest('[data-sw-event]');if(!button)return;selected=Number(button.dataset.swEvent);paint();list.querySelector('[aria-pressed=true]').focus({preventScroll:true});};
 root.querySelectorAll('[data-sw-filter]').forEach(button=>button.onclick=()=>{
  filter=button.dataset.swFilter;
  root.querySelectorAll('[data-sw-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  if(filter&&events[selected]?.[0]!==filter||selected<0)selected=events.findIndex(item=>!filter||item[0]===filter);
  paint();list.scrollTop=0;
 });
 root.querySelector('[data-sw-archive]').onclick=()=>root.querySelector('.sw-archive').showModal();
 paint();
}
