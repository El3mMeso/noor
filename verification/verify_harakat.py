import json,re,unicodedata
exec(open('verify_diacritics.py').read().split("def cmp")[0].split("def N")[0])  # imports only
def core(s):
    s=s.replace('\u06E1','\u0652').replace('\u08F0','\u064B').replace('\u08F1','\u064C').replace('\u08F2','\u064D')
    s=s.replace('ی','ي').replace('ى','ي').replace('ک','ك').replace('ۀ','ه').replace('ہ','ه')
    s=re.sub('[ٱأإآ]','ا',s); s=s.replace('ؤ','و').replace('ئ','ي').replace('ء','')
    s=s.replace('\u0640','')
    # keep: letters, fathatan/dammatan/kasratan, fatha, damma, kasra, shadda, sukun, dagger alef
    s=re.sub('[^\u0621-\u064A\u064B-\u0652\u0670 ]','',s)
    s=s.replace('\u0670','ا')           # dagger alef = long alef (spelling convention)
    s=re.sub('ا+','ا',s)                 # alef spelling length conventions
    s=re.sub('[وي]\u0652','',s)          # silent letters marked by sukun/small signs differ in datasets
    s=re.sub('\u0652','',s)              # sukun presence is often omitted/implicit in some editions
    s=re.sub('[\u064E\u064F\u0650]\u0651','\u0651',s) if False else s
    s=re.sub('[\u064B-\u0651]{2,}',lambda m:''.join(sorted(m.group(0))),s)
    return re.sub(r'\s+',' ',s).strip()
meta=json.load(open('../web/data/surahs.json'))
raw=[a['text'] for s in json.load(open('quran-uthmani.json'))['data']['surahs'] for a in s['ayahs']]
def strip(ref):
    out=[];idx=0
    for m in meta:
        for i in range(m['count']):
            t=ref[idx];idx+=1
            if i==0 and m['n'] not in (1,9):
                w=t.split(' ')
                if len(w)>4 and 'بسم' in re.sub('[^\u0621-\u064A]','',w[0]): t=' '.join(w[4:])
            out.append(t)
    return out
M=strip(raw)
def run(name,ref):
    R=strip(ref); bad=[k for k,(a,b) in enumerate(zip(M,R)) if core(a)!=core(b)]
    print(name,'core-vocalization match',6236-len(bad),'/6236, mismatches',len(bad))
    return bad,R
qc=[]
import urllib.request
for ch in range(1,115):
    d=json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={ch}',headers={'User-Agent':'n'}),timeout=30))['verses']
    qc+= [v['text_uthmani'] for v in d]
res={}
for name,ref in (('KFGQPC Hafs',[x['text'] for x in json.load(open('fw_ara-quranuthmanihaf.json'))['quran']]),('Khaled Hosny',[x['text'] for x in json.load(open('fw_ara-qurankhaledhosn.json'))['quran']]),('Quran.com uthmani',qc)):
    b,R=run(name,ref);res[name]=b
    for k in b[:6]:
        a,c=core(M[k]),core(R[k]); i=next((j for j in range(min(len(a),len(c))) if a[j]!=c[j]),min(len(a),len(c)))
        print('  ayah#',k+1,'|',a[max(0,i-6):i+8],'|',c[max(0,i-6):i+8])
allbad=set(res['KFGQPC Hafs'])&set(res['Khaled Hosny'])&set(res['Quran.com uthmani'])
print('mismatching in ALL three refs:',len(allbad),sorted(allbad)[:20])
json.dump({k:v for k,v in res.items()},open('harakat_mismatch.json','w'))
