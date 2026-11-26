const CITIES = [
  ['القاهرة', 30.0444, 31.2357, 'Africa/Cairo'], ['الإسكندرية', 31.2001, 29.9187, 'Africa/Cairo'],
  ['الجيزة', 30.0131, 31.2089, 'Africa/Cairo'], ['أسوان', 24.0889, 32.8998, 'Africa/Cairo'],
  ['المنيا', 28.1099, 30.7503, 'Africa/Cairo'], ['مكة المكرمة', 21.4225, 39.8262, 'Asia/Riyadh'],
  ['المدينة المنورة', 24.4672, 39.6111, 'Asia/Riyadh'], ['الرياض', 24.7136, 46.6753, 'Asia/Riyadh'],
  ['دبي', 25.2048, 55.2708, 'Asia/Dubai'], ['القدس', 31.7683, 35.2137, 'Asia/Jerusalem'],
  ['عمّان', 31.9454, 35.9284, 'Asia/Amman'], ['الدار البيضاء', 33.5731, -7.5898, 'Africa/Casablanca'],
  ['إسطنبول', 41.0082, 28.9784, 'Europe/Istanbul'], ['لندن', 51.5074, -0.1278, 'Europe/London'],
];
const NAMES = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
const $ = s => document.querySelector(s);
const store = {
  get: (k, d) => { try { const v = localStorage.getItem('noor.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('noor.' + k, JSON.stringify(v)); } catch {} },
};
const ADHANS = [['', 'نغمة قصيرة (بدون أذان)'], ['audio/adhan1.mp3', 'المؤذن ١'], ['audio/adhan2.mp3', 'المؤذن ٢'], ['audio/adhan3.mp3', 'المؤذن ٣ (أذان قصير)'], ['audio/adhan4.mp3', 'المؤذن ٤']];
const S = Object.assign({ adhan: 'audio/adhan3.mp3', city: 0, geo: null, method: 'egypt', hanafi: false, h12: true, notify: false, sound: false, adhkarRem: false },
  store.get('settings', {}));
const save = () => store.set('settings', S);

function place() { return S.geo ? { name: 'موقعك الحالي', lat: S.geo.lat, lon: S.geo.lon, tz: null } : (c => ({ name: c[0], lat: c[1], lon: c[2], tz: c[3] }))(CITIES[S.city]); }
// فرق التوقيت (بالساعات) للمنطقة الزمنية في تاريخ معين، مع مراعاة التوقيت الصيفي
function tzOffset(tz, date) {
  if (!tz) return -date.getTimezoneOffset() / 60;
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(noon);
  const g = t => +parts.find(p => p.type === t).value;
  const asUTC = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return Math.round((asUTC - Math.floor(noon.getTime() / 60000) * 60000) / 36e5 * 4) / 4;
}
function timesFor(date) {
  const p = place(), tz = tzOffset(p.tz, date);
  return { p, tz, t: Prayer.compute(date, p.lat, p.lon, tz, { method: S.method, hanafi: S.hanafi }) };
}
// يحول وقتًا عشريًا في منطقة المدينة إلى لحظة مطلقة (Date)
function toInstant(date, hour, tz) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + (hour - tz) * 36e5);
}
const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
function schedule(now) {
  const out = [];
  for (const off of [-1, 0, 1]) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off);
    const { t, tz } = timesFor(d);
    for (const k of ORDER) out.push({ k, at: toInstant(d, t[k], tz) });
  }
  return out.sort((a, b) => a.at - b.at);
}
function renderTimes() {
  const now = new Date(), { p, t } = timesFor(now);
  const sch = schedule(now), next = sch.find(x => x.at > now);
  $('#cityLabel').textContent = p.name;
  $('#methodNote').textContent = 'طريقة الحساب: ' + Prayer.METHODS[S.method].name + (S.hanafi ? ' · العصر حنفي' : '');
  $('#times').innerHTML = ORDER.map(k => `<li class="${k === next.k ? 'next' : ''}" data-k="${k}"><span>${NAMES[k]}</span><span class="tm">${Prayer.fmt(t[k], S.h12)}</span></li>`).join('');
  tick();
}
function tick() {
  const now = new Date(), next = schedule(now).find(x => x.at > now);
  if (!next) return;
  let s = Math.floor((next.at - now) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  $('#nextName').textContent = NAMES[next.k];
  $('#countdown').textContent = [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
  document.querySelectorAll('#times li').forEach(li => li.classList.toggle('next', li.dataset.k === next.k));
  if (next.k !== window._lastNext) { window._lastNext = next.k; if (window._lastNext !== undefined && window._init) renderTimes(); }
}
function renderDates() {
  const d = new Date();
  $('#hijri').textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  $('#greg').textContent = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
// ---- الأذكار
let cat = 'morning';
const todayKey = () => new Date().toISOString().slice(0, 10);
function progress() { const p = store.get('adhkarProgress', {}); return p.day === todayKey() ? p : { day: todayKey() }; }
function renderAdhkar() {
  $('#adhkarCats').innerHTML = Object.entries(ADHKAR).map(([k, v]) => `<button data-c="${k}" class="${k === cat ? 'on' : ''}">${v.title}</button>`).join('');
  const p = progress();
  $('#adhkarList').innerHTML = ADHKAR[cat].items.map((it, i) => {
    const done = p[cat + i] || 0, left = Math.max(0, it.n - done);
    return `<div class="dhikr ${left === 0 ? 'done' : ''}"><div class="tx">${it.t}</div><div class="src">${it.w ? "<b class=\"weak\">فيه خلاف في ثبوته</b> " : ""}${it.s}</div>
      <div class="ctl"><span>التكرار: ${it.n}</span><button class="cnt" data-i="${i}">${left === 0 ? '✓ تم' : 'المتبقي ' + left}</button></div></div>`;
  }).join('');
}
// ---- المسبحة
let tCount = store.get('tasbeehCount', 0), tTotal = store.get('tasbeehTotal', 0);
function renderTasbeeh() { $('#tapCount').textContent = tCount; $('#tasbeehTotal').textContent = 'الإجمالي: ' + tTotal; }
// ---- القبلة
let heading = 0;
function renderQibla() {
  const p = place(), q = Prayer.qibla(p.lat, p.lon);
  $('#qiblaDeg').textContent = Math.round(q) + '° من الشمال';
  $('#needle').style.transform = `rotate(${q - heading}deg)`;
}
// ---- التنبيهات
let adhanAudio = null;
function playAdhan() { if (!S.adhan) return beep(); stopAdhan(); adhanAudio = new Audio(S.adhan); adhanAudio.play().catch(() => beep()); }
function stopAdhan() { if (adhanAudio) { adhanAudio.pause(); adhanAudio = null; } }
function beep() { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 660; g.gain.setValueAtTime(.2, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + 1.5); o.start(); o.stop(c.currentTime + 1.5); } catch {} }
async function notify(title, body) {
  if (S.sound) playAdhan();
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg) reg.showNotification(title, { body, icon: 'icon.svg', tag: title, lang: 'ar', dir: 'rtl' }); else new Notification(title, { body, icon: 'icon.svg' }); } catch { try { new Notification(title, { body }); } catch {} }
}
const fired = new Set(store.get('fired', []));
function checkAlerts() {
  const now = new Date();
  if (S.notify) for (const x of schedule(now)) {
    const id = x.k + x.at.toISOString();
    if (x.k !== 'sunrise' && x.at <= now && now - x.at < 90e3 && !fired.has(id)) { fired.add(id); store.set('fired', [...fired].slice(-30)); notify('حان الآن وقت صلاة ' + NAMES[x.k], 'حيّ على الصلاة · ' + place().name); }
  }
  if (S.adhkarRem) {
    const { t, tz } = timesFor(now);
    const pts = [['morning', toInstant(now, t.fajr, tz).getTime() + 30 * 60e3, 'أذكار الصباح'], ['evening', toInstant(now, t.asr, tz).getTime() + 60 * 60e3, 'أذكار المساء']];
    for (const [c, at, nm] of pts) { const id = c + todayKey(); if (now >= at && now - at < 90e3 && !fired.has(id)) { fired.add(id); notify('وقت ' + nm, 'لا تنسَ وردك من ' + nm); } }
  }
}
// ---- الإعدادات والربط
function initSettings() {
  $('#citySel').innerHTML = CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('') + (S.geo ? '<option value="geo">موقعي الحالي</option>' : '');
  $('#citySel').value = S.geo ? 'geo' : S.city;
  $('#adhanSel').innerHTML = ADHANS.map(a => `<option value="${a[0]}">${a[1]}</option>`).join(''); $('#adhanSel').value = S.adhan;
  $('#methodSel').innerHTML = Object.entries(Prayer.METHODS).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
  $('#methodSel').value = S.method; $('#asrSel').value = S.hanafi ? 1 : 0; $('#hourSel').value = S.h12 ? 1 : 0;
  $('#notifyChk').checked = S.notify; $('#soundChk').checked = S.sound; $('#adhkarChk').checked = S.adhkarRem;
}
var refresh = function () { save(); initSettings(); renderTimes(); renderQibla(); };
document.addEventListener('click', e => {
  const tb = e.target.closest('nav button');
  if (tb) { document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === tb.dataset.tab)); document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b === tb)); return; }
  const cb = e.target.closest('#adhkarCats button'); if (cb) { cat = cb.dataset.c; renderAdhkar(); return; }
  const ab = e.target.closest('.dhikr .cnt');
  if (ab) { const p = progress(), k = cat + ab.dataset.i, it = ADHKAR[cat].items[ab.dataset.i]; p[k] = Math.min(it.n, (p[k] || 0) + 1); store.set('adhkarProgress', p); renderAdhkar(); }
});
$('#tapBtn').onclick = () => { tCount++; tTotal++; store.set('tasbeehCount', tCount); store.set('tasbeehTotal', tTotal); renderTasbeeh(); if (navigator.vibrate) navigator.vibrate(15); };
$('#resetTasbeeh').onclick = () => { tCount = 0; store.set('tasbeehCount', 0); renderTasbeeh(); };
$('#citySel').onchange = e => { if (e.target.value === 'geo') return; S.geo = null; S.city = +e.target.value; refresh(); };
$('#methodSel').onchange = e => { S.method = e.target.value; refresh(); };
$('#asrSel').onchange = e => { S.hanafi = e.target.value === '1'; refresh(); };
$('#hourSel').onchange = e => { S.h12 = e.target.value === '1'; refresh(); };
$('#adhanSel').onchange = e => { S.adhan = e.target.value; save(); };
$('#adhanPreview').onclick = () => { if (adhanAudio) stopAdhan(); else playAdhan(); };
$('#soundChk').onchange = e => { S.sound = e.target.checked; save(); };
$('#adhkarChk').onchange = e => { S.adhkarRem = e.target.checked; save(); if (e.target.checked) askPerm(); };
$('#notifyChk').onchange = async e => { S.notify = e.target.checked; save(); if (S.notify) await askPerm(); };
async function askPerm() {
  const n = $('#notifyNote');
  if (!('Notification' in window)) { n.textContent = 'المتصفح لا يدعم التنبيهات.'; return; }
  const r = await Notification.requestPermission();
  n.textContent = r === 'granted' ? 'تم تفعيل التنبيهات. يعمل التنبيه والتطبيق مفتوح أو في الخلفية على المتصفح.' : 'لم يتم السماح بالتنبيهات من إعدادات المتصفح.';
  if (r === 'granted') notify('نور', 'التنبيهات تعمل ✓');
}
$('#geoBtn').onclick = () => navigator.geolocation?.getCurrentPosition(pos => { S.geo = { lat: pos.coords.latitude, lon: pos.coords.longitude }; refresh(); }, () => { $('#notifyNote').textContent = 'تعذر تحديد الموقع.'; });
$('#compassBtn').onclick = async () => {
  try { if (DeviceOrientationEvent.requestPermission) await DeviceOrientationEvent.requestPermission(); } catch {}
  addEventListener('deviceorientationabsolute', o => { if (o.alpha != null) { heading = 360 - o.alpha; renderQibla(); } });
  addEventListener('deviceorientation', o => { if (o.webkitCompassHeading != null) { heading = o.webkitCompassHeading; renderQibla(); } });
};
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
initSettings(); renderDates(); renderTimes(); renderAdhkar(); renderTasbeeh(); renderQibla();
window._init = true;
setInterval(() => { tick(); checkAlerts(); }, 1000);

$('#about').innerHTML = `<b>نور</b> · حقوق النشر © 2026 el3mm_mesoo · Instagram: @el3mm_mesoo<br>
<b>صدقة جارية</b> على جميع موتى المسلمين. اللهم اغفر لهم وارحمهم واجعل هذا العمل في ميزان حسناتهم. لا تنساهم في دعواتك.<br>
<div class="notice"><b>تنبيه:</b> النصوص الدينية (القرآن والتفسير والأذكار وعزوها ودرجاتها) رُوجعت مقابل مصادر مرجعية، ولم تخضع بعد لمراجعة نهائية من عالم شرعي. مفتوح للمراجعة: عزو آية الكرسي (صباحًا ومساءً وبعد الصلاة)، وألفاظ تسجيلات الأذان.</div>
<small>مصادر: الأوقات بزوايا الهيئة المصرية العامة للمساحة (كما تعتمدها دار الإفتاء المصرية) · نص المصحف: رواية حفص برسم عثماني من alquran.cloud وطُوبق مع Quran.com · التفاسير: الميسر (مجمع الملك فهد) والجلالين والوسيط لطنطاوي · التلاوة: everyayah.com · الأذان: ويكيميديا كومنز (انظر ملف CREDITS) · الأذكار: حصن المسلم مع العزو لكل ذكر.</small>`;

// ---- التنبيهات الأصلية في تطبيقي أندرويد وآيفون (تعمل والتطبيق مغلق): جدولة 7 أيام قادمة
async function scheduleNative() {
  const LN = window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins.LocalNotifications;
  if (!LN) return;
  try {
    await LN.cancel({ notifications: (await LN.getPending()).notifications });
    if (!S.notify) return;
    let perm = await LN.checkPermissions(); if (perm.display !== 'granted') perm = await LN.requestPermissions(); if (perm.display !== 'granted') return;
    const now = new Date(), list = []; let id = 1;
    for (let d = 0; d < 7; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d), { t, tz } = timesFor(day);
      for (const k of ORDER) { if (k === 'sunrise') continue; const at = toInstant(day, t[k], tz); if (at > now) list.push({ id: id++, title: 'حان الآن وقت صلاة ' + NAMES[k], body: 'حيّ على الصلاة · ' + place().name, schedule: { at, allowWhileIdle: true } }); }
    }
    await LN.schedule({ notifications: list });
  } catch (e) { console.warn('native schedule', e); }
}
const _refresh = refresh; refresh = function () { _refresh(); scheduleNative(); };
$('#notifyChk').addEventListener('change', () => setTimeout(scheduleNative, 300));
scheduleNative();
