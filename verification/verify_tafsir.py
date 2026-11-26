import json,re,urllib.request,difflib
def norm(s):
    s=re.sub(r'<[^>]+>',' ',s); s=re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]','',s)
    return re.sub(r'[^\u0621-\u064A]','',s)
eds={'ar.waseet':93,'ar.muyassar':16}
out=[]
for ed,tid in eds.items():
    S=json.load(open(ed+'.json'))['data']['surahs']
    for ch in (1,36,112,114):
        d=json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.quran.com/api/v4/tafsirs/{tid}/by_chapter/{ch}?per_page=300',headers={'User-Agent':'n'}),timeout=40))['tafsirs']
        mine=' '.join(a['text'] for a in S[ch-1]['ayahs']); theirs=' '.join(t['text'] for t in d)
        a,b=norm(mine),norm(theirs)
        r=difflib.SequenceMatcher(None,a[:6000],b[:6000],autojunk=False).ratio()
        out.append((ed,ch,len(a),len(b),round(r,3)))
        print(out[-1])
