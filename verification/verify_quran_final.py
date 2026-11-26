# Final Quran text verification: web/data/q (what the app ships) vs two independent sources.
import json,re,urllib.request
meta=json.load(open('../web/data/surahs.json'))
M=[a for m in meta for a in json.load(open(f'../web/data/q/{m["n"]}.json'))]
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
def pre(s):
    s=re.sub('\u0640([\u064B-\u0652\u0670\u08F0-\u08F2]*)\u0654',lambda m:'ء'+m.group(1),s)
    return s.replace('\u0654','ء').replace('\u0655','ء')
def core(s):
    s=pre(s); s=s.replace('\u06E1','\u0652').replace('\u08F0','\u064B').replace('\u08F1','\u064C').replace('\u08F2','\u064D').replace('\u0640','')
    s=re.sub('[^\u0621-\u064A\u064B-\u0652\u0670 ]','',s).replace('ی','ي')
    s=s.replace('\u064B','\u064E').replace('\u064C','\u064F').replace('\u064D','\u0650')
    s=re.sub('[اوىيءئؤأإآٱ\u0670][\u064B-\u0652]*','',s); s=re.sub('\u0652','',s)
    s=re.sub('[\u064B-\u0651]{2,}',lambda m:''.join(sorted(m.group(0))),s)
    return re.sub(r'\s+',' ',s).strip()
qc=[]
for ch in range(1,115):
    qc+=[v['text_uthmani'] for v in json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={ch}',headers={'User-Agent':'n'}),timeout=30))['verses']]
H=[x['text'] for x in json.load(open('fw_ara-quranuthmanihaf.json'))['quran']]
for n,r in (('Quran.com text_uthmani',qc),('KFGQPC Uthmani Hafs (qurancomplex.gov.sa)',H)):
    R=strip(r);bad=[k for k,(a,b) in enumerate(zip(M,R)) if core(a)!=core(b)]
    print(n,'| ayahs matching consonants+core harakat:',6236-len(bad),'/ 6236 | residual',len(bad),[b+1 for b in bad][:40])
