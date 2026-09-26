# Shared helpers for bench/chromium scripts. Sourced, not executed.
set -euo pipefail

BENCH_CHROMIUM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROMIUM_SRC="${CHROMIUM_SRC:-$HOME/chromium/src}"
OUT_DIR="${INFERNO_PROF_OUT:-out/InfernoProf}"
EXPECTED_VERSION="152.0.7977.119"

die() { echo "error: $*" >&2; exit 1; }

chromium_version() {
  # shellcheck disable=SC1091
  (source "$CHROMIUM_SRC/chrome/VERSION" && echo "$MAJOR.$MINOR.$BUILD.$PATCH")
}

# Emits "repo patch" pairs from the series file.
series() {
  grep -v '^\s*#' "$BENCH_CHROMIUM_DIR/patches/series" | awk 'NF == 2 { print $1, $2 }'
}

# applied | unapplied | conflict
patch_state() {
  local repo="$1" patch="$2"
  if git -C "$CHROMIUM_SRC/$repo" apply -R --check "$BENCH_CHROMIUM_DIR/patches/$patch" 2>/dev/null; then
    echo applied
  elif git -C "$CHROMIUM_SRC/$repo" apply --check "$BENCH_CHROMIUM_DIR/patches/$patch" 2>/dev/null; then
    echo unapplied
  else
    echo conflict
  fi
}

# installed | missing | differs
files_state() {
  local state=installed
  for f in "$BENCH_CHROMIUM_DIR"/files/inferno_bench/*; do
    local target="$CHROMIUM_SRC/inferno_bench/$(basename "$f")"
    if [[ ! -f "$target" ]]; then
      state=missing
    elif ! cmp -s "$f" "$target"; then
      [[ "$state" == installed ]] && state=differs
    fi
  done
  echo "$state"
}
