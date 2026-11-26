const P = require('./prayer.js'); const assert = require('assert');
let n = 0; const ok = (c, m) => { assert(c, m); n++; console.log('✓', m); };
const near = (a, b, tol) => Math.abs(a - b) <= tol / 60;
// القاهرة 30.0444N 31.2357E، 21 يونيو 2026 (UTC+3 صيفي) وعينة شتوية 25 نوفمبر 2026 (UTC+2)
const w = P.compute(new Date(2026, 10, 25), 30.0444, 31.2357, 2);
console.log(Object.entries(w).map(([k, v]) => k + ' ' + P.fmt(v)).join(' | '));
ok(w.fajr < w.sunrise && w.sunrise < w.dhuhr && w.dhuhr < w.asr && w.asr < w.maghrib && w.maghrib < w.isha, 'ترتيب الصلوات صحيح');
// مرجع: دار الإفتاء المصرية (بالتنسيق مع هيئة المساحة) للقاهرة 25 نوفمبر 2026
const ref = { fajr: [4,57], sunrise: [6,28], dhuhr: [11,42], asr: [14,36], maghrib: [16,55], isha: [18,17] };
for (const k in ref) ok(near(w[k], ref[k][0] + ref[k][1] / 60, 1.5), 'مطابقة دار الإفتاء: ' + k + ' ' + P.fmt(w[k]) + ' ≈ ' + ref[k].join(':'));
const s = P.compute(new Date(2026, 5, 21), 30.0444, 31.2357, 3);
ok(s.fajr < s.sunrise && s.maghrib < s.isha, 'صيفًا الترتيب صحيح');
const mk = P.compute(new Date(2026, 5, 21), 21.4225, 39.8262, 3, { method: 'makkah' });
ok(near(mk.isha - mk.maghrib + 24, 1.5, 1) || Math.abs((mk.isha - mk.maghrib + 24) % 24 - 1.5) < 0.02, 'أم القرى: العشاء بعد المغرب 90 دقيقة');
const q = P.qibla(30.0444, 31.2357); ok(q > 134 && q < 138, 'القبلة من القاهرة ≈ 136° (' + q.toFixed(1) + ')');
const h = P.compute(new Date(2026, 10, 25), 30.0444, 31.2357, 2, { hanafi: true });
ok(h.asr > w.asr, 'العصر الحنفي أبعد من الجمهور');
console.log(n + ' اختبارات نجحت');
