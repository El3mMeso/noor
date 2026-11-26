import json,re,urllib.request,difflib,concurrent.futures as cf
def N(s):
    s=re.sub(r'<[^>]+>',' ',s); s=re.sub('[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]','',s)
    s=re.sub('[ٱأإآ]','ا',s).replace('ى','ي').replace('ة','ه')
    return re.sub('[^\u0621-\u064A]','',s)
EDS={'ar.muyassar':'ar-tafsir-muyassar','ar.waseet':'ar-tafsir-al-wasit','ar.jalalayn':'ar-tafsir-al-jalalayn'}
def fetch(slug,n):
    for t in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(f'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/{slug}/{n}.json',headers={'User-Agent':'n'}),timeout=40))
        except Exception as e: err=e
    return None
meta=json.load(open('../web/data/surahs.json'))
fw_mu=[x['text'] for x in json.load(open('fw_ara-kingfahadquranc.json'))['quran']]
rows=[]
for ed,slug in EDS.items():
    with cf.ThreadPoolExecutor(8) as ex: ref={n:r for n,r in zip(range(1,115),ex.map(lambda n:fetch(slug,n),range(1,115)))}
    miss=[n for n,r in ref.items() if r is None]; tot=0;exact=0;low=[];idx=0
    for m in meta:
        mine=json.load(open(f'../web/data/{ed}/{m["n"]}.json'))
        r=ref[m['n']]
        if r is None: continue
        ra=r.get('ayahs',r) if isinstance(r,dict) else r
        rt=[a['text'] for a in ra]
        if len(rt)!=len(mine): low.append((m['n'],'len',len(rt),len(mine)));continue
        for i,(a,b) in enumerate(zip(mine,rt)):
            tot+=1;x,y=N(a),N(b)
            if x==y: exact+=1
            else:
                s=difflib.SequenceMatcher(None,x,y,autojunk=False).quick_ratio() if len(x)>1500 else difflib.SequenceMatcher(None,x,y,autojunk=False).ratio()
                low.append((m['n'],i+1,round(s,3)))
    print(ed,'vs',slug,'| fetched chapters',114-len(miss),'| ayahs',tot,'exact(normalized)',exact,'| not exact',len(low),'| worst',sorted(low,key=lambda t:t[2] if isinstance(t[2],float) else 0)[:6])
    rows.append((ed,tot,exact,len(low),miss))
    json.dump(low,open(f'tafsir_diff_{ed}.json','w'))
# Muyassar third source: King Fahd Complex file (qurancomplex.gov.sa per fawazahmed0)
mu=[a for m in meta for a in json.load(open(f'../web/data/ar.muyassar/{m["n"]}.json'))]
ex=sum(1 for a,b in zip(mu,fw_mu) if N(a)==N(b)); print('Muyassar vs fawazahmed0 ara-kingfahadquranc:',ex,'/',len(mu))
