import json,re,time,urllib.request
exec(open('verify_tafsir_full.py').read().split("EDS=")[0])
meta=json.load(open('../web/data/surahs.json'))
def get(slug,n):
    for t in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(f'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/{slug}/{n}.json',headers={'User-Agent':'n'}),timeout=40))
        except Exception: time.sleep(2)
tot=ex=0;weird=[];fail=[]
for m in meta:
    r=get('ar-tafsir-al-wasit',m['n'])
    if not r: fail.append(m['n']);continue
    ra=r['ayahs'] if isinstance(r,dict) else r
    mine=json.load(open(f'../web/data/ar.waseet/{m["n"]}.json')); rt=[a['text'] for a in ra]
    if len(mine)!=len(rt): weird.append((m['n'],'len',len(rt),len(mine)));continue
    for i,(a,b) in enumerate(zip(mine,rt)):
        tot+=1
        if N(a)==N(b): ex+=1
        else: weird.append((m['n'],i+1,len(N(a)),len(N(b))))
print('waseet vs Quran.com-derived (spa5k): ayahs',tot,'exact',ex,'failed chapters',fail,'diffs',len(weird),weird[:15])
d=json.load(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.json',timeout=60))['quran']
mine=[a for m in meta for a in json.load(open(f'../web/data/ar.jalalayn/{m["n"]}.json'))]
bad=[(i+1) for i,(a,b) in enumerate(zip(mine,[x['text'] for x in d])) if N(a)!=N(b)]
print('Jalalayn vs fawazahmed0/Tanzil ara-jalaladdinalmah: exact',len(mine)-len(bad),'/',len(mine),'diff',bad[:20])
