#!/usr/bin/env python3
"""
Sync CHANGELOG.md from the PyKraken GitHub repo into docs.

Usage:
  python scripts/sync_changelog.py [--branch BRANCH]
"""

from __future__ import annotations

import argparse
from pathlib import Path
from urllib.request import urlopen
import re

MAX_VERSIONS = 10

REMOVE_LINES = {
    "# Changelog",
    "All notable changes to this project will be documented in this file.",
}


def fetch_changelog(branch: str) -> str:
    url = f"https://raw.githubusercontent.com/Kraken-Engine/PyKraken/{branch}/CHANGELOG.md"
    with urlopen(url) as resp:
        data = resp.read()
    return data.decode("utf-8")


def normalize_changelog(content: str) -> str:
    lines = [line.rstrip() for line in content.splitlines()]

    # Remove boilerplate lines
    lines = [line for line in lines if line.strip() not in REMOVE_LINES]

    # Limit to last N version sections (## headings)
    if MAX_VERSIONS > 0:
        version_indices = [i for i, line in enumerate(lines) if line.startswith("## ")]
        if len(version_indices) > MAX_VERSIONS:
            cutoff_index = version_indices[MAX_VERSIONS]
            lines = lines[:cutoff_index]

    # Trim leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    # Insert separators between version sections and add unique anchors
    separated = []
    current_version_slug = ""
    version_re = re.compile(r"^##\s+\[?([^\]\s]+)")
    heading_re = re.compile(r"^(#{3,6})\s+(.+)")

    for line in lines:
        if line.startswith("## "):
            separated.append("")
            separated.append("---")
            separated.append("")
            match = version_re.match(line)
            if match:
                raw_version = match.group(1)
                current_version_slug = re.sub(r"[^a-zA-Z0-9]", "", raw_version).lower()
            else:
                current_version_slug = ""

        heading_match = heading_re.match(line)
        if heading_match and current_version_slug:
            heading_text = heading_match.group(2)
            heading_slug = re.sub(r"[^a-zA-Z0-9]", "", heading_text).lower()
            if heading_slug:
                separated.append(f"<a id=\"{heading_slug}{current_version_slug}\"></a>")

        separated.append(line)

    lines = separated

    return "\n".join(lines).strip() + "\n"


def write_changelog(target: Path, content: str) -> None:
    frontmatter = """---
title: Changelog
description: Release notes for PyKraken.
---
"""
    body = normalize_changelog(content)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(frontmatter + "\n" + body, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync CHANGELOG.md from PyKraken.")
    parser.add_argument("--branch", default="dev", help="Branch to sync from (default: dev)")
    args = parser.parse_args()

    content = fetch_changelog(args.branch)
    target = Path("contents") / "docs" / "manual" / "changelog" / "index.mdx"
    write_changelog(target, content)
    print(f"Wrote changelog to {target} (from branch: {args.branch})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
