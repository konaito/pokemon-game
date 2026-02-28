#!/bin/bash
# Monster Chronicle PV レンダリングスクリプト
set -e

echo "=== Monster Chronicle PV Renderer ==="
echo ""

# 出力ディレクトリ作成
mkdir -p output

# プレビュー or レンダリング
case "${1:-preview}" in
  preview|studio)
    echo ">>> Remotion Studio を起動..."
    bunx remotion studio src/index.ts
    ;;
  render)
    echo ">>> MP4 レンダリング開始 (1920x1080, 30fps, 90秒)..."
    bunx remotion render src/index.ts PV output/monster-chronicle-pv.mp4
    echo ""
    echo ">>> 完了: output/monster-chronicle-pv.mp4"
    ;;
  *)
    echo "使い方:"
    echo "  ./render.sh preview  — Remotion Studio でプレビュー"
    echo "  ./render.sh render   — MP4 にレンダリング"
    ;;
esac
