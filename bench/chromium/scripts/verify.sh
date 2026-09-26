#!/usr/bin/env bash
# Confirms the instrumentation is enabled only in out/InfernoProf.
source "$(dirname "$0")/common.sh"
cd "$CHROMIUM_SRC"
fail=0
for dir in out/*/; do
  dir="${dir%/}"
  [[ -f "$dir/args.gn" ]] || continue
  value="$(gn args "$dir" --list=inferno_bench --short 2>/dev/null | sed -E 's/.*= *//' || true)"
  header="$(cat "$dir/gen/inferno_bench/enabled.h" 2>/dev/null || echo '(not generated yet)')"
  printf '%-40s inferno_bench=%-6s %s\n' "$dir" "${value:-?}" "$header"
  if [[ "$dir" != "$OUT_DIR" && "$header" == *"ENABLED 1"* ]]; then
    echo "FAIL $dir has the instrumentation enabled"
    fail=1
  fi
done
if [[ -d out/AutoExplore ]]; then
  echo "AutoExplore would rebuild (dry run):"
  ninja -C out/AutoExplore -n chrome 2>/dev/null | grep -E '^\[' | sed -E 's/^\[[0-9/]+\] //' | head -10 || true
fi
exit $fail
