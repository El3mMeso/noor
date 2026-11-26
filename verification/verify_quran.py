import json,re,urllib.request,difflib,time,sys
def norm(s):
    s=re.sub(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]','',s)
    s=re.sub(r'[ٱأإآ]','ا',s); s=s.replace('ى','ي').replace('ة','ه')
    s=re.sub(r'[اوي]','',s)  # skeleton: Uthmani vs Imlaei spell long vowels differently
    return re.sub(r'[^\u0621-\u064A]','',s)
q=json.load(open('quran-uthmani.json'))['data']['surahs']
BISM=norm('بسم الله الرحمن الرحيم')
bad=[];n=0;worst=1
for s in q:
    num=s['number']
    d=None
    for t in range(4):
        try: d=json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.quran.com/api/v4/quran/verses/imlaei?chapter_number={num}',headers={'User-Agent':'noor/1.0'}),timeout=30))['verses'];break
        except Exception as e: time.sleep(2)
    assert d, num
    assert len(d)==len(s['ayahs']),(num,len(d),len(s['ayahs']))
    for a,b in zip(s['ayahs'],d):
        x=norm(a['text']); 
        if a['numberInSurah']==1 and num not in (1,9) and x.startswith(BISM): x=x[len(BISM):]
        y=norm(b['text_imlaei']); r=difflib.SequenceMatcher(None,x,y,autojunk=False).ratio(); n+=1; worst=min(worst,r)
        if r<0.85: bad.append((num,a["numberInSurah"],round(r,2),a["text"][:40],b["text_imlaei"][:40]))
print('ayahs compared',n,'worst ratio',round(worst,3),'below 0.95:',len(bad),bad[:15])
