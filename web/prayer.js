// حساب مواقيت الصلاة فلكيًا. الافتراضي: الهيئة المصرية العامة للمساحة (فجر 19.5° / عشاء 17.5°)
(function (root) {
  const R = Math.PI / 180;
  const METHODS = {
    egypt: { name: 'الهيئة المصرية العامة للمساحة', fajr: 19.5, isha: 17.5 },
    mwl: { name: 'رابطة العالم الإسلامي', fajr: 18, isha: 17 },
    makkah: { name: 'أم القرى (مكة)', fajr: 18.5, ishaMin: 90 },
    karachi: { name: 'جامعة العلوم الإسلامية بكراتشي', fajr: 18, isha: 18 },
  };
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = (357.529 + 0.98560028 * D) % 360;
    const q = (280.459 + 0.98564736 * D) % 360;
    const L = (q + 1.915 * Math.sin(g * R) + 0.020 * Math.sin(2 * g * R)) % 360;
    const e = 23.439 - 0.00000036 * D;
    const RA = Math.atan2(Math.cos(e * R) * Math.sin(L * R), Math.cos(L * R)) / R / 15;
    const dec = Math.asin(Math.sin(e * R) * Math.sin(L * R)) / R;
    let eqt = q / 15 - ((RA + 24) % 24);
    if (eqt > 12) eqt -= 24; if (eqt < -12) eqt += 24;
    return { dec, eqt };
  }
  const fix = h => ((h % 24) + 24) % 24;
  // يعيد أوقات الصلاة بالساعات العشرية (بتوقيت المنطقة tz)
  function compute(date, lat, lon, tz, opts) {
    opts = opts || {};
    const M = METHODS[opts.method || 'egypt'];
    const asrF = opts.hanafi ? 2 : 1;
    const jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lon / (15 * 24);
    const noonSun = sunPos(jd + 0.5);
    const transit = 12 + tz - lon / 15 - noonSun.eqt;
    const at = (angle, ccw, hourGuess) => {
      const s = sunPos(jd + hourGuess / 24);
      const c = (-Math.sin(angle * R) - Math.sin(lat * R) * Math.sin(s.dec * R)) / (Math.cos(lat * R) * Math.cos(s.dec * R));
      if (c > 1 || c < -1) return NaN;
      const t = Math.acos(c) / R / 15;
      return transit + (ccw ? -t : t);
    };
    const asrAt = () => {
      const s = sunPos(jd + 0.65);
      const alt = Math.atan(1 / (asrF + Math.tan(Math.abs(lat - s.dec) * R))) / R;
      const c = (Math.sin(alt * R) - Math.sin(lat * R) * Math.sin(s.dec * R)) / (Math.cos(lat * R) * Math.cos(s.dec * R));
      return transit + Math.acos(Math.max(-1, Math.min(1, c))) / R / 15;
    };
    const sunrise = at(0.833, true, 6), sunset = at(0.833, false, 18);
    const r = {
      fajr: at(M.fajr, true, 5), sunrise, dhuhr: transit + 1 / 60, asr: asrAt(), maghrib: sunset,
      isha: M.ishaMin ? sunset + M.ishaMin / 60 : at(M.isha, false, 19),
    };
    for (const k in r) r[k] = fix(r[k] + (opts.adjust && opts.adjust[k] ? opts.adjust[k] / 60 : 0));
    return r;
  }
  function qibla(lat, lon) {
    const kl = 21.4225 * R, kn = 39.8262 * R, p = lat * R, dl = kn - lon * R;
    return (Math.atan2(Math.sin(dl), Math.cos(p) * Math.tan(kl) - Math.sin(p) * Math.cos(dl)) / R + 360) % 360;
  }
  function fmt(h, h12) {
    if (isNaN(h)) return '--:--';
    let m = Math.round(h * 60), hh = Math.floor(m / 60) % 24, mm = m % 60;
    if (h12) { const s = hh >= 12 ? 'م' : 'ص'; hh = hh % 12 || 12; return hh + ':' + String(mm).padStart(2, '0') + ' ' + s; }
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }
  const api = { compute, qibla, fmt, METHODS };
  if (typeof module !== 'undefined') module.exports = api; else root.Prayer = api;
})(this);
