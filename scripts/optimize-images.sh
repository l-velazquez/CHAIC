#!/usr/bin/env bash
# Resize .webp images to ~2x their max CSS display size and re-encode.
# Idempotent: files already at or below target are left alone.
# Usage: ./scripts/optimize-images.sh
#
# Targets are picked so portraits stay sharp on HiDPI displays after the
# CSS object-fit:cover crop, and so logos render crisply at their CSS
# max-height (or sponsor-card bounding box).

set -euo pipefail

cd "$(dirname "$0")/.."

CWEBP="${CWEBP:-/usr/local/bin/cwebp}"
QUALITY="${QUALITY:-80}"

# file|mode|W|H
#   cover   -> image must fully cover WxH after object-fit:cover
#   contain -> image must fit inside WxH bounding box
TABLE=$(cat <<'EOF'
images/logos/CHAIC-Logo.webp|cover|100|100
images/logos/chaic-icon-3.webp|cover|88|88
images/logos/AMRC.webp|cover|168|168
images/logos/pr-usa-chamber-of-commerce.webp|cover|156|156
images/logos/puerto-rico-ai-institute-and-consortium.webp|cover|120|120
images/logos/RCM-UPR-Logo.webp|contain|420|156
images/logos/SPE-White-Letters.webp|contain|420|156
images/logos/ABAIM-logo-transparent.webp|contain|420|156
images/people/DrOrvil-profile-small.webp|cover|68|68
images/people/yasmin-pedrogo-profile.webp|cover|68|68
images/people/arlen-meyers.webp|cover|440|550
images/people/dr-abiel-roche-lima.webp|cover|440|550
images/people/dr-ana-lucumi.webp|cover|440|550
images/people/dr-anthony-chang.webp|cover|440|550
images/people/dr-carlos-ortiz.webp|cover|440|550
images/people/dr-cesar-de-la-fuente.webp|cover|440|550
images/people/dr-felix-rivera.webp|cover|440|550
images/people/dr-herman-taylor.webp|cover|440|550
images/people/dr-humberto-cruz-esparra.webp|cover|440|550
images/people/dr-jamboor-vishwanatha.webp|cover|440|550
images/people/DrOrvil-profile.webp|cover|440|550
images/people/erick-brieva.webp|cover|440|550
images/people/mariano-de-socarraz.webp|cover|440|550
images/people/yasmin-pedrogo.webp|cover|440|550
EOF
)

total_before=0
total_after=0

while IFS='|' read -r file mode tw th; do
  [[ -z "${file:-}" || "$file" == \#* ]] && continue
  if [[ ! -f "$file" ]]; then
    printf "skip   %-60s (missing)\n" "$file"
    continue
  fi

  read -r cur_w cur_h < <(
    sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null \
      | awk '/pixelWidth/ {w=$2} /pixelHeight/ {h=$2} END {print w, h}'
  )

  read -r nw nh < <(
    awk -v cw="$cur_w" -v ch="$cur_h" -v tw="$tw" -v th="$th" -v mode="$mode" 'BEGIN {
      sw = tw / cw; sh = th / ch
      if (mode == "cover") s = (sw > sh) ? sw : sh
      else                  s = (sw < sh) ? sw : sh
      if (s >= 1) { print cw, ch }
      else        { printf "%d %d\n", int(cw * s + 0.5), int(ch * s + 0.5) }
    }'
  )

  before=$(stat -f%z "$file")
  total_before=$((total_before + before))

  if [[ "$nw" -ge "$cur_w" && "$nh" -ge "$cur_h" ]]; then
    printf "keep   %-60s %sx%s  %sB (at/below target)\n" "$file" "$cur_w" "$cur_h" "$before"
    total_after=$((total_after + before))
    continue
  fi

  tmp="${file}.tmp.webp"
  "$CWEBP" -q "$QUALITY" -m 6 -resize "$nw" "$nh" "$file" -o "$tmp" >/dev/null 2>&1
  mv "$tmp" "$file"
  after=$(stat -f%z "$file")
  total_after=$((total_after + after))
  saved=$((before - after))
  printf "resize %-60s %sx%s -> %sx%s  %sB -> %sB  saved %sB\n" \
    "$file" "$cur_w" "$cur_h" "$nw" "$nh" "$before" "$after" "$saved"
done <<< "$TABLE"

printf "\nTotal: %sB -> %sB  saved %sB\n" \
  "$total_before" "$total_after" "$((total_before - total_after))"
