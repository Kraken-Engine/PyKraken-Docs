#!/usr/bin/env python3
"""Inspect PyKraken API data with Griffe.

This is a small migration probe for replacing the custom AST parsing in
generate_api_docs.py. It reads the installed package and prints a compact view
of the object tree without writing generated docs.
"""

from __future__ import annotations

import argparse
from collections.abc import Iterable

from griffe import Class, Module, load


def iter_classes(module: Module | Class) -> Iterable[Class]:
    for member in module.members.values():
        if isinstance(member, Class):
            yield member
            yield from iter_classes(member)
        elif isinstance(member, Module):
            yield from iter_classes(member)


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect PyKraken with Griffe.")
    parser.add_argument("--package", default="pykraken")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    package = load(args.package)
    classes = list(iter_classes(package))

    print(f"Loaded {args.package}")
    print(f"Found {len(classes)} class-like object(s)")
    for cls in classes[: args.limit]:
        print(f"- {cls.path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
