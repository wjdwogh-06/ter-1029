#!/usr/bin/env bash
# 작업 시작 전에 매번 실행해요 (AGENTS.md §0-1): 최신 받기 → 작업판 → 최근에 올라온 것
#   bash tools/start.sh
cd "$(dirname "$0")/.." || exit 1
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠ 아직 커밋하지 않은 변경이 있어요(잠깐 치워 두고 최신을 받은 뒤 다시 얹어요):"; git status -s
fi
git fetch origin --prune || { echo "❌ GitHub에서 받아오지 못했어요. 연결을 확인하세요"; exit 1; }
if ! git pull --rebase --autostash origin main; then
  echo "❌ 최신을 얹다가 충돌했어요. 두 쪽 내용을 모두 살려서 고친 뒤: git add <파일> → git rebase --continue"; exit 1
fi
echo; echo "=== 작업판 (WORKBOARD.md) — 다른 클로드가 지금 하는 일"; sed -n '/^## 지금 하는 일/,$p' WORKBOARD.md | grep -v '^<!--'
echo; echo "=== 최근 올라온 것"; git log --oneline -8 --format='%h %ad %s' --date=format:'%m-%d %H:%M'
echo; echo "다음: 작업판 '지금 하는 일'에 내 줄을 적고 '다음 차수 번호'를 하나 올린 뒤 바로 커밋 → bash tools/push.sh"
