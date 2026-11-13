// Local mock works for the vehicle detail layout. Codes and views are demonstrations.
const vehicleLiveryExamples=[
 {id:'livery-demo-01',name:'银影竞速',code:'000 000 101',tags:['竞速','金属银']},
 {id:'livery-demo-02',name:'午夜车队',code:'000 000 102',tags:['街头','深色']},
 {id:'livery-demo-03',name:'复古拉力',code:'000 000 103',tags:['复古','拉力']},
 {id:'livery-demo-04',name:'霓虹街道',code:'000 000 104',tags:['街头','撞色']},
 {id:'livery-demo-05',name:'原厂致敬',code:'000 000 105',tags:['原厂风','简约']},
 {id:'livery-demo-06',name:'极简赛道',code:'000 000 106',tags:['竞速','极简']}
].map((work,index)=>({...work,artist:['Demo Apex','Demo Drift','Demo Horizon'][index%3],style:['赛车','二次元','现实'][index%3],images:[{label:'左前视角',src:''},{label:'侧面视角',src:''},{label:'尾部视角',src:''}]}));

function mountVehicleLiveries(panel,car,state){
 const chosen=typeof liveryCenterWorks==='undefined'?null:liveryCenterWorks.find(work=>work.id===selectedLiveryWorkId&&garageImage(car).endsWith('/'+work.image));
 const works=chosen?[{...chosen,name:chosen.title,images:[{label:'左前视角',src:''},{label:'侧面视角',src:''},{label:'尾部视角',src:''}]},...vehicleLiveryExamples]:vehicleLiveryExamples;
 const columns=()=>innerWidth>850?3:panel.clientWidth>=480?3:panel.clientWidth>=300?2:1;
 const card=work=>`<article class="vehicle-livery-card ${state.activeId===work.id?'is-open':''}"><button type="button" class="vehicle-livery-open" data-livery-id="${work.id}" aria-expanded="${state.activeId===work.id}" aria-controls="vehicleLiveryDrawer">${typeof renderLiveryToybox==='function'?renderLiveryToybox({...work,image:work.image||car.officialImage||garageOfficialImages[car._id],brand:work.brand||car.brand,car:work.car||car.name},0):''}<span class="vehicle-livery-card-head"><strong>${esc(work.name)}</strong><span aria-hidden="true">${state.activeId===work.id?'−':'+'}</span></span></button><div class="vehicle-livery-code-row"><span class="vehicle-livery-code"><small>涂装代码</small><span>${esc(work.code)}</span></span><button type="button" class="vehicle-livery-copy" data-copy="${esc(work.code)}" aria-label="复制 ${esc(work.name)} 的演示代码">⧉</button></div><div class="vehicle-livery-bottom"><span class="vehicle-livery-tags">${work.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</span>${work.artist?`<button type="button" class="vehicle-livery-author" data-tuner="${esc(work.artist)}">${esc(work.artist)} ↗</button>`:''}</div></article>`;
 const drawer=work=>{
  const view=work.images[state.imageIndex];
  return `<section class="vehicle-livery-drawer" id="vehicleLiveryDrawer" aria-label="${esc(work.name)} 图片预览"><div class="vehicle-livery-drawer-heading"><div><strong>${esc(work.name)}</strong><small>虚拟涂装作品</small></div><button type="button" data-livery-close aria-label="收起涂装图片">×</button></div><div class="vehicle-livery-viewer"><button type="button" class="vehicle-livery-arrow previous" data-livery-step="-1" aria-label="上一张涂装图片" aria-controls="vehicleLiveryImage">‹</button><div id="vehicleLiveryImage" class="vehicle-livery-image">${view.src?`<img src="${esc(view.src)}" alt="${esc(car.name+' · '+work.name+' · '+view.label)}">`:`<div class="vehicle-livery-image-placeholder"><svg viewBox="0 0 64 48" aria-hidden="true"><rect x="3" y="3" width="58" height="42" rx="3"/><circle cx="44" cy="15" r="4"/><path d="m6 37 17-17 13 13 7-7 15 15"/></svg><strong>涂装图片预留位</strong><span>${esc(view.label)}</span></div>`}</div><button type="button" class="vehicle-livery-arrow next" data-livery-step="1" aria-label="下一张涂装图片" aria-controls="vehicleLiveryImage">›</button></div><div class="vehicle-livery-view-footer"><div class="vehicle-livery-view-choices" aria-label="选择图片视角">${work.images.map((image,index)=>`<button type="button" data-livery-image="${index}" aria-pressed="${state.imageIndex===index}">${esc(image.label)}</button>`).join('')}</div><span class="vehicle-livery-image-status" role="status">${state.imageIndex+1} / ${work.images.length}</span></div></section>`;
 };
 const render=()=>{
  const previousScroll=panel.scrollTop;
  const count=columns();state.columns=count;
  const rows=[];
  for(let start=0;start<works.length;start+=count){
   const rowWorks=works.slice(start,start+count);
   const active=rowWorks.find(work=>work.id===state.activeId);
   rows.push(`<div class="vehicle-livery-row-group"><div class="vehicle-livery-row" style="--livery-columns:${count}">${rowWorks.map(card).join('')}</div>${active?drawer(active):''}</div>`);
  }
  panel.innerHTML=`<section class="vehicle-livery-gallery" aria-label="车辆涂装作品"><div class="vehicle-livery-heading"><h2>涂装作品 <small>${works.length} 件</small></h2><span>虚拟作品</span></div><p class="vehicle-livery-demo-note">以下为布局演示，分享代码不可在游戏中使用。</p>${rows.join('')}</section>`;
  panel.scrollTop=previousScroll;
 };
 const activeWork=()=>works.find(work=>work.id===state.activeId);
 const focus=selector=>panel.querySelector(selector)?.focus({preventScroll:true});
 const reveal=()=>{
  const group=panel.querySelector('.vehicle-livery-drawer')?.parentElement;
  if(!group)return;
  const area=panel.getBoundingClientRect(),bounds=group.getBoundingClientRect();
  if(bounds.bottom>area.bottom||bounds.top<area.top)panel.scrollTop+=bounds.top-area.top-6;
 };
 const changeImage=(index,focusSelector)=>{
  const work=activeWork();if(!work)return;
  state.imageIndex=(index+work.images.length)%work.images.length;
  render();focus(focusSelector);
 };
 const close=()=>{
  const id=state.activeId;state.activeId=null;render();focus(`[data-livery-id="${id}"]`);
 };
 panel.addEventListener('click',event=>{
  const open=event.target.closest('[data-livery-id]');
  if(open){
   const id=open.dataset.liveryId;
   state.activeId=state.activeId===id?null:id;state.imageIndex=0;
   render();focus(`[data-livery-id="${id}"]`);if(state.activeId)reveal();return;
  }
  const step=event.target.closest('[data-livery-step]');
  if(step){changeImage(state.imageIndex+Number(step.dataset.liveryStep),`[data-livery-step="${step.dataset.liveryStep}"]`);return;}
  const image=event.target.closest('[data-livery-image]');
  if(image){changeImage(Number(image.dataset.liveryImage),`[data-livery-image="${image.dataset.liveryImage}"]`);return;}
  if(event.target.closest('[data-livery-close]'))close();
 });
 panel.addEventListener('keydown',event=>{
  if(!event.target.closest('.vehicle-livery-drawer'))return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
  else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();
   const step=event.key==='ArrowRight'?1:-1;
   changeImage(state.imageIndex+step,`[data-livery-step="${step}"]`);
  }
 });
 render();
 const observer=new ResizeObserver(()=>{
  if(!panel.clientWidth)return;
  if(columns()!==state.columns){render();}
 });
 observer.observe(panel);
 return observer;
}
