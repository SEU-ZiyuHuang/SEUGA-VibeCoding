#!/bin/sh
# Reproducible build: curated content -> release pages -> entry files.
set -e
d=$(cd "$(dirname "$0")" && pwd)
rm -rf "$d/../seu-campus-guide" "$d/source-decisions.json" "$d/original-new-sections.json" "$d/../来源与更新对照表.md"
python3 "$d/curate_content.py"
python3 "$d/build_release.py"
python3 "$d/build_entry.py"
# Sync/Finder can leave empty "references 2"-style conflict copies behind a delete+recreate.
find "$d/../seu-campus-guide" -type d -empty -delete
python3 "$HOME/.claude/skills/skill-creator/scripts/quick_validate.py" "$d/../seu-campus-guide"
