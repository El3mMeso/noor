// قسم القرآن: نص المصحف والتفسير محملان من ملفات محلية (يعمل دون إنترنت)، والتلاوة بالبث من everyayah.com
const RECITERS = [
  ['Alafasy_128kbps', 'مشاري راشد العفاسي'], ['Abdul_Basit_Murattal_192kbps', 'عبد الباسط عبد الصمد (مرتل)'],
  ['Husary_128kbps', 'محمود خليل الحصري'], ['Minshawy_Murattal_128kbps', 'محمد صديق المنشاوي (مرتل)'],
  ['Mohammad_al_Tablaway_128kbps', 'محمد الطبلاوي'], ['Abdurrahmaan_As-Sudais_192kbps', 'عبد الرحمن السديس'],
  ['MaherAlMuaiqly128kbps', 'ماهر المعيقلي'], ['Hudhaify_128kbps', 'علي الحذيفي'],
];
const TAFSIRS = [
  ['', 'بدون تفسير'],
  ['ar.muyassar', 'التفسير الميسر (مجمع الملك فهد)'],
  ['ar.jalalayn', 'تفسير الجلالين'],
  ['ar.waseet', 'التفسير الوسيط (د. محمد سيد طنطاوي، شيخ الأزهر الأسبق)'],
];
const Q = { meta: [], cur: null, ayahs: [], tafsir: null, audio: new Audio(), idx: -1, all: false };
const pad = (n, l = 3) => String(n).padStart(l, '0');
const qget = async p => (await fetch(p)).json();
const qs = k => document.querySelector(k);
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
async function initQuran() {
  Q.meta = await qget('data/surahs.json');
  Q.reciter = localStorage.getItem('noor.reciter') || RECITERS[0][0];
  Q.tafKey = localStorage.getItem('noor.tafsir') || 'ar.muyassar';
  qs('#reciterSel').innerHTML = RECITERS.map(r => `<option value="${r[0]}">${r[1]}</option>`).join(''); qs('#reciterSel').value = Q.reciter;
  qs('#tafsirSel').innerHTML = TAFSIRS.map(r => `<option value="${r[0]}">${r[1]}</option>`).join(''); qs('#tafsirSel').value = Q.tafKey;
  renderSurahs('');
}
const normAr = x => x.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/^سوره\s*/, '');
function renderSurahs(f) {
  const t = f.trim(), nt = normAr(t), nt2 = nt.replace(/^ال/, '');
  qs('#surahList').innerHTML = Q.meta.filter(s => { const nn = normAr(s.name); return !t || nn.includes(nt) || nn.replace(/^سوره\s*/, '').replace(/^ال/, '').includes(nt2) || s.en.toLowerCase().includes(t.toLowerCase()) || String(s.n) === t; })
    .map(s => `<li data-n="${s.n}"><span class="num">${AR(s.n)}</span><span class="nm">${s.name}</span><small>${s.type === 'Meccan' ? 'مكية' : 'مدنية'} · ${AR(s.count)} آية</small></li>`).join('');
}
async function openSurah(n) {
  stopAudio(); Q.cur = n;
  const m = Q.meta[n - 1];
  Q.ayahs = await qget(`data/q/${n}.json`);
  await loadTafsir();
  qs('#qList').hidden = true; qs('#qReader').hidden = false; qs('#qTitle').textContent = m.name;
  const bism = (n !== 1 && n !== 9) ? '<div class="bism">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>' : '';
  qs('#qAyahs').innerHTML = bism + Q.ayahs.map((t, i) => `<div class="ay" id="ay${i}"><div class="at">${t} <span class="no">﴿${AR(i + 1)}﴾</span></div>
    <div class="ctl"><button data-play="${i}">▶ استماع</button><button data-tf="${i}">تفسير</button></div><div class="tf" hidden></div></div>`).join('');
  qs('#tafsirSrc').textContent = tafsirSource();
  window.scrollTo(0, 0);
}
function tafsirSource() { const t = TAFSIRS.find(x => x[0] === Q.tafKey); return Q.tafKey ? 'التفسير المعروض: ' + t[1] + ' (النص من alquran.cloud وطابقنا الوسيط مع Quran.com)' : ''; }
async function loadTafsir() { Q.tafsir = Q.tafKey ? await qget(`data/${Q.tafKey}/${Q.cur}.json`) : null; }
function showTafsir(i) {
  const box = qs(`#ay${i} .tf`);
  if (!Q.tafsir) { box.textContent = 'اختر تفسيرًا من القائمة أعلاه.'; }
  else { let t = Q.tafsir[i] || '', pre = ''; if (!t.trim()) { let j = i; while (j > 0 && !(Q.tafsir[j] || '').trim()) j--; t = Q.tafsir[j] || ''; pre = 'تفسير مشترك مع الآيات السابقة (من الآية ' + AR(j + 1) + '):\n'; } box.textContent = pre + t; }
  box.hidden = !box.hidden;
}
function playAyah(i, all) {
  Q.idx = i; Q.all = !!all;
  document.querySelectorAll('.ay.playing').forEach(e => e.classList.remove('playing'));
  const el = qs('#ay' + i); if (!el) return stopAudio(); el.classList.add('playing'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  // مع الفاتحة: الآية الأولى هي البسملة نفسها. باقي السور: البسملة تُعرض بدون صوت منفصل.
  Q.audio.src = `https://everyayah.com/data/${Q.reciter}/${pad(Q.cur)}${pad(i + 1)}.mp3`;
  Q.audio.play().catch(() => {});
}
function stopAudio() { Q.audio.pause(); Q.idx = -1; document.querySelectorAll('.ay.playing').forEach(e => e.classList.remove('playing')); }
Q.audio.addEventListener('ended', () => { if (Q.all && Q.idx + 1 < Q.ayahs.length) playAyah(Q.idx + 1, true); else stopAudio(); });
document.addEventListener('click', e => {
  const li = e.target.closest('#surahList li'); if (li) return openSurah(+li.dataset.n);
  const p = e.target.closest('[data-play]'); if (p) return playAyah(+p.dataset.play, false);
  const t = e.target.closest('[data-tf]'); if (t) return showTafsir(+t.dataset.tf);
  if (e.target.id === 'qBack') { stopAudio(); qs('#qReader').hidden = true; qs('#qList').hidden = false; }
  if (e.target.id === 'qPlayAll') playAyah(0, true);
});
document.addEventListener('change', async e => {
  if (e.target.id === 'reciterSel') { Q.reciter = e.target.value; localStorage.setItem('noor.reciter', Q.reciter); }
  if (e.target.id === 'tafsirSel') { Q.tafKey = e.target.value; localStorage.setItem('noor.tafsir', Q.tafKey); await loadTafsir(); qs('#tafsirSrc').textContent = tafsirSource(); document.querySelectorAll('.tf').forEach(b => { b.hidden = true; }); }
});
document.addEventListener('input', e => { if (e.target.id === 'qSearch') renderSurahs(e.target.value); });
initQuran();
