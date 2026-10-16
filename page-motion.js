// Synchronous navigation keeps history and controls responsive; motion is visual only.
(()=>{
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=new Set(),cleanups=new Set();
 let selectedImage=null,detailOriginView=null;
 function finishMotion(){
  for(const animation of [...animations])animation.cancel();
  animations.clear();
  for(const cleanup of [...cleanups])cleanup();
  cleanups.clear();
 }
 function play(element,frames,options={}){
  if(!element)return null;
  const animation=element.animate(frames,{duration:340,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards',...options});
  animations.add(animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
  return animation;
 }
 function imageSnapshot(image){
  if(!image||!image.complete||!image.naturalWidth)return null;
  const rect=image.getBoundingClientRect(),style=getComputedStyle(image);
  if(rect.bottom<0||rect.top>innerHeight||rect.width===0)return null;
  return {src:image.currentSrc,rect,padding:style.padding};
 }
 document.addEventListener('keydown',event=>{if(['Enter',' ','Escape','Tab'].includes(event.key))finishMotion();},true);
 document.addEventListener('click',event=>{
  // Let pointerup target the same control before removing entrance transforms.
  finishMotion();
  const card=event.target.closest('[data-car]');
  selectedImage=card?imageSnapshot(card.querySelector('img')):null;
 },true);
 reducedMotion.addEventListener('change',finishMotion);
 window.addEventListener('resize',finishMotion);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishMotion();});
 const navigateWithoutMotion=navigate;
 navigate=function(route,push=true){
  const previousRoute=currentRoute,source=selectedImage;
  selectedImage=null;finishMotion();
  if(route==='carDetail'&&previousRoute!=='carDetail')detailOriginView={route:previousRoute,y:scrollY};
  navigateWithoutMotion(route,push);
  if(previousRoute==='carDetail'&&route!=='carDetail'&&!push&&detailOriginView?.route===route)window.scrollTo(0,detailOriginView.y);
  if(reducedMotion.matches||!Element.prototype.animate||route===previousRoute)return;
  if(route!=='carDetail'&&previousRoute!=='carDetail')return;
  const page=route?$('#subpage'):$('#home');
  if(route!=='carDetail'){
   play(page,[{opacity:0,transform:'translateY(-12px) scale(.99)'},{opacity:1,transform:'none'}],{duration:260});
   return;
  }
  const target=page.querySelector('.masthead-car img');
  // Measure the resting layout before entrance transforms affect its bounds.
  const destination=target?.getBoundingClientRect(),targetPadding=target?getComputedStyle(target).padding:'';
  play(page.querySelector('.sub-header'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:280});
  play(page.querySelector('.vehicle-masthead'),[{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'none'}],{duration:320});
  play(page.querySelector('.vehicle-masthead-copy'),[{opacity:0,transform:'translateX(-22px)'},{opacity:1,transform:'none'}],{delay:70});
  const panels=page.querySelectorAll('.spec-card,.detail-heading,.tune');
  panels.forEach((panel,index)=>play(panel,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{delay:110+Math.min(index,4)*45,duration:300}));
  if(!target)return;
  if(!source){play(target,[{opacity:0,transform:'translateX(32px) scale(.94)'},{opacity:1,transform:'none'}],{duration:420});return;}
  const flight=document.createElement('img');
  flight.src=source.src;flight.alt='';flight.className='route-car-flight';flight.setAttribute('aria-hidden','true');
  document.body.append(flight);
  const previousVisibility=target.style.visibility;
  target.style.visibility='hidden';
  const cleanup=()=>{flight.remove();target.style.visibility=previousVisibility;cleanups.delete(cleanup);};
  cleanups.add(cleanup);
  const geometry=(rect,padding)=>({left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px',padding});
  const animation=play(flight,[geometry(source.rect,source.padding),geometry(destination,targetPadding)],{duration:460,fill:'both'});
  animation.finished.then(cleanup,cleanup);
 };
})();
