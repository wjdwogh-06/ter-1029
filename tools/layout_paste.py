# 71차: 관리자 [구조물 배치] → [📋 배치 복사]로 받은 글을 assets/world-layout.json으로 저장해요.
# 쓰는 법: 기획자가 보낸 글(LAYOUT1:{...})을 파일로 저장 → python3 tools/layout_paste.py 파일   (파일 대신 - 이면 표준 입력)
# 검사: version 1, objects가 객체, 값은 [x,z,r] / {deleted:true} / {type,origin,pose}. seed가 지금 맵과 다르면 멈춰요.
import json,sys,re,os
src=sys.argv[1] if len(sys.argv)>1 else '-'
t=(sys.stdin.read() if src=='-' else open(src,encoding='utf-8').read()).strip()
t=re.sub(r'^\s*LAYOUT1:','',t)
d=json.loads(t)
assert d.get('version')==1 and isinstance(d.get('objects'),dict),'배치 글 형식이 아니에요'
core=open(os.path.join(os.path.dirname(__file__),'..','js','core.js'),encoding='utf-8').read()
m=re.search(r'WORLD_SEED\s*=\s*(\d+)',core)
if m and d.get('seed') not in (None,int(m.group(1))):sys.exit(f"seed가 달라요: 글 {d.get('seed')} / 맵 {m.group(1)}")
ok=lambda v:isinstance(v,list) and len(v)==3 and all(isinstance(a,(int,float)) for a in v)
bad=[k for k,v in d['objects'].items() if not(ok(v) or v=={'deleted':True} or (isinstance(v,dict) and v.get('type') and ok(v.get('origin')) and ok(v.get('pose'))))]
if bad:sys.exit('이상한 값: '+', '.join(bad[:10]))
out=os.path.join(os.path.dirname(__file__),'..','assets','world-layout.json')
json.dump({'version':1,'seed':d.get('seed'),'objects':d['objects']},open(out,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('저장:',len(d['objects']),'개 →',os.path.normpath(out))
