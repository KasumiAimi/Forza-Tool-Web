// A fixed vehicle display with the existing detail actions and tuning data.
let vehicleScreenTab='tunes',vehicleScreenCar='';
let vehiclePerformanceObserver,vehicleLiveryObserver;
let vehicleLiveryState={activeId:null,imageIndex:0,columns:3};
const vehicleScreenOutline='M22 35 C100 49 185 59 280 59 C375 59 460 49 538 35 Q550 32 550 48 V472 Q550 486 536 486 H24 Q10 486 10 472 V48 Q10 32 22 35Z';

function vehicleScreenCurvedText(value,depth=4){
 const text=String(value),length=[...text].length;
 let index=0;
 return text.split(/(\s+)/).map(word=>{
  if(/^\s+$/.test(word)){index+=[...word].length;return ' ';}
  const glyphs=[...word].map(letter=>{
   const position=length>1?index/(length-1)*2-1:0;index++;
   const y=(depth*(1-position*position)).toFixed(2);
   const angle=(-position*2.4).toFixed(2);
   return `<span class="vehicle-curve-glyph" aria-hidden="true" style="--curve-y:${y}px;--curve-angle:${angle}deg">${esc(letter)}</span>`;
  }).join('');
  return `<span class="vehicle-curve-word">${glyphs}</span>`;
 }).join('');
}

const renderBeforeVehicleScreen=renderDetail;
renderDetail=function(){
 vehiclePerformanceObserver?.disconnect();
 vehicleLiveryObserver?.disconnect();
 renderBeforeVehicleScreen();
 if(!detailCar)return;
 const root=document.querySelector('#subcontent');
 const masthead=root.querySelector('.vehicle-masthead');
 const setup=root.querySelector('.setup-layout');
 if(!masthead||!setup)return;
 const car=detailCar;
 const screenKey=car._id+(['homeLivery','liveryCenter','liveryCollection','liveryProfile'].includes(detailOrigin)?':liveries':'')+':'+selectedLiveryWorkId;
 if(vehicleScreenCar!==screenKey){vehicleScreenCar=screenKey;vehicleScreenTab=['homeLivery','liveryCenter','liveryCollection','liveryProfile'].includes(detailOrigin)?'liveries':'tunes';vehicleLiveryState={activeId:null,imageIndex:0,columns:3};}
 const copyPanel=masthead.querySelector('.vehicle-masthead-copy');
 const specs=setup.querySelector('.spec-card');
 const tuneContent=setup.querySelector(':scope > section');
 const brand=document.createElement('div');
 brand.className='vehicle-screen-brand';
 brand.setAttribute('role','img');brand.setAttribute('aria-label',car.brand);
 brand.innerHTML=`<span class="vehicle-screen-emblem" aria-hidden="true">${esc(libraryBrandMark(car.brand))}</span><span class="vehicle-screen-brand-name">${vehicleScreenCurvedText(car.brand,3)}</span>`;
 const name=copyPanel.querySelector('h2');
 name.setAttribute('aria-label',car.name);
 name.innerHTML=vehicleScreenCurvedText(car.name,5);
 copyPanel.prepend(brand);
 copyPanel.append(specs);
 specs.querySelector('dl').innerHTML=[['国家',car.country],['驱动形式',car.driveType],['车辆分类',car.category],['获取方式',car.obtainMethod]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'暂无资料')}</dd></div>`).join('');
 const performance=document.createElement('div');
 performance.className='vehicle-screen-performance';
 performance.setAttribute('aria-label',`车辆等级 ${car.level}，性能分数 ${libraryDemoScore(car)}`);
 performance.title='演示性能分数';
 performance.innerHTML=`<span class="vehicle-screen-grade-wrap"><b class="garage-class garage-class-${esc(car.level)}">${esc(car.level)}</b></span><strong>${libraryDemoScore(car)}</strong>`;
 const official=car.officialImage||garageOfficialImages[car._id];
 if(official){const image=masthead.querySelector('img');image.src=garageImage(car);image.alt=car.brand+' '+car.name+' 官方车图';}
 const right=document.createElement('section');
 right.className='vehicle-screen-right';
 right.setAttribute('aria-label','车辆作品');
 const tunesCount=tuneContent.querySelectorAll('.tune').length;
 right.innerHTML=`<div class="vehicle-screen-toolbar"><div class="vehicle-screen-tabs" role="tablist" aria-label="选择作品类型"><button type="button" id="vehicleTunesTab" role="tab" data-vehicle-panel="tunes" aria-controls="vehicleTunesPanel">调校 <span>${tunesCount}</span></button><button type="button" id="vehicleLiveriesTab" role="tab" data-vehicle-panel="liveries" aria-controls="vehicleLiveriesPanel">涂装 <span> ${vehicleLiveryExamples.length+(typeof liveryCenterWorks!=='undefined'&&liveryCenterWorks.some(work=>work.id===selectedLiveryWorkId&&garageImage(car).endsWith('/'+work.image))?1:0)}</span></button></div><span class="vehicle-screen-caption">车辆调校工作台</span></div><div id="vehicleTunesPanel" class="vehicle-screen-panel" role="tabpanel" aria-labelledby="vehicleTunesTab" tabindex="0"></div><div id="vehicleLiveriesPanel" class="vehicle-screen-panel" role="tabpanel" aria-labelledby="vehicleLiveriesTab" tabindex="0"></div>`;
 right.querySelector('#vehicleTunesPanel').append(tuneContent);
 const screen=document.createElement('section');
 screen.className='vehicle-detail-screen';
 screen.setAttribute('aria-label',car.brand+' '+car.name+' 车辆详情');
 const scene=document.createElement('section');
 scene.className='vehicle-detail-stage';
 scene.setAttribute('aria-label','车辆与调校工作台');
 const ground=document.createElement('div');
 ground.className='vehicle-stage-ground';
 ground.setAttribute('aria-hidden','true');
 const feet=document.createElement('div');
 feet.className='vehicle-screen-feet';
 feet.setAttribute('aria-hidden','true');
 feet.innerHTML='<i></i><i></i>';
 right.insertAdjacentHTML('afterbegin','<div class="workshop-screws" aria-hidden="true"><i></i><i></i><i></i><i></i></div>');
 const display=document.createElement('div');
 display.className='vehicle-screen-shell';
 display.setAttribute('aria-hidden','true');
 display.innerHTML=`<svg viewBox="0 0 560 490" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vehicleScreenGraphite" x1="0" y1="0" x2=".9" y2="1"><stop style="stop-color:var(--screen-face-high)"/><stop offset="1" style="stop-color:var(--screen-face-low)"/></linearGradient><radialGradient id="vehicleScreenSheen" cx=".2" cy=".2" r=".85"><stop stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><pattern id="vehicleScreenTexture" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 7.5H8" stroke="#fff" stroke-opacity=".055" stroke-width=".6"/></pattern><clipPath id="vehicleScreenClip"><path d="${vehicleScreenOutline}"/></clipPath><g id="vehicleScreenBracket" fill="#353b3c" stroke="#22292a" stroke-width="4" stroke-linejoin="round"><path d="M-35 22V9Q-35 4-28 4H28Q35 4 35 9V22H23V13H-23V22Z"/><path d="M-19 0V26M19 0V26" stroke-width="6"/></g></defs><g clip-path="url(#vehicleScreenClip)"><rect width="560" height="490" fill="url(#vehicleScreenGraphite)"/><rect width="560" height="490" fill="url(#vehicleScreenTexture)"/><rect width="560" height="490" fill="url(#vehicleScreenSheen)"/><path d="M17 52V471" fill="none" style="stroke:var(--screen-amber)" stroke-opacity=".65" stroke-width="3"/><path d="M543 52V471" fill="none" style="stroke:var(--screen-amber)" stroke-opacity=".3" stroke-width="1.5"/><path d="M29 49C110 64 191 72 280 72C369 72 450 64 531 49" fill="none" style="stroke:var(--screen-amber)" stroke-opacity=".65" stroke-width="1.5"/><path d="M13 476H548V490H13Z" fill="#000" opacity=".25"/></g><path d="${vehicleScreenOutline}" fill="none" stroke="#252f31" stroke-width="7"/><path d="M22 39C100 53 185 63 280 63C375 63 460 53 538 39" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/><use href="#vehicleScreenBracket" transform="translate(90 27) rotate(5)"/><use href="#vehicleScreenBracket" transform="translate(280 39)"/><use href="#vehicleScreenBracket" transform="translate(470 27) rotate(-5)"/></svg>`;
 const vehicle=masthead.querySelector('.masthead-car');
 vehicle.classList.add('vehicle-stage-car');
 vehicle.querySelector('.masthead-number')?.remove();
 setup.replaceWith(scene);
 screen.append(display,masthead,performance,feet);
 scene.append(ground,screen,vehicle,right);
 vehicleLiveryObserver=mountVehicleLiveries(right.querySelector('#vehicleLiveriesPanel'),car,vehicleLiveryState);
 // Fit visible glyphs to the responsive background area, including two-character classes.
 const performanceMeasure=document.createElement('canvas').getContext('2d');
 const fitPerformance=()=>{
  if(!performance.isConnected)return;
  const wrap=performance.querySelector('.vehicle-screen-grade-wrap');
  const glyph=wrap.querySelector('.garage-class');
  const height=wrap.clientHeight;
  if(!height||!performance.clientWidth)return;
  glyph.style.fontSize=(height/.82)+'px';
  const measuredHeight=glyph.getBoundingClientRect().height;
  if(measuredHeight)glyph.style.fontSize=(parseFloat(glyph.style.fontSize)*height/measuredHeight)+'px';
  glyph.style.setProperty('--grade-scale-x','1');
  const glyphStyle=getComputedStyle(glyph);
  performanceMeasure.font=`${glyphStyle.fontStyle} ${glyphStyle.fontWeight} ${glyphStyle.fontSize} ${glyphStyle.fontFamily}`;
  const measured=performanceMeasure.measureText(glyph.textContent);
  const width=measured.actualBoundingBoxRight||glyph.getBoundingClientRect().width;
  const score=performance.querySelector('strong');
  const gap=parseFloat(getComputedStyle(performance).columnGap)||8;
  const available=performance.clientWidth-score.getBoundingClientRect().width-gap-2;
  const scale=Math.min(1,Math.max(1,available)/width);
  glyph.style.setProperty('--grade-scale-x',String(scale));
  performance.style.setProperty('--grade-column-width',(width*scale)+'px');
 };
 vehiclePerformanceObserver=new ResizeObserver(fitPerformance);
 vehiclePerformanceObserver.observe(performance);
 fitPerformance();
 document.fonts.ready.then(fitPerformance);
 const applyTab=()=>{
  right.querySelectorAll('[role=tab]').forEach(tab=>{const active=tab.dataset.vehiclePanel===vehicleScreenTab;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  right.querySelector('#vehicleTunesPanel').hidden=vehicleScreenTab!=='tunes';
  right.querySelector('#vehicleLiveriesPanel').hidden=vehicleScreenTab!=='liveries';
 };
 right.querySelectorAll('[role=tab]').forEach(tab=>{
  tab.addEventListener('click',()=>{vehicleScreenTab=tab.dataset.vehiclePanel;applyTab();});
  tab.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const tabs=[...right.querySelectorAll('[role=tab]')];
   const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];
   next.click();next.focus();
  });
 });
 applyTab();
};
const renderBeforeVehicleScreenPage=render;
render=function(){renderBeforeVehicleScreenPage();document.querySelector('#subpage').classList.toggle('vehicle-screen-active',currentRoute==='carDetail'&&!!detailCar);if(currentRoute!=='carDetail'){vehiclePerformanceObserver?.disconnect();vehicleLiveryObserver?.disconnect();}};

render.tuner=renderBeforeVehicleScreenPage.tuner;
if(currentRoute==='carDetail')render();
