// Search the actual preview fields; result identifiers retain their original values.
const globalSearchForm=$('#globalSearch'),globalSearchInput=$('#globalSearchInput');
const globalSearchPanel=$('#globalSearchPanel'),globalSearchResults=$('#globalSearchResults');
const tunerSearchIndex=[...new Set(cars.flatMap(car=>car.tuningData.map(tune=>tune.tuner)))].map(name=>({name,carCount:cars.filter(car=>car.tuningData.some(tune=>tune.tuner===name)).length}));
let globalSearchMatches=[],globalSearchActive=-1,globalSearchComposing=false;
function closeGlobalSearch(){globalSearchPanel.hidden=true;globalSearchInput.setAttribute('aria-expanded','false');globalSearchInput.removeAttribute('aria-activedescendant');globalSearchActive=-1;}
function setGlobalSearchActive(index){
 globalSearchActive=index;
 globalSearchResults.querySelectorAll('[role="option"]').forEach((option,i)=>option.setAttribute('aria-selected',String(i===index)));
 if(index>=0){globalSearchInput.setAttribute('aria-activedescendant','globalSearchOption-'+index);$('#globalSearchOption-'+index).scrollIntoView({block:'nearest'});}else globalSearchInput.removeAttribute('aria-activedescendant');
}
function updateGlobalSearch(){
 const query=globalSearchInput.value.trim(),tokens=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 $('#clearGlobalSearch').hidden=!globalSearchInput.value;
 globalSearchPanel.hidden=false;globalSearchInput.setAttribute('aria-expanded','true');closeNavigation();
 globalSearchMatches=[];globalSearchActive=-1;globalSearchInput.removeAttribute('aria-activedescendant');
 if(!tokens.length){globalSearchResults.innerHTML='';$('#globalSearchStatus').textContent='输入车辆名、车厂或调校师名称。';return;}
 const match=value=>tokens.every(token=>value.toLocaleLowerCase().includes(token));
 const matchedCars=cars.filter(car=>match(car.brand+' '+car.name));
 const matchedTuners=tunerSearchIndex.filter(tuner=>match(tuner.name));
 globalSearchMatches=[...matchedCars.map(car=>({type:'car',id:car._id})),...matchedTuners.map(tuner=>({type:'tuner',name:tuner.name}))];
 let index=0;
 globalSearchResults.innerHTML=(matchedCars.length?`<div role="group" aria-labelledby="searchCarsLabel"><h3 id="searchCarsLabel">车辆 <span>${matchedCars.length}</span></h3>${matchedCars.map(car=>`<button type="button" role="option" id="globalSearchOption-${index}" data-search-index="${index++}" aria-selected="false"><img src="assets/cars/${car.image}" alt=""><span><strong>${esc(car.name)}</strong><small>${esc(car.brand)} · ${car.level} · ${car.driveType}</small></span><b aria-hidden="true">↗</b></button>`).join('')}</div>`:'')+(matchedTuners.length?`<div role="group" aria-labelledby="searchTunersLabel"><h3 id="searchTunersLabel">调校师 <span>${matchedTuners.length}</span></h3>${matchedTuners.map(tuner=>`<button type="button" role="option" id="globalSearchOption-${index}" data-search-index="${index++}" aria-selected="false"><span class="author-avatar search-tuner-avatar" aria-hidden="true">${esc(tuner.name.charAt(0))}</span><span><strong>${esc(tuner.name)}</strong><small>${tuner.carCount} 辆车的调校 · 查看主页</small></span><b aria-hidden="true">↗</b></button>`).join('')}</div>`:'');
 $('#globalSearchStatus').textContent=globalSearchMatches.length?`${matchedCars.length} 辆车，${matchedTuners.length} 位调校师`:'没有找到匹配结果，换一个名称试试。';
 globalSearchResults.scrollTop=0;
}
function openGlobalSearchMatch(index){
 const result=globalSearchMatches[index];if(!result)return;
 if(result.type==='car'){
  detailCar=cars.find(car=>car._id===result.id);detailOrigin='globalSearch';detailTier='';showAll=true;navigate('carDetail');
 }else{render.tuner=result.name;navigate('tunerProfile');}
 closeGlobalSearch();
}
globalSearchInput.addEventListener('focus',updateGlobalSearch);
globalSearchInput.addEventListener('input',event=>{if(!event.isComposing&&!globalSearchComposing)updateGlobalSearch();});
globalSearchInput.addEventListener('compositionstart',()=>{globalSearchComposing=true;});
globalSearchInput.addEventListener('compositionend',()=>{globalSearchComposing=false;updateGlobalSearch();});
globalSearchForm.addEventListener('submit',event=>{event.preventDefault();if(!globalSearchComposing)openGlobalSearchMatch(globalSearchActive<0?0:globalSearchActive);});
globalSearchForm.addEventListener('keydown',event=>{
 if(event.isComposing||globalSearchComposing)return;
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();globalSearchInput.focus();closeGlobalSearch();return;}
 if(event.target!==globalSearchInput||!['ArrowDown','ArrowUp'].includes(event.key))return;
 event.preventDefault();if(globalSearchPanel.hidden)updateGlobalSearch();
 const count=globalSearchMatches.length;if(!count)return;
 setGlobalSearchActive(globalSearchActive<0?(event.key==='ArrowDown'?0:count-1):(globalSearchActive+(event.key==='ArrowDown'?1:-1)+count)%count);
});
globalSearchResults.addEventListener('click',event=>{const option=event.target.closest('[data-search-index]');if(option)openGlobalSearchMatch(Number(option.dataset.searchIndex));});
$('#clearGlobalSearch').onclick=()=>{globalSearchInput.value='';globalSearchInput.focus();updateGlobalSearch();};
globalSearchForm.addEventListener('focusout',event=>{if(!globalSearchForm.contains(event.relatedTarget))closeGlobalSearch();});
document.addEventListener('click',event=>{if(!globalSearchForm.contains(event.target))closeGlobalSearch();});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){event.preventDefault();globalSearchInput.focus();globalSearchInput.select();updateGlobalSearch();}});
const navigateBeforeGlobalSearch=navigate;
navigate=function(route,push=true){closeGlobalSearch();navigateBeforeGlobalSearch(route,push);};
