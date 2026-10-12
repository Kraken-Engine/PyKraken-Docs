"""Extract the live Python API and Doxygen C++ XML into presentation-free JSON.

Only src/data/api.json is replaced, atomically, after both extractions validate.
No engine functions are called and no guides are written.
"""
from __future__ import annotations

import argparse
import enum
import hashlib
import importlib
import importlib.metadata
import inspect
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_SPECIAL_METHODS = {"__init__"}


def slug(text):
    # Keep class and namespace names distinct (Camera versus camera).
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", text).strip("-") or "core"


def clean(text):
    text = (text or "").replace("pykraken._pykraken.", "").replace("pykraken.", "")
    text = re.sub(r"\b(?:collections\.abc|typing(?:_extensions)?|builtins|os|pathlib|numpy(?:\.typing)?)\.([A-Za-z_]\w*)", r"\1", text)
    return re.sub(r" at 0x[0-9a-fA-F]+", "", text)


def function_docs(obj, name):
    """Preserve complete native signatures, including all nanobind overloads."""
    doc = clean(inspect.getdoc(obj) or "")
    lines = doc.splitlines()
    signatures = []
    while lines and (re.match(r"^(?:[\w.]+)?\(.*", lines[0]) or not lines[0].strip()):
        line = lines.pop(0).strip()
        if line:
            signatures.append(name + line if line.startswith("(") else line)
    if not signatures:
        try:
            signatures = [name + clean(str(inspect.signature(obj)))]
        except (ValueError, TypeError):
            signatures = [name + "(…) — signature unavailable"]
    return list(dict.fromkeys(signatures)), "\n".join(lines).strip()


def python_pages(module_name):
    root = importlib.import_module(module_name)
    pages, visited = [], set()

    def visit(obj, path, kind):
        if id(obj) in visited:
            return
        visited.add(id(obj))
        title = path.removeprefix(module_name + ".") if path != module_name else "core"
        page = {"language": "python", "slug": ("" if kind == "module" else "type-") + slug(title).lower(), "name": title,
                "qualified": path, "kind": kind, "doc": clean(inspect.getdoc(obj) or ""), "members": []}
        if kind == "module" and obj is root:
            page["doc"] = "Initialize and shut down the engine."
        is_enum = inspect.isclass(obj) and issubclass(obj, enum.Enum)
        if is_enum:
            page["kind"] = "enum"
            if page["doc"] == "An enumeration.":
                page["doc"] = ""
            for name, value in obj.__members__.items():
                page["members"].append({"name": name, "id": slug(name), "kind": "value", "signatures": [f"{name} = {value.value!r}"], "doc": ""})
        else:
            # Include public inherited API while excluding object/enum scaffolding.
            names = set(vars(obj))
            if inspect.isclass(obj):
                for base in obj.__mro__[1:]:
                    if base.__module__.startswith(module_name):
                        names.update(vars(base))
                page["bases"] = [clean(b.__name__) for b in obj.__bases__ if b.__name__ not in {"object", "nb_object"}]
            for name in sorted(names):
                if name.startswith("_") and (kind == "module" or name not in PUBLIC_SPECIAL_METHODS):
                    continue
                value = getattr(obj, name)
                if inspect.ismodule(value):
                    if value.__name__.startswith(module_name):
                        visit(value, path + "." + name, "module")
                    continue
                if inspect.isclass(value):
                    if value.__module__.startswith(module_name):
                        visit(value, path + "." + name, "class")
                    continue
                member = {"name": name, "id": slug(name), "kind": "function" if kind == "module" else "method", "signatures": [], "doc": ""}
                if callable(value):
                    member["signatures"], member["doc"] = function_docs(value, name)
                elif isinstance(value, property) or inspect.isdatadescriptor(value):
                    member.update(kind="property", doc=clean(inspect.getdoc(value) or ""), signatures=[name])
                    getter = getattr(value, "fget", None)
                    if getter and inspect.getdoc(getter):
                        sigs, getter_doc = function_docs(getter, name)
                        member["signatures"] = [name + ": " + s.split(" -> ", 1)[1] if " -> " in s else name for s in sigs]
                        member["doc"] = getter_doc
                elif isinstance(value, (int, float, str, bool, enum.Enum)) or value is None:
                    rendered = f"{type(value).__name__}.{value.name}" if isinstance(value, enum.Enum) else repr(value)
                    member.update(kind="constant", signatures=[f"{name} = {rendered}"])
                elif type(value).__module__.startswith(module_name):
                    member.update(kind="constant", signatures=[f"{name}: {clean(type(value).__qualname__)} = {clean(repr(value))}"])
                else:
                    continue
                if member['kind'] != 'constant':
                    page["members"].append(member)
        def rank(member):
            if member['name'] == '__init__': return 0
            if member['kind'] == 'property': return 1
            if member['kind'] in {'method', 'function'} and not member['name'].startswith('__'): return 2
            if member['kind'] in {'method', 'function'}: return 3
            return 4
        page['members'].sort(key=rank)
        pages.append(page)

    visit(root, module_name, "module")
    return pages, str(Path(root.__file__).resolve())


def xml_text(node):
    return "" if node is None else "".join(node.itertext()).strip()


def xml_doc(node):
    if node is None:
        return ""
    def render(el):
        body = (el.text or "") + "".join(render(c) + (c.tail or "") for c in el)
        if el.tag in {"computeroutput", "ref"}:
            return "`" + body.strip() + "`"
        if el.tag == "para":
            return body.strip() + "\n\n"
        if el.tag == "listitem":
            return "- " + body.strip() + "\n"
        if el.tag == "parameteritem":
            return body.strip() + "\n\n"
        if el.tag == "parametername":
            return "**" + body + "**: "
        if el.tag == "simplesect":
            return "**" + el.get("kind", "Note").capitalize() + ":** " + body
        return body
    return render(node).strip()


def cpp_pages(xml_dir):
    pages = []
    index = ET.parse(xml_dir / "index.xml").getroot()
    for entry in index.findall("compound"):
        full = entry.findtext("name", "")
        if entry.get("kind") not in {"class", "struct", "namespace"} or not (full == "kn" or full.startswith("kn::")):
            continue
        if any(p.startswith("_") or p == "detail" for p in full.split("::")):
            continue
        compound = ET.parse(xml_dir / (entry.get("refid") + ".xml")).getroot().find("compounddef")
        if compound.get("prot", "public") != "public":
            continue
        name = full.removeprefix("kn::") if full != "kn" else "core"
        page = {"language": "cpp", "slug": ("" if entry.get("kind") == "namespace" else "type-") + slug(name).lower(), "name": name, "qualified": full,
                "kind": "module" if entry.get("kind") == "namespace" else entry.get("kind"),
                "doc": "\n\n".join(filter(None, [xml_doc(compound.find("briefdescription")), xml_doc(compound.find("detaileddescription"))])), "members": []}
        loc = compound.find("location")
        if loc is not None:
            page["source"] = loc.get("file", "").replace("\\", "/").split("/include/")[-1]
        page["bases"] = [xml_text(b) for b in compound.findall("basecompoundref") if b.get("prot") == "public"]
        groups = {}
        for member in compound.findall("sectiondef/memberdef"):
            mname = member.findtext("name", "")
            if not mname or mname.startswith("_") or member.get("prot", "public") != "public":
                continue
            mkind = member.get("kind")
            mtype = xml_text(member.find("type"))
            if mkind == "variable" and (member.get("constexpr") == "yes" or re.search(r"\b(?:const|constexpr)\b", mtype)):
                # Retain names for example validation, outside rendered API members.
                page.setdefault("omittedConstants", []).append(mname)
                continue
            group = groups.setdefault((mname, mkind), {"name": mname, "id": "m-" + hashlib.sha1((mname + mkind).encode()).hexdigest()[:10], "kind": mkind, "signatures": [], "doc": ""})
            mtype = xml_text(member.find("type"))
            args = xml_text(member.find("argsstring"))
            signature = " ".join(filter(None, [mtype, mname])) + args
            if member.get("static") == "yes":
                signature = "static " + signature
            template = member.find("templateparamlist")
            if template is not None:
                params = [" ".join(filter(None, [xml_text(p.find("type")), p.findtext("declname", "")])) + (" = " + xml_text(p.find("defval")) if p.find("defval") is not None else "") for p in template.findall("param")]
                signature = "template <" + ", ".join(params) + ">\n" + signature
            if mkind == "enum":
                signature = "enum " + mname + (" : " + mtype if mtype else "")
                group["values"] = [{"name": v.findtext("name"), "value": xml_text(v.find("initializer")), "doc": xml_doc(v.find("briefdescription"))} for v in member.findall("enumvalue")]
                enum_name = (name + "::" if name != "core" else "") + mname
                pages.append({"language":"cpp", "slug":"type-" + slug(enum_name).lower(), "name":enum_name,
                    "qualified": full + "::" + mname, "kind":"enum", "doc":xml_doc(member.find("briefdescription")),
                    "members":[{"name":v["name"], "id":slug(v["name"]), "kind":"value", "signatures":[v["name"] + (" " + v["value"] if v["value"] else "")], "doc":v["doc"]} for v in group["values"]]})
            if mkind in {"variable", "typedef"}:
                signature += " " + xml_text(member.find("initializer"))
            if signature not in group["signatures"]:
                group["signatures"].append(signature.strip())
            desc = "\n\n".join(filter(None, [xml_doc(member.find("briefdescription")), xml_doc(member.find("detaileddescription"))]))
            if desc and desc not in group["doc"]:
                group["doc"] += ("\n\n" if group["doc"] else "") + desc
        page["members"] = [g for g in groups.values() if not (name == 'core' and g['kind'] == 'enum')]
        pages.append(page)
    return pages


def validate(pages):
    paths = set()
    for page in pages:
        path = (page["language"], page["slug"].casefold())
        if path in paths:
            raise ValueError(f"Duplicate API route: {path}")
        paths.add(path)
        ids = [m["id"] for m in page["members"]]
        if len(ids) != len(set(ids)):
            raise ValueError(f"Duplicate member anchor: {path}")
        for member in page["members"]:
            if not member["signatures"]:
                raise ValueError(f"Missing signature: {path}/{member['name']}")
    for language in {"python", "cpp"}:
        for expected in {"core", "window", "type-vec2", "renderer"}:
            if (language, expected) not in paths:
                raise ValueError(f"Missing required API page: {language}/{expected}")


def main():
    config = json.loads((ROOT / "api.config.json").read_text(encoding="utf-8-sig"))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default=os.environ.get("KRAKEN_ENGINE_SOURCE", config["engineSource"]))
    parser.add_argument("--doxygen", default="doxygen")
    args = parser.parse_args()
    source = Path(args.source).resolve()
    if not (source / "include/kraken/KrakenEngine.hpp").exists():
        raise SystemExit(f"Engine headers not found at {source}")
    py, module_path = python_pages(config["pythonModule"])
    with tempfile.TemporaryDirectory(prefix="kraken-api-") as tmp:
        settings = f'''PROJECT_NAME = Kraken
INPUT = "{(source / 'include').as_posix()}"
OUTPUT_DIRECTORY = "{Path(tmp).as_posix()}"
RECURSIVE = YES
FILE_PATTERNS = *.hpp *.h
GENERATE_HTML = NO
GENERATE_LATEX = NO
GENERATE_XML = YES
EXTRACT_ALL = YES
EXTRACT_PRIVATE = NO
EXTRACT_STATIC = YES
EXCLUDE_SYMBOLS = kn::detail::* kn::detail
QUIET = YES
WARN_IF_UNDOCUMENTED = NO
ENABLE_PREPROCESSING = YES
MACRO_EXPANSION = YES
EXPAND_ONLY_PREDEF = YES
PREDEFINED = ENABLE_ENUM_FLAGS(x)=
'''
        result = subprocess.run([args.doxygen, "-"], input=settings, text=True, capture_output=True)
        if result.returncode:
            raise SystemExit("Doxygen failed; previous API snapshot is unchanged.\n" + result.stderr)
        cpp = cpp_pages(Path(tmp) / "xml")
    pages = sorted(py + cpp, key=lambda p: (p["language"], p["name"].lower(), p["name"]))
    validate(pages)
    # Match only unambiguous counterparts with the same kind and exact leaf name.
    for page in pages:
        leaf = re.split(r"::|\.", page["name"])[-1]
        candidates = [p for p in pages if p["language"] != page["language"] and (p["kind"] == "module") == (page["kind"] == "module") and (p["kind"] == "enum") == (page["kind"] == "enum")]
        matches = [p for p in candidates if p["name"].replace("::", ".") == page["name"].replace("::", ".")]
        if not matches:
            matches = [p for p in candidates if re.split(r"::|\.", p["name"])[-1] == leaf]
        page["counterpart"] = matches[0]["slug"] if len(matches) == 1 else None
    header = (source / "include/kraken/Runtime.hpp").read_text()
    cpp_version = ".".join(re.search(rf"KN_VERSION_{part}\s+(\d+)", header).group(1) for part in ("MAJOR", "MINOR", "PATCH"))
    py_version = importlib.metadata.version(config["distribution"])
    commit_result = subprocess.run(["git", "-c", f"safe.directory={source.as_posix()}", "-C", str(source), "rev-parse", "HEAD"], capture_output=True, text=True)
    commit = commit_result.stdout.strip() if commit_result.returncode == 0 else None
    data = {"schemaVersion": 1, "versions": {"python": py_version, "cpp": cpp_version}, "sourceCommit": commit, "pages": pages}
    target = ROOT / "src/data/api.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(target)
    print(f"Python {py_version}: {len(py)} pages from {module_path}")
    print(f"C++ {cpp_version}: {len(cpp)} pages from {source / 'include'}")
    print(f"Validated {sum(len(p['members']) for p in pages)} members; wrote {target}")


if __name__ == "__main__":
    main()
