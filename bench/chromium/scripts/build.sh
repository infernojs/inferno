#!/usr/bin/env bash
# Configures and builds out/InfernoProf (chrome + d8) at the lowest CPU priority.
source "$(dirname "$0")/common.sh"
[[ "$(files_state)" == installed ]] || die "//inferno_bench not installed: run apply first"
while read -r repo patch; do
  [[ "$(patch_state "$repo" "$patch")" == applied ]] || die "$patch not applied: run apply first"
done < <(series)
cd "$CHROMIUM_SRC"
mkdir -p "$OUT_DIR"
cp "$BENCH_CHROMIUM_DIR/args/InfernoProf.gn" "$OUT_DIR/args.gn"
gn gen "$OUT_DIR" --fail-on-unused-args
grep -q 'INFERNO_BENCH_ENABLED 1' "$OUT_DIR/gen/inferno_bench/enabled.h" || die "inferno_bench not enabled in $OUT_DIR"
start=$(date +%s)
nice -n 19 autoninja -C "$OUT_DIR" chrome d8 "$@"
{
  echo "{"
  echo "  \"builtAt\": \"$(date -Iseconds)\","
  echo "  \"buildSeconds\": $(( $(date +%s) - start )),"
  echo "  \"chromium\": \"$(chromium_version)\","
  echo "  \"src\": \"$(git rev-parse HEAD)\","
  echo "  \"v8\": \"$(git -C v8 rev-parse HEAD)\","
  echo "  \"perfetto\": \"$(git -C third_party/perfetto rev-parse HEAD)\","
  echo "  \"patches\": \"$(cat "$BENCH_CHROMIUM_DIR"/patches/*/*.patch "$BENCH_CHROMIUM_DIR"/files/inferno_bench/* | sha256sum | cut -c1-16)\","
  echo "  \"args\": \"$(sha256sum "$OUT_DIR/args.gn" | cut -c1-16)\""
  echo "}"
} > "$OUT_DIR/inferno_bench_stamp.json"
echo "built $OUT_DIR ($(( ($(date +%s) - start) / 60 )) min); stamp: $OUT_DIR/inferno_bench_stamp.json"
