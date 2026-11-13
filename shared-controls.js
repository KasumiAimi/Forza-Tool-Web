/* Keep the selected capsule aligned even when a page redraws or controls wrap. */
(()=>{
 const selectors=['.garage-modes','.bm-types','.bm-sorts','.wa-view-switch','.pc-tabs','.cp-tabs','.cp-filters','.library-pills .pills','.gg-levels','.sw-filters','.rk-periods','.lc-center .lc-views','.lc-center .lc-groups','.vehicle-screen-tabs'];
 const positions=new Map();let pending=false;
 const root=document.getElementById('subcontent');if(!root)return;
 function setPosition(group,value){group.style.setProperty('--ui-indicator-x',value.x+'px');group.style.setProperty('--ui-indicator-y',value.y+'px');group.style.setProperty('--ui-indicator-width',value.width+'px');}
 function update(){
  pending=false;
  for(const selector of selectors){
   root.querySelectorAll(selector).forEach((group,index)=>{
    const selected=group.querySelector(':scope > button[aria-pressed="true"],:scope > button[aria-selected="true"],:scope > button.active');
    if(!selected||!group.getClientRects().length||!selected.getClientRects().length)return;
    const key=location.hash.split('?')[0]+'|'+selector+'|'+index;
    let indicator=group.querySelector(':scope > .ui-selection-indicator');
    const fresh=!indicator;
    if(fresh){group.classList.add('ui-tab-group');indicator=document.createElement('span');indicator.className='ui-selection-indicator';indicator.setAttribute('aria-hidden','true');group.append(indicator);}
    const bounds=group.getBoundingClientRect(),target=selected.getBoundingClientRect();
    const next={x:Math.round(target.left-bounds.left-group.clientLeft),y:Math.round(target.bottom-bounds.top-group.clientTop-3),width:Math.round(target.width)};
    const prev=positions.get(key);
    if(fresh){
     indicator.style.transition='none';setPosition(group,prev||next);
     indicator.getBoundingClientRect();indicator.style.removeProperty('transition');
     if(prev)requestAnimationFrame(()=>{if(group.isConnected)setPosition(group,next);});
    }else setPosition(group,next);
    positions.set(key,next);
   });
  }
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-selected','class','hidden']});
 window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);schedule();
})();
