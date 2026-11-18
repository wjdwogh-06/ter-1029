# 게임 링크(artifact)에 올릴 파일 고르기 (AGENTS.md §0-1 ⑤)
# 내가 고친 파일만 올리면, 다른 클로드가 고친 파일이 링크에 빠지거나 옛것으로 덮일 수 있어요.
# 그래서 '지금 링크에 있는 것'과 '저장소 최신'을 비교해서 다른 파일을 전부 올려요.
#
# 1) Artifact list_files(slug) 결과를 그대로 파일로 저장 (예: /tmp/live.json)
# 2) python3 tools/artifact_diff.py /tmp/live.json
# 3) 출력된 files 목록을 publish_files에 그대로 넘겨요(base_version = list_files의 version)
import hashlib, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
git = lambda *a: subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout.strip()

if len(sys.argv) < 2:
    sys.exit('사용: python3 tools/artifact_diff.py <list_files 결과 JSON 파일>')
d = json.load(open(sys.argv[1]))
live = {f['path']: f.get('sha256') for f in (d.get('files', d) if isinstance(d, dict) else d)}

# 안전 확인: 저장소가 GitHub 최신과 같아야 해요(옛 파일로 링크를 덮지 않게)
git('fetch', 'origin')
dirty = git('status', '--porcelain', '--', 'index.html', 'js', 'assets')
behind = git('rev-list', '--count', 'HEAD..origin/main')
if dirty or behind not in ('', '0'):
    print('❌ 아직 올리면 안 돼요:', '커밋 안 한 변경 있음' if dirty else '', f'GitHub보다 {behind}개 뒤처짐' if behind not in ('', '0') else '')
    print('   bash tools/start.sh (또는 커밋 → bash tools/push.sh) 먼저 하세요')
    sys.exit(1)

served = [p for p in git('ls-files', 'index.html', 'js', 'assets').split('\n') if p and not p.endswith('README.md')]
sha = lambda p: hashlib.sha256(open(os.path.join(ROOT, p), 'rb').read()).hexdigest()
changed = [p for p in served if p in live and live[p] and live[p] != sha(p)]
new = [p for p in served if p not in live]
gone = [p for p in live if p not in served]
print('링크 버전:', d.get('version', '?'), '· 저장소 커밋:', git('rev-parse', '--short', 'HEAD'))
print('바뀐 파일 (올려야 해요):', changed or '없음')
if new: print('링크에 없는 새 파일 (index.html이 읽는 것이면 올려요):', new)
if gone: print('저장소에는 없고 링크에만 있는 파일 (지우려면 remove에):', gone)
up = changed + new
if up:
    print('\npublish_files의 files:')
    print(json.dumps([{'as': p, 'path': os.path.join(ROOT, p)} for p in up], ensure_ascii=False))
else:
    print('\n링크가 이미 저장소 최신과 같아요. 올릴 것 없음')
