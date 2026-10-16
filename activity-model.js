// Pure selection rules, shared by the browser and boundary tests.
const ActivityFeed={
 select({updates,carIds,creatorIds,type,now=Date.now()}){
  const latest=new Map(),cutoff=now-7*24*60*60*1000;
  for(const update of updates){
   if(update.type!==type||!update.id)continue;
   const time=Date.parse(update.updatedAt||update.publishedAt);
   if(!Number.isFinite(time)||time>now)continue;
   const key=update.type+':'+update.id,previous=latest.get(key);
   if(!previous||time>previous.time)latest.set(key,{...update,time});
  }
  return [...latest.values()].filter(update=>update.time>=cutoff&&(carIds.has(update.carId)||creatorIds.has(update.creatorId)))
   .sort((a,b)=>b.time-a.time||String(a.id).localeCompare(String(b.id)));
 }
};
if(typeof module!=='undefined')module.exports=ActivityFeed;
