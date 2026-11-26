import json,re,difflib,subprocess
def norm(s):
    s=re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]','',s)
    s=re.sub(r'[ٱأإآ]','ا',s).replace('ى','ي').replace('ة','ه')
    return re.sub(r'[^\u0621-\u064A ]','',s).strip()
ref=[]
for c in json.load(open('ref_adhkar.json')):
    for it in c['array']: ref.append((c['category'],norm(it['text']),it.get('count')))
src=subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('../web/adhkar.js')))"]).decode()
A=json.loads(src); rows=[]
for k,v in A.items():
    for i,it in enumerate(v['items']):
        t=norm(it['t'].replace('(آية الكرسي)',''))
        best=max(ref,key=lambda r:difflib.SequenceMatcher(None,t,r[1][:len(t)+40],autojunk=False).ratio())
        r=difflib.SequenceMatcher(None,t,best[1][:len(t)+40],autojunk=False).ratio()
        rows.append((k,i,round(r,2),it['n'],best[2],best[0][:25]))
for r in rows: print(r)
print('low(<0.9):',[r[:3] for r in rows if r[2]<0.9])
