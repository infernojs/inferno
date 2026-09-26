#!/usr/bin/env bash
# Shows the state of every Inferno bench change in the Chromium checkout.
source "$(dirname "$0")/common.sh"
echo "chromium   $CHROMIUM_SRC ($(chromium_version))"
echo "files      //inferno_bench: $(files_state)"
while read -r repo patch; do
  printf 'patch      %-22s %-48s %s\n' "$repo" "$patch" "$(patch_state "$repo" "$patch")"
done < <(series)
if [[ -f "$CHROMIUM_SRC/$OUT_DIR/args.gn" ]]; then
  echo "out dir    $OUT_DIR exists$( [[ -x "$CHROMIUM_SRC/$OUT_DIR/chrome" ]] && echo ', chrome built')"
else
  echo "out dir    $OUT_DIR not created"
fi
