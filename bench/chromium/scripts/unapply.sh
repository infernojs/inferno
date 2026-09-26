#!/usr/bin/env bash
# Reverts the patch series and removes //inferno_bench.
source "$(dirname "$0")/common.sh"
while read -r repo patch; do
  if [[ "$(patch_state "$repo" "$patch")" == applied ]]; then
    git -C "$CHROMIUM_SRC/$repo" apply -R "$BENCH_CHROMIUM_DIR/patches/$patch"
    echo "patch     $patch: reverted"
  else
    echo "patch     $patch: not applied"
  fi
done < <(series)
for f in "$BENCH_CHROMIUM_DIR"/files/inferno_bench/*; do
  rm -f "$CHROMIUM_SRC/inferno_bench/$(basename "$f")"
done
rmdir "$CHROMIUM_SRC/inferno_bench" 2>/dev/null || true
echo "files     //inferno_bench removed"
