#!/usr/bin/env bash
# Fetch OpenAI Whisper "small" (CTranslate2 int8, MIT) from npm and assemble it for faster-whisper.
# Hugging Face is not reachable from this environment, npm is. Packages are only unpacked, never run.
#   tools/get_whisper_model.sh [target_dir]   (default: models/whisper-small, git-ignored)
set -euo pipefail
dest="${1:-$(dirname "$0")/../models/whisper-small}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$dest"
for i in 0 1 2 3; do
  (cd "$tmp" && npm pack "@skillninja/shortmovie-telop-model-p$i@1.0.0" --ignore-scripts -s >/dev/null)
  mkdir -p "$tmp/p$i" && tar xzf "$tmp"/skillninja-shortmovie-telop-model-p$i-1.0.0.tgz -C "$tmp/p$i"
done
cp "$tmp"/p0/package/{config.json,tokenizer.json,vocabulary.json,preprocessor_config.json} "$dest"/
cat "$tmp"/p0/package/model.bin.part0 "$tmp"/p1/package/model.bin.part1 \
    "$tmp"/p2/package/model.bin.part2 "$tmp"/p3/package/model.bin.part3 > "$dest/model.bin"
echo "$(cat "$tmp"/p0/package/model.sha256)  $dest/model.bin" | sha256sum -c -
pip install -q faster-whisper
