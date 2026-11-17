/* 独立布局原型。下列车辆、调校、赛事和创作者信息均为演示数据。 */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const entries = [
    ['carRecommendation', '全调校库', '线上调校全收录\n一键复制，轻松克敌', 'tuning-bg-v2.jpg', '≋'],
    ['seasonalEvents', '季节赛攻略', '每周限定赛程与任务\n奖励车辆及时更新', 'seasonal-guide-bg-v2.jpg', 'event.png'],
    ['carSelection', '全车辆库', '查看所有车辆数据\n性能与获取方式', 'car-library-bg-v2.jpg', 'car.png'],
    ['blueprintRecommendation', '蓝图推荐', '精选优质蓝图\n体验创意赛道，享受专业竞速', 'blueprint-bg-v2.jpg', '⌖'],
    ['gameGuide', '游戏攻略', '常见问题与地图资源', 'seasonal-guide-bg-v2.jpg', 'event.png'],
    ['collection', '个人收藏', '收藏车辆与蓝图', 'collection-bg-v2.jpg', 'collection.png'],
    ['ranking', '创作者榜', '热门创作者推荐', 'creator-ranking-bg-v2.jpg', '▥'],
    ['leagueStandings', '赛事系统', 'KIT CUP 成绩公示', 'seasonal-guide-bg-v2.jpg', '⚑']
];
const levels = ['X', 'R', 'S2', 'S1', 'A', 'B', 'C', 'D'];
const tiers = ['Overpower', 'META', 'T1', 'T2', 'T3', '玩具', '常规'];
const carSpecs = [
    ['Mercedes-Benz', '190E 2.5-16 Evolution II', '德国', 'car_396.webp', 'A', 'META', '公路', '后驱'],
    ['Porsche', '911 GT3', '德国', 'car_635.webp', 'S1', 'META', '公路', '后驱'],
    ['Toyota', 'GR Supra RZ', '日本', 'car_636.webp', 'S1', 'T1', '公路', '后驱'],
    ['BMW', 'M4 Competition', '德国', 'car_637.webp', 'A', 'T1', '公路', '四驱'],
    ['Nissan', 'Skyline GT-R', '日本', 'car_638.webp', 'A', 'T1', '拉力', '四驱'],
    ['Ford', 'Bronco', '美国', 'car_639.webp', 'B', 'T2', '越野', '四驱'],
    ['Mazda', 'RX-7', '日本', 'car_657.webp', 'S2', 'T2', '公路', '后驱'],
    ['Honda', 'Civic Type R', '日本', 'car_659.webp', 'B', 'T3', '公路', '前驱'],
    ['Toyota', 'AE86', '日本', 'car_660.webp', 'C', 'T2', '公路', '后驱']
];
const cars = carSpecs.map((c, i) => ({ _id: 'demo_' + i, brand: c[0], name: c[1], country: c[2], image: c[3], level: c[4], driveType: c[7], category: '跑车', obtainMethod: '商店购买', description: '用于预览布局的演示车辆。图片、参数与调校不代表真实游戏数据。', tuningData: [{ tuningId: 'demo_tune_' + i, tier: c[5], level: c[4], scenario: c[6], driveType: c[7], online: true, tuner: ['Demo Apex', 'Demo Horizon', 'Demo Driver'][i % 3], likes: 12 + i * 7, tireType: '半热熔', description: '演示调校：转向响应清晰，适合查看标签、调校师与简评的排版。' }, { tuningId: 'demo_drift_' + i, tier: i % 2 ? '玩具' : '常规', level: i % 2 ? 'S1' : 'A', scenario: i % 2 ? '漂移' : '直线加速', driveType: '后驱', online: false, tuner: 'Demo Drift', likes: 3 + i, tireType: '漂移胎', description: '演示调校：仅用于测试模式切换与条件筛选。' }] }));
let collected = readLocalIds('horizon_web_v2_collected');
let liked = new Set(); let followed = new Set();
let nick = readLocalString('horizon_web_v2_nickname', '车手');
let slide = 0, currentRoute = '', mode = 'online', filters = { brand: '', level: '', scenario: '', driveType: '' }, detailOrigin = '', detailTier = '', detailCar = null, showAll = false;
const modeOptions = () => ({ levels: mode === 'online' ? ['R', 'S2', 'S1', 'A', 'B', 'C'] : levels, scenarios: mode === 'online' ? ['公路', '拉力', '越野'] : ['漂移', '直线加速'], drives: ['四驱', '后驱', '前驱'] });
function scenarios() { let a = modeOptions().scenarios; if (mode === 'online' && ['R', 'S2'].includes(filters.level)) return ['公路']; if (mode === 'online' && filters.level === 'C') return ['公路', '拉力']; return a; }
function notify(t) { $('#toast').textContent = t; $('#toast').style.display = 'block'; clearTimeout(notify.timer); notify.timer = setTimeout(() => $('#toast').style.display = 'none', 2200) }
function saveCollect() { writeLocalValue('horizon_web_v2_collected', [...collected]) }
function vehicleLikeButton(tune) {
    const active = liked.has(tune.tuningId);
    const count = tune.likes + Number(active);
    return `<button type="button" class="like ${active ? 'liked' : ''}" data-like="${esc(tune.tuningId)}" aria-pressed="${active}" aria-label="调校点赞，${count} 个赞"><span class="reaction-icon" aria-hidden="true"><span>${active ? '♥' : '♡'}</span></span> <span data-like-count aria-hidden="true">${count}</span></button>`;
}
function vehicleFavoriteButton(car, className, showLabel = false) {
    const saved = collected.has(car._id);
    const label = showLabel ? ` <span data-favorite-label>${saved ? '已收藏' : '收藏车辆'}</span>` : '';
    return `<button type="button" id="collectCar" class="${className}${saved ? ' saved' : ''}" aria-label="${saved ? '取消收藏' : '收藏车辆'}"><span class="reaction-icon" aria-hidden="true"><span>${saved ? '★' : '☆'}</span></span>${label}</button>`;
}
function toggleVehicleLike(button) {
    const id = button.dataset.like;
    const active = !liked.has(id);
    if (active) liked.add(id);
    else liked.delete(id);
    const count = button.querySelector('[data-like-count]');
    count.textContent = Number(count.textContent) + (active ? 1 : -1);
    button.classList.toggle('liked', active);
    button.setAttribute('aria-pressed', active);
    button.setAttribute('aria-label', `调校点赞，${count.textContent} 个赞`);
    updateVehicleReaction(button, active, active ? '♥' : '♡');
}
function toggleVehicleFavorite(button, carId) {
    const active = !collected.has(carId);
    if (active) collected.add(carId);
    else collected.delete(carId);
    saveCollect();
    button.classList.toggle('saved', active);
    button.setAttribute('aria-label', active ? '取消收藏' : '收藏车辆');
    const label = button.querySelector('[data-favorite-label]');
    if (label) label.textContent = active ? '已收藏' : '收藏车辆';
    updateVehicleReaction(button, active, active ? '★' : '☆');
}
function updateVehicleReaction(button, active, symbol) {
    const icon = button.querySelector('.reaction-icon');
    icon.firstElementChild.textContent = symbol;
    icon.querySelector('.reaction-burst')?.remove();
    if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const burst = document.createElement('span');
    burst.className = 'reaction-burst';
    const particles = Array.from({length: 10}, (_, index) => {
        const rayAngle = index * 36;
        const dotAngle = (rayAngle + 18) * Math.PI / 180;
        return `<i class="reaction-ray" style="--ray-angle:${rayAngle}deg"></i><i class="reaction-dot" style="--dot-x:${(Math.cos(dotAngle) * 34).toFixed(1)}px;--dot-y:${(Math.sin(dotAngle) * 22).toFixed(1)}px"></i>`;
    });
    burst.innerHTML = `<i class="reaction-ring"></i>${particles.join('')}`;
    const removeBurst = event => {
        if (event.target === burst) burst.remove();
    };
    burst.addEventListener('animationend', removeBurst);
    burst.addEventListener('animationcancel', removeBurst);
    icon.append(burst);
}
async function copy(t) { try { await navigator.clipboard.writeText(t); notify('已复制：' + t) } catch { notify('浏览器未允许复制') } }
function updateNick() { $('#drawerName').innerHTML = esc(nick) + ' <small>✎</small>'; $('#nickDisplay').textContent = nick; }
function drawer(open) { $('#drawer').classList.toggle('open', open); $('#drawer').inert = !open; $('#backdrop').classList.toggle('hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; if (open) $('#closeDrawer').focus(); else $('#logo').focus() }
function editName() { drawer(false); $('#nameInput').value = nick; $('#nickname').showModal(); $('#nameInput').focus() }

$('#nameForm').onsubmit = e => { e.preventDefault(); const n = $('#nameInput').value.trim(); if (!n) return; nick = n; try { localStorage.setItem('horizon_web_v2_nickname', n) } catch { notify('浏览器无法保存代号，本次页面内有效') }; updateNick(); $('#nickname').close(); notify('代号更新成功') };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close()); document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#drawer').classList.contains('open')) drawer(false) }); $('#copyContact').onclick = () => copy('KMTTB'); $('#poster').onclick = () => $('#photo').showModal(); $('#feedback').onclick = () => navigate('feedback');
const _navHooksBefore = [], _navHooksAfter = [];
function onBeforeNavigate(fn) { _navHooksBefore.push(fn); }
function onAfterNavigate(fn) { _navHooksAfter.push(fn); }
function navigate(route, push = true) { _navHooksBefore.forEach(fn => fn(route)); drawer(false); document.querySelectorAll('dialog[open]').forEach(d => d.close()); currentRoute = route; if (push) history.pushState({ route }, '', route ? '#' + route : location.pathname); $('#home').classList.toggle('hidden', !!route); $('#subpage').classList.toggle('hidden', !route); if (!route) { window.scrollTo(0, 0); _navHooksAfter.forEach(fn => fn(route)); return } $('#pageTitle').textContent = entries.find(e => e[0] === route)?.[1] || ({ carDetail: '车辆详情', feedback: '意见反馈', tunerProfile: '调校师主页', article: '攻略详情', blueprintDetail: '蓝图详情', seasonPreview: '下期季节赛预告' })[route] || ''; render(); window.scrollTo(0, 0); _navHooksAfter.forEach(fn => fn(route)); }
window.onpopstate = e => navigate(e.state?.route || '', false); $('#back').onclick = () => { if (history.state?.route) history.back(); else navigate('') };
function pill(k, values) { return `<div class="pills">${values.map(v => `<button data-filter="${k}" data-value="${v}" class="${filters[k] === v ? 'active' : ''}" aria-pressed="${filters[k] === v}">${v}</button>`).join('')}</div>` }
function tuneMatches(t) { return (mode === 'online' ? t.online === true : ['漂移', '直线加速'].includes(t.scenario)) && (!filters.level || t.level === filters.level) && (!filters.scenario || t.scenario === filters.scenario) && (!filters.driveType || t.driveType === filters.driveType) }
function card(c, tier = '', library = false) { const ts = library ? c.tuningData : (mode === 'online' ? c.tuningData : c.tuningData.filter(t => ['漂移', '直线加速'].includes(t.scenario))); const ls = [...new Set(ts.map(t => t.level))].sort((a, b) => levels.indexOf(a) - levels.indexOf(b)); return `<button class="vehicle" data-car="${c._id}" data-tier="${tier}"><div class="vehicle-image"><img src="assets/cars/${c.image}" alt="${esc(c.name)} 演示配图"><span class="level-badges">${ls.map(l => `<b class="level-${l}">${l}</b>`).join('')}</span></div><div class="vehicle-info"><h3>${esc(c.name)}</h3><p>${c.brand}</p><div class="tags">${[...new Set(ts.map(t => t.scenario))].map(s => `<span class="${s === filters.scenario ? 'selected' : ''}">${s}</span>`).join('')}</div></div></button>` }
function renderTuning() { renderGarageTuning(); }
function openBrand() { $('#brandSearch').value = ''; renderBrands(''); $('#brands').showModal() }
function renderBrands(q) { const brands = [...new Set(cars.filter(c => c.tuningData.some(t => mode === 'online' ? t.online : ['漂移', '直线加速'].includes(t.scenario))).map(c => c.brand))].sort(); $('#brandList').innerHTML = `<button data-brand="">全部车厂 ${!filters.brand ? '✓' : ''}</button>` + brands.filter(b => b.toLowerCase().includes(q.toLowerCase())).map(b => `<button data-brand="${b}">${b} ${filters.brand === b ? '✓' : '›'}</button>`).join(''); }
$('#brandSearch').oninput = e => renderBrands(e.target.value);
function renderDetail() { const c = detailCar; if (!c) { navigate('carRecommendation'); return } const matched = c.tuningData.filter(t => tuneMatches(t) && (!detailTier || t.tier === detailTier)); const list = detailOrigin === 'carRecommendation' && !showAll ? matched : c.tuningData; $('#subcontent').innerHTML = `<div class="detail-layout"><section class="detail-visual"><div class="detail-rank level-${c.level}">${c.level}</div><img src="assets/cars/${c.image}" alt="${esc(c.name)} 演示配图">${vehicleFavoriteButton(c,'collect-circle')}<div class="detail-name"><small>${c.brand}</small><h2>${c.name}</h2></div><div class="spec-card"><h3>基本信息</h3><dl>${[['品牌', c.brand], ['国家', c.country], ['类别', c.category], ['驱动', c.driveType], ['获取方式', c.obtainMethod]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div><p class="demo-disclaimer">演示数据与配图，仅用于布局和操作预览。</p></section><section><div class="detail-heading"><h2>调校推荐</h2>${detailOrigin === 'carRecommendation' && matched.length < c.tuningData.length ? `<button id="showAll">${showAll ? '仅看匹配' : '全部调校'} ${showAll ? matched.length : c.tuningData.length} ›</button>` : ''}</div>${list.map(t => `<article class="tune"><div class="tune-top"><div class="tags"><b class="tier-chip">${t.tier}</b><b class="level-${t.level}">${t.level}</b>${t.online ? '<span class="online">线上</span>' : ''}</div>${vehicleLikeButton(t)}</div><div class="tags tune-tags"><span>${t.scenario}</span><span>${t.driveType}</span><span>${t.tireType}</span></div><div class="tuner-row"><button class="tuner-profile" data-tuner="${t.tuner}"><small>调校师</small><strong>${t.tuner}</strong><span>主页 ›</span></button><button class="copy-tuner" data-copy="${t.tuner}">复制调校师ID</button></div><p class="tune-desc"><span>简评：</span>${t.description}</p></article>`).join('') || '<p>暂无调校推荐，敬请期待</p>'}<section class="description"><h3>车辆描述</h3><p>${c.description}</p></section></section></div>`; $('#collectCar').onclick = event => toggleVehicleFavorite(event.currentTarget, c._id); if ($('#showAll')) $('#showAll').onclick = () => { showAll = !showAll; renderDetail() }; }
let libraryQuery = '', renderLibrary;
function render() {
    if (currentRoute === 'carRecommendation') renderTuning();
    else if (currentRoute === 'carDetail') renderDetail();
    else if (currentRoute === 'carSelection') renderLibrary();
    else if (currentRoute === 'seasonalEvents' || currentRoute === 'seasonPreview') renderSeason(currentRoute === 'seasonPreview');
    else if (currentRoute === 'collection') $('#subcontent').innerHTML = `<div class="tabs"><button class="active">收藏车辆</button><button data-route="blueprintRecommendation">收藏蓝图</button></div><div class="car-grid library-grid">${cars.filter(c => collected.has(c._id)).map(c => card(c, '', true)).join('') || '<div class="placeholder"><h2>暂无收藏车辆</h2><p>进入车辆详情，点击星标收藏车辆。</p></div>'}</div>`;
    else if (currentRoute === 'ranking') $('#subcontent').innerHTML = `<div class="creator-list">${['Demo Apex', 'Demo Horizon', 'Demo Driver'].map((n, i) => `<button class="creator" data-tuner="${n}"><b>0${i + 1}</b><span class="avatar">🏎️</span><strong>${n}<small>演示创作者 · ${cars.filter(c => c.tuningData.some(t => t.tuner === n)).length} 个作品</small></strong><span>查看主页 ›</span></button>`).join('')}</div>`;
    else if (currentRoute === 'tunerProfile') $('#subcontent').innerHTML = `<div class="profile-heading"><span class="avatar">🏎️</span><h2>${esc(render.tuner || 'Demo Apex')}</h2><button id="follow" class="copy-tuner">${followed.has(creatorIdFor(render.tuner)) ? '已关注' : '关注创作者'}</button></div><div class="car-grid library-grid">${cars.filter(c => c.tuningData.some(t => t.tuner === render.tuner)).map(c => card(c, '', true)).join('')}</div>`, $('#follow').onclick = () => { followed.has(creatorIdFor(render.tuner)) ? followed.delete(creatorIdFor(render.tuner)) : followed.add(creatorIdFor(render.tuner)); saveFollowedCreators(); render() };
    else if (currentRoute === 'blueprintRecommendation') $('#subcontent').innerHTML = `<div class="blueprint-grid">${['山间公路', '城市夜赛', '海岸环线', '车库练习'].map((n, i) => `<button class="blueprint" data-route="blueprintDetail" style="background-image:linear-gradient(0deg,#0b0c12,transparent),url('assets/home/${entries[i + 2][3]}')"><span>演示蓝图</span><h2>${n}</h2><small>查看蓝图 ›</small></button>`).join('')}</div>`;
    else if (currentRoute === 'blueprintDetail') $('#subcontent').innerHTML = '<div class="placeholder"><h2>山间公路 · 演示蓝图</h2><p>用于查看蓝图详情页的桌面布局。</p><button data-copy="123 456 789">复制演示分享码</button></div>';
    else if (currentRoute === 'gameGuide') $('#subcontent').innerHTML = `<div class="guide-list">${['新手入门', '车辆与调校', '地图资源', '常见问题'].map((n, i) => `<button class="guide-row" data-route="article"><span>0${i + 1}</span><h2>${n}</h2><b>›</b></button>`).join('')}</div>`;
    else if (currentRoute === 'article') $('#subcontent').innerHTML = '<article class="placeholder"><h2>新手入门</h2><p>这是一篇演示攻略，用于查看正文在电脑网页上的阅读宽度、标题和留白。</p><p>回到首页，选择全调校库，切换线上竞速或漂移/直线加速，筛选车辆后进入详情查看调校。</p></article>';
    else if (currentRoute === 'leagueStandings') $('#subcontent').innerHTML = `<div class="placeholder"><h2>KIT CUP · 演示积分榜</h2><p>以下选手和成绩均为演示数据。</p><table><thead><tr><th>名次</th><th>选手</th><th>积分</th></tr></thead><tbody>${['Demo Driver A', 'Demo Driver B', 'Demo Driver C'].map((n, i) => `<tr><td>${i + 1}</td><td>${n}</td><td>${100 - i * 15}</td></tr>`).join('')}</tbody></table></div>`;
    else if (currentRoute === 'feedback') { $('#subcontent').innerHTML = '<form class="placeholder" id="feedbackForm"><h2>意见反馈</h2><textarea placeholder="请描述你的问题或建议" required></textarea><p>预览中的反馈仅在本机显示提交结果。</p><button type="submit">提交反馈</button></form>'; $('#feedbackForm').onsubmit = e => { e.preventDefault(); notify('演示反馈已提交'); e.target.reset() } }
}
document.addEventListener('click', e => {
    const route = e.target.closest('[data-route]'); if (route) { if (route.dataset.route === 'carSelection') { filters = { brand: '', level: '', scenario: '', driveType: '' }; libraryQuery = '' } navigate(route.dataset.route); return }
    const m = e.target.closest('[data-mode]'); if (m) { mode = m.dataset.mode; filters = { brand: '', level: '', scenario: '', driveType: '' }; render(); return }
    const f = e.target.closest('[data-filter]'); if (f) { const k = f.dataset.filter; filters[k] = filters[k] === f.dataset.value ? '' : f.dataset.value; if (k === 'level' && !scenarios().includes(filters.scenario)) filters.scenario = ''; render(); return }
    const b = e.target.closest('[data-brand]'); if (b) { filters.brand = b.dataset.brand; $('#brands').close(); render(); return }
    const c = e.target.closest('[data-car]'); if (c) { detailCar = cars.find(x => x._id === c.dataset.car); detailOrigin = currentRoute; detailTier = c.dataset.tier || ''; showAll = false; navigate('carDetail'); return }
    const cp = e.target.closest('[data-copy]'); if (cp) { copy(cp.dataset.copy); return }
    const lk = e.target.closest('[data-like]'); if (lk) { toggleVehicleLike(lk); return }
    const tu = e.target.closest('[data-tuner]'); if (tu) { render.tuner = tu.dataset.tuner; navigate('tunerProfile'); return }
    const ph = e.target.closest('[data-photo]'); if (ph) { $('#photo img').src = ph.dataset.photo; $('#photo p').textContent = '演示车辆配图'; $('#photo').showModal() }
});
updateNick(); history.replaceState({ route: '' }, '', location.pathname + location.search + location.hash);

$('#drawer .season-card strong').textContent = '3天 14小时'; $('#drawer .season-card>small').textContent = '演示赛季时间';
document.querySelectorAll('.drawer-empty')[1].innerHTML = '<button class="drawer-update" data-route="blueprintRecommendation"><b>演示蓝图</b><strong>山间公路</strong><span>查看最新蓝图 ›</span></button>';
