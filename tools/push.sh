#!/usr/bin/env bash
# GitHub에 올리기 (AGENTS.md §0-1): 커밋한 뒤 실행해요. 최신 위에 내 커밋을 얹고 → 문법 검사 → push. 강제 push는 하지 않아요.
#   git add … && git commit … && bash tools/push.sh
cd "$(dirname "$0")/.." || exit 1
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ 커밋하지 않은 변경이 있어요. 먼저 커밋하거나 정리하세요:"; git status -s; exit 1
fi
git fetch origin || { echo "❌ GitHub에서 받아오지 못했어요"; exit 1; }
if ! git rebase origin/main; then
  echo "❌ 다른 클로드가 먼저 올린 것과 같은 줄을 고쳐서 충돌했어요."
  echo "   충돌 난 파일: $(git diff --name-only --diff-filter=U | tr '\n' ' ')"
  echo "   두 쪽 내용을 모두 살려서 고친 뒤: git add <파일> → git rebase --continue → 검사 다시 → bash tools/push.sh"
  echo "   (모르겠으면 git rebase --abort 로 되돌리고 기획자에게 알려요)"; exit 1
fi
bad=0
for f in js/*.js server/*.js; do
  case "$f" in js/three.min.js|js/GLTFLoader.js|js/SkeletonUtils.js) continue;; esac
  node --check "$f" 2>/dev/null || { echo "❌ 문법 오류: $f"; node --check "$f"; bad=1; }
done
[ $bad = 0 ] || { echo "문법 오류를 고친 뒤 다시 실행하세요(아직 안 올렸어요)"; exit 1; }
n=$(git rev-list --count origin/main..HEAD)
[ "$n" = 0 ] && { echo "올릴 커밋이 없어요(이미 최신)"; exit 0; }
git -c push.negotiate=true push origin HEAD:main || git push origin HEAD:main || { echo "❌ push 실패. 다시 bash tools/push.sh (강제 push 금지)"; exit 1; }
echo "✅ ${n}개 올렸어요: $(git log --oneline -1)"
echo "   게임 링크에도 올릴 거면: python3 tools/artifact_diff.py <list_files 결과 JSON> (AGENTS.md §0-1 ⑤)"
