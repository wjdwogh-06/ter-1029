# 크리에이티브 블록 보기(33차): 기획자가 관리자 모드에서 쌓은 블록을 Claude가 확인하는 도구.
# 입력: 파일 하나 — 'BLK1:x.z.k.c;...' 글(📋 복사), 블록 글만, 또는 db_get(creative/main) 결과 JSON({"blocks": "..."}).
#   python3 tools/cre_view.py /tmp/blocks.txt
# 결과: 크기·층·색 요약 출력 + tools/out/cre_layers.png(층마다 위에서 본 칸 그림, 위가 북쪽 −z) + tools/out/cre_iso.png(입체)
import sys, os, json, re
from collections import Counter, defaultdict
COL = [(0xf0,0xe6,0xd0,'크림'),(0xb0,0x6c,0x36,'나무'),(0x85,0x8c,0x93,'돌'),(0xc9,0x3c,0x36,'빨강'),(0x47,0x9a,0x43,'초록'),(0x2f,0x7c,0xc8,'파랑')]
OUT = os.path.join(os.path.dirname(__file__), 'out')

def parse(txt):
    txt = txt.strip()
    m = re.search(r'"blocks"\s*:\s*"([^"]*)"', txt)
    if m: txt = m.group(1)
    if txt.startswith('BLK1:'): txt = txt[5:]
    out = []
    for t in txt.split(';'):
        p = t.strip().split('.')
        if len(p) < 4: continue
        try: out.append(tuple(int(v) for v in p[:4]))
        except ValueError: pass
    return out

def main():
    src = open(sys.argv[1], encoding='utf-8').read() if len(sys.argv) > 1 else sys.stdin.read()
    B = parse(src)
    if not B: print('블록 없음'); return
    xs=[b[0] for b in B]; zs=[b[1] for b in B]; ks=[b[2] for b in B]
    x0,x1,z0,z1,k0,k1=min(xs),max(xs),min(zs),max(zs),min(ks),max(ks)
    print(f'블록 {len(B)}개 · x {x0}~{x1} ({x1-x0+1}칸) · z {z0}~{z1} ({z1-z0+1}칸) · 층 {k0}~{k1} ({k1-k0+1}층) · 가운데 x {(x0+x1+1)/2:.1f} z {(z0+z1+1)/2:.1f}')
    print('색:', ', '.join(f'{COL[c][3] if c<len(COL) else c} {n}' for c,n in Counter(b[3] for b in B).most_common()))
    lay = defaultdict(dict)
    for x,z,k,c in B: lay[k][(x,z)] = c
    for k in sorted(lay):
        print(f'\n층 {k} (블록 {len(lay[k])}개)  — 위가 북쪽(−z), 오른쪽이 동쪽(+x). 글자: 크림 W·나무 N·돌 S·빨강 R·초록 G·파랑 B')
        for z in range(z0, z1+1):
            print('  ' + ''.join('WNSRGB'[lay[k][(x,z)]] if (x,z) in lay[k] else '·' for x in range(x0, x1+1)))
    try:
        from PIL import Image, ImageDraw
        cs = max(6, min(22, 520 // max(1, max(x1-x0+1, z1-z0+1))))
        W, H = (x1-x0+1)*cs + 20, (z1-z0+1)*cs + 34
        n = len(lay); cols = min(n, 4); rows = (n+cols-1)//cols
        img = Image.new('RGB', (cols*W, rows*H), (250,246,238)); d = ImageDraw.Draw(img)
        for i,k in enumerate(sorted(lay)):
            ox, oy = (i%cols)*W+10, (i//cols)*H+24
            d.text((ox, oy-18), f'layer {k}  ({len(lay[k])})', fill=(91,61,43))
            for z in range(z0, z1+1):
                for x in range(x0, x1+1):
                    r = [ox+(x-x0)*cs, oy+(z-z0)*cs, ox+(x-x0+1)*cs-1, oy+(z-z0+1)*cs-1]
                    c = lay[k].get((x,z))
                    d.rectangle(r, fill=COL[c][:3] if c is not None else (236,230,218), outline=(200,190,175))
        os.makedirs(OUT, exist_ok=True); img.save(os.path.join(OUT, 'cre_layers.png')); print('\n그림:', os.path.join(OUT, 'cre_layers.png'))
    except Exception as e: print('층 그림 실패', e)
    try:
        import numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
        nx, nz, nk = x1-x0+1, z1-z0+1, k1-k0+1
        filled = np.zeros((nx, nz, nk), bool); fc = np.empty((nx, nz, nk), object)
        for x,z,k,c in B:
            filled[x-x0, z1-z, k-k0] = True; fc[x-x0, z1-z, k-k0] = '#%02x%02x%02x' % COL[c][:3]
        fig = plt.figure(figsize=(7,6)); ax = fig.add_subplot(projection='3d')
        ax.voxels(filled, facecolors=fc, edgecolor=(0.2,0.15,0.1,0.35))
        ax.set_box_aspect((nx, nz, nk)); ax.view_init(elev=35, azim=-60); ax.set_xlabel('x(동)'); ax.set_ylabel('남→북'); ax.set_zlabel('층')
        fig.savefig(os.path.join(OUT, 'cre_iso.png'), dpi=110, bbox_inches='tight'); print('그림:', os.path.join(OUT, 'cre_iso.png'))
    except Exception as e: print('입체 그림 실패', e)

if __name__ == '__main__': main()
