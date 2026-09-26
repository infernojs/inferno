#!/usr/bin/env bash
# Read-only checks before applying patches or building out/InfernoProf.
source "$(dirname "$0")/common.sh"
ok=1
version="$(chromium_version)"
if [[ "$version" != "$EXPECTED_VERSION" ]]; then
  echo "WARN version $version (patches were made against $EXPECTED_VERSION)"
fi
echo "v8        $(git -C "$CHROMIUM_SRC/v8" rev-parse --short HEAD)"
echo "perfetto  $(git -C "$CHROMIUM_SRC/third_party/perfetto" rev-parse --short HEAD)"
while read -r repo patch; do
  state="$(patch_state "$repo" "$patch")"
  echo "patch     $patch: $state"
  [[ "$state" == conflict ]] && ok=0
done < <(series)
free_gb=$(( $(df --output=avail -k "$CHROMIUM_SRC" | tail -1) / 1024 / 1024 ))
echo "disk      ${free_gb} GiB free"
if (( free_gb < 120 )); then
  echo "FAIL      an InfernoProf build needs ~120 GiB"
  ok=0
fi
if pgrep -x ninja >/dev/null || pgrep -x siso >/dev/null || pgrep -x autoninja >/dev/null; then
  echo "FAIL      a ninja/siso build is running in some out dir"
  ok=0
fi
if [[ -x "$CHROMIUM_SRC/out/AutoExplore/chrome" ]]; then
  echo "autoexp   chrome sha256 $(sha256sum "$CHROMIUM_SRC/out/AutoExplore/chrome" | cut -c1-16)…"
fi
(( ok )) && echo "preflight ok" || { echo "preflight FAILED"; exit 1; }
