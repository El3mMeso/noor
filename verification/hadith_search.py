import json,re,subprocess,sys
def N(s):
    s=re.sub('[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200f\u200e]','',s)
    s=re.sub('[ٱأإآ]','ا',s).replace('ى','ي').replace('ة','ه')
    return re.sub(r'\s+',' ',re.sub('[^\u0621-\u064A ]',' ',s)).strip()
COL={}
for c in ['bukhari','muslim','abudawud','tirmidhi','nasai','ibnmajah','malik']:
    COL[c]=[(h['hadithnumber'],N(h['text']),h.get('grades',[])) for h in json.load(open(f'hadith/{c}.json'))['hadiths']]
def search(q,limit=4):
    q=N(q);out=[]
    for c,L in COL.items():
        for n,t,g in L:
            if q in t: out.append((c,n,[(x['name'].split()[-1] if x['name'] else '',x['grade']) for x in g]))
    return out[:limit*3]
if __name__=='__main__':
    A=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('../web/adhkar.js')))"]).decode())
    for k,v in A.items():
        for i,it in enumerate(v['items']):
            words=N(it['t'].replace('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ','')).split()
            # try phrases of decreasing length from 2 positions
            hits=[];used=None
            for L in (6,5,4):
                for st in (0,len(words)//2,max(0,len(words)-L)):
                    q=' '.join(words[st:st+L])
                    if len(q)<8: continue
                    h=search(q)
                    if h: hits=h;used=q;break
                if hits: break
            print(f"{k}[{i}] n={it['n']} src='{it['s'][:50]}'\n   q='{used}' hits={hits[:6]}")
