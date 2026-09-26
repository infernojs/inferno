#!/usr/bin/env bash
# Installs //inferno_bench and applies the patch series (idempotent).
# Everything stays compiled out unless an out dir sets inferno_bench = true.
source "$(dirname "$0")/common.sh"
mkdir -p "$CHROMIUM_SRC/inferno_bench"
for f in "$BENCH_CHROMIUM_DIR"/files/inferno_bench/*; do
  cmp -s "$f" "$CHROMIUM_SRC/inferno_bench/$(basename "$f")" || cp "$f" "$CHROMIUM_SRC/inferno_bench/"
done
echo "files     //inferno_bench installed"
while read -r repo patch; do
  case "$(patch_state "$repo" "$patch")" in
    applied) echo "patch     $patch: already applied" ;;
    unapplied) git -C "$CHROMIUM_SRC/$repo" apply "$BENCH_CHROMIUM_DIR/patches/$patch" && echo "patch     $patch: applied" ;;
    *) die "$patch does not apply to $repo (conflict); nothing further applied" ;;
  esac
done < <(series)
