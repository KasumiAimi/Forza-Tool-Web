// Brand-grouped vehicle-library layout preview, using the existing local demo cars.
const libraryExtraSpecs=[
 ['Toyota','GR Yaris','FH6_Toyota_GR_Yaris.webp','A','四驱','高性能掀背车'],
 ['Toyota','MR2 GT','FH6_Toyota_MR2_GT.webp','B','后驱','跑车'],
 ['Toyota','Celica GT-Four ST205','FH6_Toyota_Celica_GT-Four_ST205.webp','B','四驱','拉力车'],
 ['Porsche','911 Carrera S','FH6_Porsche_911_Carrera_S.webp','S1','后驱','跑车'],
 ['Porsche','918 Spyder','FH6_Porsche_918_Spyder.webp','S2','四驱','超级跑车'],
 ['Porsche','911 Turbo S','FH6_Porsche_911_Turbo_S_2023.webp','S1','四驱','跑车'],
 ['Porsche','959','FH6_Porsche_959.webp','A','四驱','跑车']
];
const libraryExtraCars=libraryExtraSpecs.map(([brand,name,officialImage,level,driveType,category],index)=>({
 _id:'library_demo_'+index,brand,name,country:brand==='Toyota'?'日本':'德国',image:'../official-cars/'+officialImage,officialImage,level,driveType,
 category,obtainMethod:'本地演示',description:'仅用于车辆库品牌分组的布局预览；等级、分数和车辆类别均为演示值。',tuningData:[]
}));
const libraryPreviewCars=[...garageAllCars,...libraryExtraCars];

function libraryDemoScore(car){
 if(Number.isInteger(car.performanceIndex))return car.performanceIndex;
 const base={X:999,R:950,S2:900,S1:800,A:700,B:600,C:500,D:400}[car.level]||700;
 const seed=[...car._id].reduce((sum,letter)=>sum+letter.charCodeAt(0),0);
 return car.level==='X'?999:base+seed%90;
}
function libraryCategory(car){
 if(car._id==='demo_5')return '越野车';
 if(/Civic|Golf|i30|GR Yaris/.test(car.name))return '高性能掀背车';
 if(/Impreza|Lancer|Celica GT-Four/.test(car.name))return '拉力车';
 if(car.category&&!/演示|示例/.test(car.category))return car.category;
 return {Ferrari:'超级跑车',Lamborghini:'超级跑车',McLaren:'超级跑车',Koenigsegg:'超级跑车',Hyundai:'高性能掀背车',Volkswagen:'高性能掀背车',Subaru:'拉力车',Mitsubishi:'拉力车'}[car.brand]||'跑车';
}

function libraryGarageColumns(){
 return innerWidth<=520?1:innerWidth<=760?2:innerWidth<=960?3:innerWidth<=1160?4:5;
}
function libraryBrandMark(brand){
 const words=brand.split(/[\s-]+/).filter(Boolean);
 return words.length>1?words.map(word=>word[0]).join('').slice(0,2).toUpperCase():brand.slice(0,2).toUpperCase();
}
function libraryGarageCard(car){
 const plans=car.tuningData.length;
 return `<button class="library-garage-car" type="button" data-garage-car="${esc(car._id)}" aria-label="查看 ${esc(car.brand+' '+car.name)} 车辆详情">
  <span class="library-garage-car-heading"><span class="library-tune-badge ${plans?'has-tuning':'no-tuning'}">${plans?'有调校':'无调校'}</span></span>
  <span class="library-garage-car-stage"><img src="${garageImage(car)}" alt="${esc(car.brand+' '+car.name)} 官方车图" loading="lazy"><span class="library-garage-rating" title="演示性能分数"><b class="garage-class garage-class-${esc(car.level)}">${esc(car.level)}</b><strong>${libraryDemoScore(car)}</strong></span></span>
  <span class="library-garage-car-info"><strong class="library-garage-name">${esc(car.name)}</strong></span>
 </button>`;
}
function renderBrandGarage(list){
 const columns=libraryGarageColumns();
 const brands=[...new Set(list.map(car=>car.brand))].sort((a,b)=>a.localeCompare(b,'en'));
 return `<div class="library-garage-results" aria-label="按车厂分组的车辆库">${brands.map(brand=>{
  const vehicles=list.filter(car=>car.brand===brand),rows=[];
  const countries=[...new Set(vehicles.map(car=>car.country).filter(Boolean))].join(' · ');
  for(let start=0;start<vehicles.length;start+=columns){
   const rowCars=vehicles.slice(start,start+columns);
   const heading=start===0?`<div class="library-brand-head"><span class="library-brand-emblem" aria-hidden="true">${esc(libraryBrandMark(brand))}</span><div><div class="library-brand-title"><h2>${esc(brand)}</h2><span class="library-brand-country">${esc(countries)}</span></div><small>${vehicles.length} 辆</small></div></div>`:'';
   rows.push(`<div class="library-brand-row" style="--library-columns:${columns}">${heading}<div class="library-brand-lights" aria-hidden="true">${rowCars.map(()=>'<span></span>').join('')}</div>${rowCars.map(libraryGarageCard).join('')}</div>`);
  }
  return `<section class="library-brand-section" data-library-brand="${esc(brand)}" aria-label="${esc(brand)}，${vehicles.length} 辆">${rows.join('')}</section>`;
 }).join('')}</div>`;
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-library-jump]');if(button)document.querySelector('[data-library-brand="'+CSS.escape(button.dataset.libraryJump)+'"]')?.scrollIntoView({block:'start',behavior:'smooth'});});
let libraryViewportColumns=libraryGarageColumns();
window.addEventListener('resize',()=>{
 const next=libraryGarageColumns();
 if(next!==libraryViewportColumns){libraryViewportColumns=next;if(currentRoute==='carSelection')renderLibrary();}
});
