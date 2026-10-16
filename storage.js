// Browser storage is optional: private mode, full storage and damaged values must not break browsing.
function readLocalValue(key, fallback) {
 try { const value=localStorage.getItem(key); return value===null?fallback:JSON.parse(value); }
 catch { return fallback; }
}
function readLocalString(key, fallback) {
 try { return localStorage.getItem(key)||fallback; } catch { return fallback; }
}
function writeLocalValue(key, value) {
 try { localStorage.setItem(key,JSON.stringify(value)); return true; }
 catch { notify('浏览器无法保存，当前操作仅在本次页面有效'); return false; }
}
function readLocalIds(key) {
 const value=readLocalValue(key,[]);
 return new Set(Array.isArray(value)?value.filter(item=>typeof item==='string'):[]);
}
