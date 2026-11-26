import json,re,urllib.request,unicodedata,collections
def N(s):
    s=s.replace('\u06E1','\u0652')           # KFGQPC sukun -> standard sukun
    s=s.replace('\u0640','')                  # tatweel
    s=s.replace('ی','ي').replace('ک','ك')    # Persian forms used by some datasets
    s=re.sub('[\u200c\u200d\u200f\u200e\u06DE\u06E9 ]+',' ',s)  # hizb sign / sajdah sign / spaces
    s=s.replace('\u0670\u0627','\u0627\u0670') if False else s
    s=re.sub(r'\s+',' ',s).strip()
    return unicodedata.normalize('NFC',s)
mine=[a['text'] for s in json.load(open('quran-uthmani.json'))['data']['surahs'] for a in s['ayahs']]
# alquran.cloud embeds bismillah in 1st ayah of surahs 2..114 except 9; strip for fair comparison
meta=json.load(open('../web/data/surahs.json'))
idx=0;stripped=[]
BIS_CHARS=4
for m in meta:
    for i in range(m['count']):
        t=mine[idx];idx+=1
        if i==0 and m['n'] not in (1,9): t=' '.join(t.split(' ')[4:])
        stripped.append(t)
def cmp(name,ref):
    bad=[];ok=0
    for k,(a,b) in enumerate(zip(stripped,ref)):
        if N(a)==N(b): ok+=1
        else: bad.append(k)
    print(name,'exact after normalization:',ok,'/',len(ref),'mismatch',len(bad));return bad
hafs=[x['text'] for x in json.load(open('fw_ara-quranuthmanihaf.json'))['quran']]
# strip bismillah from refs where present on first ayah
def strip_ref(ref):
    out=[];idx=0
    for m in meta:
        for i in range(m['count']):
            t=ref[idx];idx+=1
            if i==0 and m['n'] not in (1,9):
                w=t.split(' ')
                if len(w)>4 and 'بِسۡمِ' in w[0] or (len(w)>4 and 'بسم' in re.sub('[\u064B-\u065F\u0670\u06E1]','',w[0])): t=' '.join(w[4:])
            out.append(t)
    return out
b1=cmp('KFGQPC Uthmani Hafs (qurancomplex.gov.sa via fawazahmed0)',strip_ref(hafs))
kh=[x['text'] for x in json.load(open('fw_ara-qurankhaledhosn.json'))['quran']]
b2=cmp('Khaled Hosny quran-data',strip_ref(kh))
for name,b in (('KFGQPC',b1),):
    for k in b[:12]:
        a=N(stripped[k]);r=N(strip_ref(hafs)[k])
        diff=[(i,a[i-2:i+3],r[i-2:i+3]) for i in range(min(len(a),len(r))) if a[i]!=r[i]][:2]
        print(name,k+1,diff,len(a),len(r))
json.dump(b1,open('diac_mismatch_idx.json','w'))
