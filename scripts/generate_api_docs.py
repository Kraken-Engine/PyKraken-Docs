#!/usr/bin/env python3
"""
Generate MDX API docs for PyKraken from installed type stubs.

Usage:
  python scripts/generate_api_docs.py

Notes:
- Requires the `pykraken` package to be installed in the active Python env.
- Generates/updates:
    contents/docs/classes/<class-slug>/index.mdx
    contents/docs/functions/<module>/index.mdx
"""

from __future__ import annotations

import argparse
import ast
import importlib.util
import importlib
import re
import shutil
import textwrap
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple


@dataclass
class Param:
    name: str
    type: Optional[str] = None
    default: Optional[str] = None


@dataclass
class FunctionSig:
    name: str
    params: List[Param] = field(default_factory=list)
    returns: Optional[str] = None
    doc: Optional[str] = None


@dataclass
class PropertyInfo:
    name: str
    type: Optional[str]
    doc: Optional[str] = None


@dataclass
class ClassInfo:
    name: str
    doc: Optional[str]
    module_name: Optional[str] = None
    is_enum: bool = False
    init_sigs: List[FunctionSig] = field(default_factory=list)
    properties: List[PropertyInfo] = field(default_factory=list)
    methods: List[FunctionSig] = field(default_factory=list)


@dataclass
class ModuleInfo:
    name: str
    doc: Optional[str]
    functions: List[FunctionSig] = field(default_factory=list)


def find_package_root(package: str) -> Tuple[Path, Path]:
    spec = importlib.util.find_spec(package)
    if spec is None:
        raise RuntimeError(f"Package '{package}' not found in current Python environment.")

    # If a stub file is directly provided
    if spec.origin and spec.origin.endswith(".pyi"):
        root = Path(spec.origin).parent
        return root, Path(spec.origin)

    # If package directory exists
    if spec.submodule_search_locations:
        for loc in spec.submodule_search_locations:
            loc_path = Path(loc)
            init_pyi = loc_path / "__init__.pyi"
            if init_pyi.exists():
                return loc_path, init_pyi
            init_py = loc_path / "__init__.py"
            if init_py.exists():
                return loc_path, init_py

    # Fallback: try same directory as origin
    if spec.origin:
        origin_path = Path(spec.origin)
        return origin_path.parent, origin_path

    raise RuntimeError(f"Unable to locate package root for '{package}'.")


def iter_stub_files(pkg_root: Path) -> List[Path]:
    files: List[Path] = []
    for path in pkg_root.rglob("*.pyi"):
        if "__pycache__" in path.parts:
            continue
        files.append(path)

    # Include specific submodules that need explicit import (fx, shader_uniform)
    for submodule in ["fx.py", "shader_uniform.py"]:
        py_file = pkg_root / submodule
        if py_file.exists():
            files.append(py_file)

    return files


def parse_module(path: Path) -> Tuple[ast.Module, List[str]]:
    source = path.read_text(encoding="utf-8")
    return ast.parse(source, filename=str(path)), source.splitlines()


def decorator_name(node: ast.AST) -> Optional[str]:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return None


def render_annotation(node: Optional[ast.AST]) -> Optional[str]:
    if node is None:
        return None
    try:
        text = ast.unparse(node)
    except Exception:
        return None
    text = text.replace("typing.", "")
    text = text.replace("collections.abc.", "")
    text = text.replace("pykraken._core.", "")
    text = text.replace("_core.", "")
    return text


def render_default(node: Optional[ast.AST]) -> Optional[str]:
    if node is None:
        return None
    try:
        text = ast.unparse(node)
        text = text.replace("pykraken._core.", "")
        text = text.replace("_core.", "")
        return text
    except Exception:
        return None


def build_params(args: ast.arguments, drop_first: bool) -> List[Param]:
    params: List[Param] = []

    pos_args = list(args.posonlyargs) + list(args.args)
    if drop_first and pos_args:
        pos_args = pos_args[1:]

    defaults = list(args.defaults)
    default_pad = [None] * (len(pos_args) - len(defaults))
    defaults = default_pad + defaults

    for arg, default in zip(pos_args, defaults):
        params.append(
            Param(
                name=arg.arg,
                type=render_annotation(arg.annotation),
                default=render_default(default),
            )
        )

    if args.vararg:
        params.append(
            Param(
                name=f"*{args.vararg.arg}",
                type=render_annotation(args.vararg.annotation),
                default=None,
            )
        )

    if args.kwonlyargs:
        for arg, default in zip(args.kwonlyargs, args.kw_defaults):
            params.append(
                Param(
                    name=arg.arg,
                    type=render_annotation(arg.annotation),
                    default=render_default(default),
                )
            )

    if args.kwarg:
        params.append(
            Param(
                name=f"**{args.kwarg.arg}",
                type=render_annotation(args.kwarg.annotation),
                default=None,
            )
        )

    return params


def should_multiline(params: List[Param]) -> bool:
    if len(params) > 3:
        return True
    for p in params:
        if p.type and len(p.type) > 18:
            return True
    # Estimate signature length for readability
    def render_param(p: Param) -> str:
        parts = [p.name]
        if p.type:
            parts.append(f": {p.type}")
        if p.default is not None:
            parts.append(f" = {p.default}")
        return "".join(parts)

    sig_len = len(", ".join(render_param(p) for p in params))
    if sig_len > 42:
        return True
    return False


def escape_attr(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def params_to_mdx(params: List[Param]) -> str:
    if not params:
        return "[]"
    items: List[str] = []
    for p in params:
        parts = [f'name: "{escape_attr(p.name)}"']
        if p.type:
            parts.append(f'type: "{escape_attr(p.type)}"')
        if p.default is not None:
            parts.append(f'default: "{escape_attr(p.default)}"')
        items.append("{ " + ", ".join(parts) + " }")
    return "[" + ", ".join(items) + "]"


def mdx_api_sig(name: str, sig: FunctionSig) -> str:
    multiline = should_multiline(sig.params)
    params = params_to_mdx(sig.params) if sig.params else None
    parts = [f'<ApiSig name="{escape_attr(name)}"']
    if multiline:
        parts.append("multiline")
    if params is not None and params != "[]":
        parts.append(f"params={{{params}}}")
    if sig.returns:
        parts.append(f'returns="{escape_attr(sig.returns)}"')
    return " ".join(parts) + " />"


def camel_to_kebab(name: str) -> str:
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1-\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s1)
    return s2.replace("_", "-").lower()


def constants_anchor(name: str) -> str:
    slug = name.lower().replace(" ", "-")
    return re.sub(r"[^a-z0-9-]", "", slug)


def snake_to_title(name: str) -> str:
    return name.replace("_", " ").strip().title()


def summary_from_doc(doc: Optional[str], fallback: str) -> str:
    if not doc:
        return fallback
    text = textwrap.dedent(doc).strip()
    return text.splitlines()[0] if text else fallback


def parse_stub_file(tree: ast.Module, lines: List[str]) -> Tuple[List[ClassInfo], List[FunctionSig], Optional[str]]:
    module_doc = ast.get_docstring(tree)
    classes: List[ClassInfo] = []
    functions: List[FunctionSig] = []

    overload_buckets: Dict[str, List[FunctionSig]] = {}

    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            parsed = parse_class(node, lines)
            if parsed:
                classes.append(parsed)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            sigs = parse_function_overloads(node, drop_first=False)
            for sig in sigs:
                overload_buckets.setdefault(sig.name, []).append(sig)
        else:
            continue

    for name, sigs in overload_buckets.items():
        if name.startswith("_") and not name.startswith("_fx_"):
            continue
        # Keep doc from first signature if present
        doc = next((s.doc for s in sigs if s.doc), None)
        merged = FunctionSig(name=name, params=sigs[0].params, returns=sigs[0].returns, doc=doc)
        if len(sigs) > 1:
            merged = FunctionSig(name=name, params=sigs[0].params, returns=sigs[0].returns, doc=doc)
            merged.__dict__["overloads"] = sigs  # type: ignore
        functions.append(merged)

    return classes, functions, module_doc


def is_enum_base(base: ast.expr) -> bool:
    try:
        name = ast.unparse(base)
    except Exception:
        return False
    name = name.strip()
    enum_names = {"Enum", "IntEnum", "Flag", "IntFlag"}
    if name in enum_names:
        return True
    return any(name.endswith(f".{n}") for n in enum_names)


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("{", "&#123;")
        .replace("}", "&#125;")
    )


def escape_outside_code(text: str) -> str:
    """Escapes HTML special characters outside of code blocks."""
    # Pattern matches backtick sequences and content: (`+)(.*?)(\1)
    pattern = re.compile(r"(`+)(.*?)(\1)", re.DOTALL)

    last_pos = 0
    out = []

    for match in pattern.finditer(text):
        # Text before code -> escape
        pre_text = text[last_pos:match.start()]
        out.append(escape_html(pre_text))

        # Code segment -> keep as is
        out.append(match.group(0))

        last_pos = match.end()

    # Remaining text -> escape
    out.append(escape_html(text[last_pos:]))

    return "".join(out)


def format_type_for_table(type_str: str, classes_map: Dict[str, ClassInfo]) -> str:
    parts = re.split(r"(\b[a-zA-Z_][a-zA-Z0-9_]*\b)", type_str)
    out = []
    for part in parts:
        if not part:
            continue
        if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", part):
            info = classes_map.get(part)
            if info:
                if info.is_enum:
                    anchor = constants_anchor(info.name)
                    out.append(f'<a href="/docs/manual/constants#{anchor}">{part}</a>')
                else:
                    slug = camel_to_kebab(part)
                    out.append(f'<a href="/docs/classes/{slug}">{part}</a>')
            else:
                out.append(part)
        else:
            out.append(escape_html(part))
    return "".join(out)


def get_qualified_name(
    name: str, current_module: str, classes_map: Dict[str, ClassInfo], package_name: str
) -> str:
    # Basic qualified check if needed again, mostly for sigs
    if name not in classes_map:
        return name
    info = classes_map[name]
    if not info.module_name or info.module_name == current_module:
        return name
    # We stripped submodule prefixes earlier, but preserving linking logic requires knowing
    # if it's external.
    # For now we are not prepending "module." per user request, but we need linking.
    return name


def format_type_for_sig(
    type_str: str, current_module: str, classes_map: Dict[str, ClassInfo], package_name: str
) -> str:
    # Just need basic linking?
    # Actually the user asked to undo "showing which submodule an object comes from".
    # But previous code had `format_type_for_sig`.
    # Let's restore `process_sig` logic.
    return type_str


def process_sig(
    sig: FunctionSig, current_module: str, classes_map: Dict[str, ClassInfo], package_name: str
) -> FunctionSig:
    # Since we aren't modifying types to include submodules anymore per "undo that" request,
    # this function might just identity-return the sig, OR it still needs to recurse for overloads.

    # We must ensure overloads are processed if we rely on `getattr(sig, "overloads")`
    # The parsing logic puts overloads on `merged` object.
    # If we return a copy, we must copy overloads.

    new_sig = FunctionSig(name=sig.name, params=sig.params, returns=sig.returns, doc=sig.doc)
    if hasattr(sig, "overloads"):
        new_overloads = []
        for osig in getattr(sig, "overloads"):
            new_overloads.append(process_sig(osig, current_module, classes_map, package_name))
        new_sig.__dict__["overloads"] = new_overloads
    return new_sig


def parse_class(node: ast.ClassDef, lines: List[str]) -> Optional[ClassInfo]:
    if node.name.endswith("List"):
        return None
    is_enum = False
    if any(is_enum_base(base) for base in node.bases):
        is_enum = True

    doc = ast.get_docstring(node)
    info = ClassInfo(name=node.name, doc=doc, is_enum=is_enum)

    init_overloads: Dict[str, List[FunctionSig]] = {}
    method_overloads: Dict[str, List[FunctionSig]] = {}

    body = list(node.body)
    for idx, item in enumerate(body):
        next_item = body[idx + 1] if idx + 1 < len(body) else None
        next_doc: Optional[str] = None
        if isinstance(next_item, ast.Expr) and isinstance(next_item.value, ast.Constant):
            if isinstance(next_item.value.value, str):
                next_doc = next_item.value.value
        # Match annotated assignments: name: type = val
        if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
            if item.target.id.startswith("_"):
                continue
            prop_doc = next_doc

            # Extract comment value if no docstring
            if not prop_doc and not is_enum and hasattr(item, "lineno"):
                line_idx = item.lineno - 1
                if 0 <= line_idx < len(lines):
                    line_content = lines[line_idx]
                    if "# value =" in line_content:
                        # Extract the part after "# value ="
                        val = line_content.split("# value =", 1)[1].strip()
                        prop_doc = f"`{val}`"

            info.properties.append(
                PropertyInfo(
                    name=item.target.id,
                    type=render_annotation(item.annotation),
                    doc=prop_doc,
                )
            )
            continue

        # Match plain assignments (common in Enums): name = val
        if isinstance(item, ast.Assign):
            # For enums, we want to capture these as properties
            if not is_enum:
                continue
            for target in item.targets:
                if isinstance(target, ast.Name):
                    if target.id.startswith("_"):
                        continue
                    # For enums, if no annotation, default to class name itself
                    # or leave empty?
                    # Stubs for enums often look like: MEMBER = ...
                    # Let's verify what type to use. Using the class name is safe.
                    info.properties.append(
                        PropertyInfo(
                            name=target.id,
                            type=node.name,
                            doc=next_doc,
                        )
                    )
            continue

        if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
            decorators = [decorator_name(d) for d in item.decorator_list]
            if any(d in {"setter", "deleter", "getter"} for d in decorators if d):
                continue
            if "property" in decorators:
                if item.name.startswith("_"):
                    continue
                info.properties.append(
                    PropertyInfo(
                        name=item.name,
                        type=render_annotation(item.returns),
                        doc=ast.get_docstring(item),
                    )
                )
                continue

            drop_first = True
            if "staticmethod" in decorators:
                drop_first = False
            sigs = parse_function_overloads(item, drop_first=drop_first)

            if item.name == "__init__":
                for sig in sigs:
                    init_overloads.setdefault(sig.name, []).append(sig)
                continue

            if item.name.startswith("_"):
                continue

            for sig in sigs:
                method_overloads.setdefault(item.name, []).append(sig)

    if init_overloads:
        sigs = init_overloads.get("__init__", [])
        info.init_sigs = sigs

    for name, sigs in method_overloads.items():
        if len(sigs) == 1:
            info.methods.append(sigs[0])
        else:
            merged = FunctionSig(name=name, params=sigs[0].params, returns=sigs[0].returns, doc=sigs[0].doc)
            merged.__dict__["overloads"] = sigs  # type: ignore
            info.methods.append(merged)

    return info


def format_docstring(doc: Optional[str]) -> str:
    if not doc:
        return ""
    text = textwrap.dedent(doc).strip()
    if not text:
        return ""

    out_lines: List[str] = []
    heading_re = re.compile(r"^(Args|Attributes|Methods|Returns|Raises):\s*$", re.IGNORECASE)
    section: Optional[str] = None

    for line in text.splitlines():
        stripped = line.strip()
        match = heading_re.match(stripped)
        if match:
            title = match.group(1).title()
            section = title
            out_lines.append(f"_**{title}**_")
            out_lines.append("")
            continue

        if section in {"Args", "Attributes", "Methods", "Raises"}:
            if not stripped:
                out_lines.append("")
                continue
            if ":" in stripped:
                left, right = stripped.split(":", 1)
                name = left.split("(", 1)[0].strip()
                desc = right.strip()
                if name:
                    out_lines.append(f"- `{name}` : {escape_outside_code(desc)}".rstrip())
                    continue
            out_lines.append(escape_outside_code(line))
            continue

        if section == "Returns":
            if not stripped:
                out_lines.append("")
                continue
            if ":" in stripped:
                left, right = stripped.split(":", 1)
                type_name = left.strip()
                desc = right.strip()
                if type_name:
                    out_lines.append(f"`{type_name}` : {escape_outside_code(desc)}".rstrip())
                    continue
            out_lines.append(escape_outside_code(line))
            continue

        out_lines.append(escape_outside_code(line))

    return "\n".join(out_lines).strip()


def parse_function_overloads(node: ast.AST, drop_first: bool) -> List[FunctionSig]:
    if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        return []
    decorators = [decorator_name(d) for d in node.decorator_list]
    is_overload = "overload" in decorators

    params = build_params(node.args, drop_first=drop_first)
    if any(p.name == "arg0" for p in params):
        return []

    sig = FunctionSig(
        name=node.name,
        params=params,
        returns=render_annotation(node.returns),
        doc=ast.get_docstring(node),
    )

    # For stubs, overloads are collected in caller. Still return this signature.
    return [sig]


def render_class_page(
    info: ClassInfo, package_name: str, classes_map: Dict[str, ClassInfo]
) -> str:
    title = info.name
    description = summary_from_doc(info.doc, f"API reference for {info.name}.")
    current_module = info.module_name or ""

    if (
        current_module
        and current_module != package_name
        and current_module.startswith(f"{package_name}.")
    ):
        submodule = current_module[len(package_name) + 1 :]
        submodule = submodule.replace("_core.", "").replace("_core", "")
        submodule = submodule.strip(".")
        description = f"{description} Access via the '{submodule}' submodule."

    lines: List[str] = []
    lines.append("---")
    lines.append(f"title: {title}")
    lines.append(f"description: {description}")
    lines.append("---")
    lines.append("")

    if info.init_sigs and not info.is_enum:
        lines.append("## Constructor")
        lines.append('<div className="api-card">')
        lines.append("")

        for sig in info.init_sigs:
            # Constructor returns the class instance
            sig_fixed = FunctionSig(
                name=sig.name, params=sig.params, returns=info.name, doc=sig.doc
            )
            lines.append(f"- {mdx_api_sig(info.name, sig_fixed)}")

        if info.doc:
            lines.append("")
            lines.append(escape_outside_code(summary_from_doc(info.doc, "")))
        lines.append("</div>")

    if info.properties:
        lines.append("")
        lines.append("## Properties")
        lines.append("<hr style={{marginBottom: 0}} />")
        lines.append("")
        lines.append("| Name | Description | Type |")
        lines.append("| --- | --- | --- |")
        for prop in info.properties:
            desc = escape_outside_code(summary_from_doc(prop.doc, ""))
            if not desc and prop.type and "ClassVar" in prop.type:
                desc = "Static constant."

            type_str = prop.type or "Any"
            # For enums, if type matches class name, it's just the enum type
            formatted_type = format_type_for_table(type_str, classes_map)
            lines.append(f"| `{prop.name}` | {desc} | <code>{formatted_type}</code> |")

    if info.methods:
        lines.append("")
        lines.append("## Methods")
        lines.append("---")
        lines.append("")
        for method in info.methods:
            method_processed = process_sig(method, current_module, classes_map, package_name)
            lines.append(f"### {snake_to_title(method.name)}")

            overloads = getattr(method_processed, "overloads", None)
            has_multi_docs = overloads and sum(1 for s in overloads if s.doc) > 1

            if has_multi_docs and overloads:
                lines.append('<div className="api-card">')
                for i, sig in enumerate(overloads):
                    if i > 0:
                        lines.append("")
                        lines.append("---")
                        lines.append("")

                    lines.append(mdx_api_sig(method.name, sig))
                    if sig.doc:
                        lines.append("")
                        lines.append(format_docstring(sig.doc))
                lines.append("")
                lines.append("</div>")
                lines.append("")
            else:
                lines.append('<div className="api-card">')
                if overloads:
                    for sig in overloads:
                        lines.append(mdx_api_sig(method.name, sig))
                else:
                    lines.append(mdx_api_sig(method.name, method_processed))

                if method.doc:
                    lines.append("")
                    lines.append(format_docstring(method.doc))

                lines.append("")
                lines.append("</div>")
                lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def render_module_page(
    info: ModuleInfo, package_name: str, classes_map: Dict[str, ClassInfo]
) -> str:
    title = snake_to_title(info.name)
    description = summary_from_doc(info.doc, f"Functions in {info.name}.")
    current_module = f"{package_name}.{info.name}"  # approximate module path for functions page

    lines: List[str] = []
    lines.append("---")
    lines.append(f"title: {title}")
    lines.append(f"description: {description}")
    lines.append("---")
    lines.append("")
    lines.append("---")
    lines.append("")

    for func in info.functions:
        func_processed = process_sig(func, current_module, classes_map, package_name)
        lines.append(f"## {snake_to_title(func.name)}")

        overloads = getattr(func_processed, "overloads", None)
        has_multi_docs = overloads and sum(1 for s in overloads if s.doc) > 1

        if has_multi_docs and overloads:
            lines.append('<div className="api-card">')
            for i, sig in enumerate(overloads):
                if i > 0:
                    lines.append("")
                    lines.append("---")
                    lines.append("")

                lines.append(mdx_api_sig(func.name, sig))
                if sig.doc:
                    lines.append("")
                    lines.append(format_docstring(sig.doc))
            lines.append("")
            lines.append("</div>")
            lines.append("")
        else:
            lines.append('<div className="api-card">')
            if overloads:
                for sig in overloads:
                    lines.append(mdx_api_sig(func.name, sig))
            else:
                lines.append(mdx_api_sig(func.name, func_processed))

            if func.doc:
                lines.append("")
                lines.append(format_docstring(func.doc))
            lines.append("")
            lines.append("</div>")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def render_constants_page(enums: List[ClassInfo]) -> str:
    lines = []
    lines.append("---")
    lines.append("title: Constants")
    lines.append("description: A comprehensive list of constants used in the Kraken Engine.")
    lines.append("---")
    lines.append("")

    # Sort enums by name
    enums.sort(key=lambda x: x.name)

    for info in enums:
        # Title of the section: CamelCase -> Title Case (e.g. MouseButton -> Mouse Button)
        # using snake_to_title on camel case kind of works if we split it first or just use space
        # But let's just use the class name for clarity or a simple spread.
        # title = snake_to_title(camel_to_kebab(info.name).replace("-", "_"))
        title = info.name

        lines.append(f"## {title}")
        if info.doc:
             lines.append(escape_outside_code(summary_from_doc(info.doc, "")))
             lines.append("")

        lines.append("| Name | Description | Type |")
        lines.append("| --- | --- | --- |")

        for prop in info.properties:
            desc = escape_outside_code(summary_from_doc(prop.doc, ""))
            # For enums, the type is the enum class itself
            lines.append(f"| `{prop.name}` | {desc} | `{info.name}` |")

        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def enrich_enum_member_docs(enums: List[ClassInfo], package_name: str) -> None:
    """Populate enum member docs from runtime objects when available."""
    for enum_info in enums:
        if not enum_info.module_name:
            continue
        enum_cls = None

        # Try module where the enum is defined
        for module_name in {
            enum_info.module_name,
            package_name,
        }:
            try:
                mod = importlib.import_module(module_name)
            except Exception:
                continue
            enum_cls = getattr(mod, enum_info.name, None)
            if enum_cls is not None:
                break

        if enum_cls is None:
            continue

        members = getattr(enum_cls, "__members__", None)

        for prop in enum_info.properties:
            if prop.doc:
                continue
            member_obj = None
            if members and prop.name in members:
                member_obj = members.get(prop.name)
            else:
                member_obj = getattr(enum_cls, prop.name, None)

            if member_obj is None:
                continue

            doc = getattr(member_obj, "__doc__", None)
            if isinstance(doc, str) and doc.strip():
                prop.doc = doc.strip()


def module_name_from_path(pkg: str, pkg_root: Path, file_path: Path) -> str:
    rel = file_path.relative_to(pkg_root)
    if rel.suffix not in (".pyi", ".py"):
        return pkg

    # Handle __init__ files
    parts = list(rel.with_suffix("").parts)
    if rel.name in ("__init__.pyi", "__init__.py"):
        # If it's the top-level __init__, return just the package name
        if len(parts) == 1:
            return pkg
        # Otherwise, include the parent directory path
        return ".".join([pkg] + parts[:-1])

    # Regular module files
    return ".".join([pkg] + parts)


def build_routes_items(titles_and_slugs: List[Tuple[str, str]]) -> str:
    lines = [f"      {{ title: \"{title}\", href: \"/{slug}\" }}," for title, slug in titles_and_slugs]
    return "\n".join(lines)


def replace_routes_items(content: str, section_title: str, new_items: str) -> str:
    pattern = re.compile(
        rf"(\{{\n\s+title: \"{re.escape(section_title)}\"[\s\S]*?\n\s+items: \[)([\s\S]*?)(\n\s+\]\s*,\n\s+\}})",
        re.MULTILINE,
    )
    match = pattern.search(content)
    if not match:
        return content
    return content[: match.start(2)] + "\n" + new_items + content[match.end(2) :]


def update_routes_config(routes_path: Path, class_names: List[str], module_names: List[str]) -> bool:
    if not routes_path.exists():
        return False

    content = routes_path.read_text(encoding="utf-8")

    class_items = [(name, camel_to_kebab(name)) for name in class_names]
    class_items.sort(key=lambda x: x[0].lower())

    module_items = [(snake_to_title(name), camel_to_kebab(name)) for name in module_names]
    module_items.sort(key=lambda x: x[0].lower())

    updated = replace_routes_items(content, "Classes", build_routes_items(class_items))
    updated = replace_routes_items(updated, "Functions", build_routes_items(module_items))

    if updated != content:
        routes_path.write_text(updated, encoding="utf-8")
        return True
    return False


def write_type_links_file(
    target: Path, class_names: List[str], enum_names: List[str]
) -> bool:
    class_items = [(name, f"/docs/classes/{camel_to_kebab(name)}") for name in class_names]
    enum_items = [(name, f"/docs/manual/constants#{constants_anchor(name)}") for name in enum_names]
    class_items.extend(enum_items)
    class_items.sort(key=lambda x: x[0].lower())

    lines: List[str] = []
    lines.append("export const TYPE_LINKS = {")
    for name, href in class_items:
        lines.append(f"  {name}: \"{href}\",")
    lines.append("} as const;")
    lines.append("")
    lines.append("export type TypeLinkName = keyof typeof TYPE_LINKS;")
    lines.append("")

    content = "\n".join(lines)
    if target.exists() and target.read_text(encoding="utf-8") == content:
        return False
    target.write_text(content, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate MDX API docs from PyKraken stubs.")
    parser.add_argument("--package", default="pykraken", help="Package name (default: pykraken)")
    parser.add_argument("--out", default=str(Path("contents") / "docs"), help="Docs output directory")
    parser.add_argument("--prune", action="store_true", help="Remove stale class/function directories")
    parser.add_argument(
        "--routes",
        default=str(Path("lib") / "routes-config.ts"),
        help="Path to routes-config.ts (default: lib/routes-config.ts)",
    )

    args = parser.parse_args()

    pkg = args.package
    out_dir = Path(args.out)

    pkg_root, entry_file = find_package_root(pkg)
    stub_files = iter_stub_files(pkg_root)
    if not stub_files:
        # fall back to parsing the runtime source if no .pyi found
        stub_files = [entry_file]

    print(f"Found {len(stub_files)} stub file(s) under {pkg_root}")

    classes_by_name: Dict[str, ClassInfo] = {}
    modules: Dict[str, ModuleInfo] = {}

    for stub in stub_files:
        tree, lines = parse_module(stub)
        classes, functions, module_doc = parse_stub_file(tree, lines)
        module_name = module_name_from_path(pkg, pkg_root, stub)

        for cls in classes:
            cls.module_name = module_name
            classes_by_name[cls.name] = cls

        if functions:
            modules[module_name] = ModuleInfo(name=module_name.split(".")[-1], doc=module_doc, functions=functions)

    # Extract fx functions from _core module
    core_module_name = f"{pkg}._core"
    if core_module_name in modules:
        fx_functions = []
        core_module = modules[core_module_name]
        for func in core_module.functions:
            if func.name.startswith("_fx_"):
                # Create a copy with the _fx_ prefix removed
                fx_func = FunctionSig(
                    name=func.name[4:],  # Remove "_fx_" prefix
                    params=func.params,
                    returns=func.returns,
                    doc=func.doc
                )
                # Copy overloads if they exist
                if hasattr(func, "__dict__") and "overloads" in func.__dict__:
                    fx_func.__dict__["overloads"] = [
                        FunctionSig(
                            name=sig.name[4:],
                            params=sig.params,
                            returns=sig.returns,
                            doc=sig.doc
                        )
                        for sig in func.__dict__["overloads"]
                    ]
                fx_functions.append(fx_func)

        if fx_functions:
            # Read docstring from fx.py if it exists
            fx_py_path = pkg_root / "fx.py"
            fx_doc = None
            if fx_py_path.exists():
                try:
                    tree, lines = parse_module(fx_py_path)
                    fx_doc = ast.get_docstring(tree)
                except Exception:
                    pass

            modules[f"{pkg}.fx"] = ModuleInfo(
                name="fx",
                doc=fx_doc,
                functions=fx_functions
            )

    print(f"Parsed {len(classes_by_name)} class(es) and {len(modules)} module(s)")

    classes_dir = out_dir / "classes"
    functions_dir = out_dir / "functions"
    classes_dir.mkdir(parents=True, exist_ok=True)
    functions_dir.mkdir(parents=True, exist_ok=True)

    # Separate enums
    normal_classes: List[ClassInfo] = []
    enums: List[ClassInfo] = []
    for cls in classes_by_name.values():
        if cls.is_enum:
            enums.append(cls)
        else:
            normal_classes.append(cls)

    generated_class_dirs: List[str] = []
    for cls in normal_classes:
        slug = camel_to_kebab(cls.name)
        generated_class_dirs.append(slug)
        target = classes_dir / slug / "index.mdx"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            render_class_page(cls, pkg, classes_by_name), encoding="utf-8"
        )

    # Enrich enum member docs from runtime, if available
    enrich_enum_member_docs(enums, pkg)

    # Generate Constants Page
    constants_path = out_dir / "manual" / "constants" / "index.mdx"
    constants_path.parent.mkdir(parents=True, exist_ok=True)
    constants_path.write_text(render_constants_page(enums), encoding="utf-8")
    print(f"Wrote constants page to {constants_path}")

    generated_module_dirs: List[str] = []
    for mod in modules.values():
        # Skip the main package module and internal _core module
        if mod.name == pkg or mod.name == "_core":
            continue
        slug = camel_to_kebab(mod.name)
        generated_module_dirs.append(slug)
        target = functions_dir / slug / "index.mdx"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            render_module_page(mod, pkg, classes_by_name), encoding="utf-8"
        )

    print(f"Wrote {len(generated_class_dirs)} class page(s)")
    print(f"Wrote {len(generated_module_dirs)} function module page(s)")

    if args.prune:
        prune_dirs(classes_dir, generated_class_dirs)
        prune_dirs(functions_dir, generated_module_dirs)
        print("Pruned stale class/function directories")

    routes_path = Path(args.routes)
    updated_routes = update_routes_config(
        routes_path,
        sorted(c.name for c in normal_classes),
        sorted({mod.name for mod in modules.values() if mod.name not in (pkg, "_core")}),
    )
    if updated_routes:
        print(f"Updated routes config at {routes_path}")
    else:
        print("Routes config unchanged")

    type_links_path = Path("lib") / "type-links.ts"
    if write_type_links_file(
        type_links_path,
        sorted(c.name for c in normal_classes),
        sorted(e.name for e in enums),
    ):
        print(f"Updated type links at {type_links_path}")
    else:
        print("Type links unchanged")

    return 0


def prune_dirs(root: Path, keep_slugs: List[str]) -> None:
    keep_set = {s.lower() for s in keep_slugs}
    for entry in root.iterdir():
        if entry.is_dir() and entry.name.lower() not in keep_set:
            shutil.rmtree(entry, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
