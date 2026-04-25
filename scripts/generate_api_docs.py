#!/usr/bin/env python3
"""
Generate MDX API docs for PyKraken with Griffe.

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
import importlib
import re
import shutil
import textwrap
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from griffe import Attribute, Class, Function, Module, load


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
    bases: List[str] = field(default_factory=list)
    init_sigs: List[FunctionSig] = field(default_factory=list)
    properties: List[PropertyInfo] = field(default_factory=list)
    methods: List[FunctionSig] = field(default_factory=list)


@dataclass
class ModuleInfo:
    name: str
    doc: Optional[str]
    functions: List[FunctionSig] = field(default_factory=list)


def clean_floats(text: str) -> str:
    """Detects trailing zeros in decimals (at least two in a row) and cuts them off."""
    if not text:
        return text

    def replacer(match):
        val = match.group(0)
        dot_idx = val.find(".")
        if dot_idx == -1:
            return val

        # Look for "00" after the decimal point
        zeros_match = re.search(r"00", val[dot_idx:])
        if zeros_match:
            cutoff = dot_idx + zeros_match.start()
            new_val = val[:cutoff]
            if new_val.endswith("."):
                new_val += "0"
            return new_val
        return val

    # Match floating point numbers
    return re.sub(r"\d+\.\d+", replacer, text)


def escape_attr(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def params_to_mdx(params: List[Param]) -> str:
    if not params:
        return "[]"
    items: List[str] = []
    for p in params:
        parts = [f'name: "{escape_attr(p.name)}"']
        if p.type:
            parts.append(f'type: "{escape_attr(simplify_type(p.type))}"')
        if p.default is not None:
            parts.append(f'default: "{escape_attr(simplify_type(p.default))}"')
        items.append("{ " + ", ".join(parts) + " }")
    return "[" + ", ".join(items) + "]"


def mdx_api_sig(name: str, sig: FunctionSig) -> str:
    params = params_to_mdx(sig.params) if sig.params else None
    parts = [f'<ApiSig name="{escape_attr(name)}"']
    if params is not None and params != "[]":
        parts.append(f"params={{{params}}}")
    if sig.returns:
        parts.append(f'returns="{escape_attr(simplify_type(sig.returns))}"')
    return " ".join(parts) + " />"


def camel_to_kebab(name: str) -> str:
    name = name.replace(".", "-")
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1-\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s1)
    return re.sub(r"-+", "-", s2.replace("_", "-")).strip("-").lower()


def snake_to_title(name: str) -> str:
    return name.replace("_", " ").strip().title()


def summary_from_doc(doc: Optional[str], fallback: str) -> str:
    if not doc:
        return fallback
    text = textwrap.dedent(doc).strip()
    text = clean_floats(text)
    return text.splitlines()[0] if text else fallback


def griffe_doc(obj: object) -> Optional[str]:
    docstring = getattr(obj, "docstring", None)
    value = getattr(docstring, "value", None)
    if isinstance(value, str) and value.strip():
        return value
    return None


def strip_leading_signature_line(doc: Optional[str], name: str) -> Optional[str]:
    if not doc:
        return doc

    lines = textwrap.dedent(doc).strip().splitlines()
    if not lines:
        return doc

    escaped_name = re.escape(name)
    signature_re = re.compile(rf"^{escaped_name}\s*\(.*\)\s*(?:->|→).*$")
    if not signature_re.match(lines[0].strip()):
        return doc

    lines = lines[1:]
    while lines and not lines[0].strip():
        lines = lines[1:]
    return "\n".join(lines).strip() or None


def split_top_level(text: str, separator: str) -> List[str]:
    parts: List[str] = []
    start = 0
    depth = 0
    quote: Optional[str] = None
    escape = False

    for idx, char in enumerate(text):
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if quote:
            if char == quote:
                quote = None
            continue
        if char in {"'", '"'}:
            quote = char
            continue
        if char in "([{":
            depth += 1
            continue
        if char in ")]}":
            depth = max(0, depth - 1)
            continue
        if char == separator and depth == 0:
            parts.append(text[start:idx].strip())
            start = idx + 1

    tail = text[start:].strip()
    if tail:
        parts.append(tail)
    return parts


def split_top_level_once(text: str, separator: str) -> Tuple[str, Optional[str]]:
    parts = split_top_level(text, separator)
    if len(parts) <= 1:
        return text.strip(), None

    left = parts[0]
    right = text[text.find(separator) + 1 :].strip()
    return left, right


def parse_docstring_signature(doc: Optional[str], name: str) -> Tuple[List[Param], Optional[str]]:
    if not doc:
        return [], None

    first_line = textwrap.dedent(doc).strip().splitlines()[0].strip()
    match = re.match(rf"^{re.escape(name)}\s*\((?P<params>.*)\)\s*(?:(?:->|→)\s*(?P<returns>.*))?$", first_line)
    if not match:
        return [], None

    params: List[Param] = []
    for raw_param in split_top_level(match.group("params"), ","):
        if raw_param in {"", "/", "*", "self", "cls"}:
            continue

        left, default = split_top_level_once(raw_param, "=")
        param_name, param_type = split_top_level_once(left, ":")
        param_name = param_name.strip()
        if not param_name or param_name in {"self", "cls"}:
            continue

        params.append(
            Param(
                name=param_name,
                type=clean_floats(param_type.strip()) if param_type else None,
                default=clean_floats(default.strip()) if default else None,
            )
        )

    returns = griffe_expr(match.group("returns"), keep_none=True)
    return params, returns


def griffe_expr(value: object, keep_none: bool = False) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    if not text or (text == "None" and not keep_none):
        return None
    return clean_floats(text)


def griffe_module_path(obj: object) -> str:
    path = str(getattr(obj, "path", ""))
    name = str(getattr(obj, "name", ""))
    if not path or not name:
        return ""
    suffix = f".{name}"
    return path[: -len(suffix)] if path.endswith(suffix) else path


def griffe_class_name(cls: Class, module_name: str) -> str:
    path = str(cls.path)
    prefix = f"{module_name}."
    return path[len(prefix) :] if path.startswith(prefix) else cls.name


def griffe_base_name(base: object) -> str:
    text = str(base).strip()
    return text.replace("pykraken.", "")


def griffe_is_enum(cls: Class) -> bool:
    enum_names = {"Enum", "IntEnum", "Flag", "IntFlag"}
    for base in getattr(cls, "bases", []) or []:
        name = str(base).strip()
        if name in enum_names or any(name.endswith(f".{enum_name}") for enum_name in enum_names):
            return True
    return False


def griffe_param_to_info(param: object) -> Optional[Param]:
    name = str(getattr(param, "name", ""))
    if not name or name in {"self", "cls"}:
        return None

    kind = str(getattr(param, "kind", ""))
    if kind.endswith("variadic positional") or "var positional" in kind:
        name = f"*{name}"
    elif kind.endswith("variadic keyword") or "var keyword" in kind:
        name = f"**{name}"

    return Param(
        name=name,
        type=griffe_expr(getattr(param, "annotation", None)),
        default=griffe_expr(getattr(param, "default", None), keep_none=True),
    )


def griffe_function_sig(func: Function) -> FunctionSig:
    params = [
        param_info
        for param in getattr(func, "parameters", [])
        if (param_info := griffe_param_to_info(param)) is not None
    ]
    doc = griffe_doc(func)
    fallback_params, fallback_returns = parse_docstring_signature(doc, func.name)
    if not params and fallback_params:
        params = fallback_params

    return FunctionSig(
        name=func.name,
        params=params,
        returns=griffe_expr(getattr(func, "returns", None), keep_none=True) or fallback_returns,
        doc=strip_leading_signature_line(doc, func.name),
    )


def griffe_function_with_overloads(func: Function) -> Optional[FunctionSig]:
    overloads = getattr(func, "overloads", None) or []
    if overloads:
        sigs = [griffe_function_sig(overload) for overload in overloads]
        doc = next((sig.doc for sig in sigs if sig.doc), griffe_doc(func))
        merged = FunctionSig(
            name=func.name,
            params=sigs[0].params,
            returns=sigs[0].returns,
            doc=doc,
        )
        merged.__dict__["overloads"] = sigs
        return merged

    sig = griffe_function_sig(func)
    if any(p.name == "arg0" for p in sig.params):
        return None
    return sig


def griffe_class_info(cls: Class, module_name: str) -> ClassInfo:
    full_name = griffe_class_name(cls, module_name)
    is_enum = griffe_is_enum(cls)
    bases = [
        griffe_base_name(base)
        for base in getattr(cls, "bases", []) or []
        if griffe_base_name(base) not in ("object", "ABC", "enum.Enum", "Enum")
    ]
    if is_enum:
        bases = []

    info = ClassInfo(
        name=full_name,
        doc=griffe_doc(cls),
        module_name=module_name,
        is_enum=is_enum,
        bases=bases,
    )

    for member in getattr(cls, "members", {}).values():
        if isinstance(member, Class):
            continue

        if isinstance(member, Attribute):
            if member.name.startswith("_"):
                continue
            labels = set(getattr(member, "labels", set()) or set())
            is_property = "property" in labels
            is_class_attribute = "class-attribute" in labels
            if is_enum or is_property or is_class_attribute:
                prop_doc = griffe_doc(member)
                if (
                    is_class_attribute
                    and not is_enum
                    and not is_property
                    and prop_doc == info.doc
                    and getattr(member, "value", None) is not None
                ):
                    prop_doc = f"`{clean_floats(str(member.value))}`"

                info.properties.append(
                    PropertyInfo(
                        name=member.name,
                        type=griffe_expr(getattr(member, "annotation", None)) or (full_name if is_enum else None),
                        doc=prop_doc,
                    )
                )
            continue

        if not isinstance(member, Function):
            continue

        if member.name == "__init__":
            init_sig = griffe_function_with_overloads(member)
            if init_sig is None:
                continue
            overloads = getattr(init_sig, "overloads", None)
            info.init_sigs = list(overloads) if overloads else [init_sig]
            continue

        if member.name.startswith("_"):
            continue

        sig = griffe_function_with_overloads(member)
        if sig is not None:
            info.methods.append(sig)

    return info


def class_preference(info: ClassInfo, package_name: str) -> Tuple[int, int]:
    module_name = info.module_name or ""
    if module_name == package_name:
        return (3, len(module_name))
    if f"{package_name}._pykraken" not in module_name:
        return (2, len(module_name))
    return (1, len(module_name))


def collect_griffe_classes(module: Module, package_name: str) -> Dict[str, ClassInfo]:
    classes: Dict[str, ClassInfo] = {}

    def visit(container: Module | Class, module_name: str) -> None:
        for member in getattr(container, "members", {}).values():
            if isinstance(member, Module):
                visit(member, str(member.path))
                continue

            if not isinstance(member, Class):
                continue

            if member.name.startswith("_") or member.name.endswith("List"):
                continue

            info = griffe_class_info(member, module_name)
            current = classes.get(info.name)
            if current is None or class_preference(info, package_name) > class_preference(current, package_name):
                classes[info.name] = info

            visit(member, module_name)

    visit(module, str(module.path))
    return classes


def collect_griffe_modules(module: Module, package_name: str) -> Dict[str, ModuleInfo]:
    modules: Dict[str, ModuleInfo] = {}

    for member in getattr(module, "members", {}).values():
        if not isinstance(member, Module):
            continue
        module_name = str(member.path)
        short_name = member.name
        if short_name in {package_name, "_pykraken", "cli"} or short_name.startswith("_"):
            continue

        functions: List[FunctionSig] = []
        for child in getattr(member, "members", {}).values():
            if isinstance(child, Function) and not child.name.startswith("_"):
                sig = griffe_function_with_overloads(child)
                if sig is not None:
                    functions.append(sig)

        if functions:
            modules[module_name] = ModuleInfo(name=short_name, doc=griffe_doc(member), functions=functions)

    return modules


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("{", "&#123;")
        .replace("}", "&#125;")
        .replace("|", "&#124;")
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


def format_type_for_table(type_str: str, linkable_classes: Dict[str, ClassInfo]) -> str:
    # Strip private module prefixes used in stubs
    type_str = type_str.replace("pykraken.", "")

    # Match whole identifiers possibly with dots: MapObject.ShapeType
    parts = re.split(r"(\b[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\b)", type_str)
    out = []
    for part in parts:
        if not part:
            continue
        if re.match(r"^[a-zA-Z_][a-zA-Z0-9_.]*$", part):
            info = linkable_classes.get(part)
            if info:
                if info.is_enum:
                    anchor = camel_to_kebab(info.name)
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


def simplify_type(type_str: Optional[str]) -> str:
    """Shorten long annotation strings (especially Annotated[NDArray[..., dict(...)]]).

    - For `Annotated[X, dict(...)]` return just `X`.
    - Collapse long `dict(...)` and parenthesis contents to `...` when needed.
    - Keep other types unchanged.
    """
    if not type_str:
        return ""

    # Strip private module prefixes from stubs and compiled-extension docstrings.
    s = type_str.replace("pykraken._pykraken.", "")
    s = s.replace("pykraken.", "").replace("_pykraken.", "")

    # Simplify Annotated[...] -> keep the first top-level item before the first comma
    if "Annotated[" in s:
        i = s.find("Annotated[") + len("Annotated[")
        # find matching closing bracket for this Annotated[] (simple stack)
        depth = 0
        end = None
        for j in range(i, len(s)):
            if s[j] == "[":
                depth += 1
            elif s[j] == "]":
                if depth == 0:
                    end = j
                    break
                depth -= 1
        content = s[i:end] if end is not None else s[i:]
        # find top-level comma in content
        depth2 = 0
        comma_idx = None
        for k, ch in enumerate(content):
            if ch in "[(":
                depth2 += 1
            elif ch in ")]":
                depth2 -= 1
            elif ch == "," and depth2 == 0:
                comma_idx = k
                break
        if comma_idx is not None:
            left = content[:comma_idx].strip()
            s = s.replace(s[s.find("Annotated["): (end + 1) if end is not None else len(s)], left)

    # Collapse long dict(...) or parenthesis contents
    s = re.sub(r"dict\([^\)]{30,}\)", "dict(...)", s)
    s = re.sub(r"\([^\)]{50,}\)", "(...)", s)
    # If still too long, truncate with ellipsis
    if len(s) > 120:
        s = s[:120] + "..."
    return s


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


def format_docstring(doc: Optional[str]) -> str:
    if not doc:
        return ""
    text = textwrap.dedent(doc).strip()
    text = clean_floats(text)
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


def render_class_page(
    info: ClassInfo, package_name: str, linkable_classes: Dict[str, ClassInfo]
) -> str:
    title = info.name
    if "." in title:
        parts = title.split(".")
        title = f"{parts[-1]} ({parts[0]})"

    description = summary_from_doc(info.doc, f"API reference for {info.name}.")
    current_module = info.module_name or ""

    if (
        current_module
        and current_module != package_name
        and current_module.startswith(f"{package_name}.")
    ):
        submodule = current_module[len(package_name) + 1 :]
        submodule = submodule.replace("_pykraken.", "").replace("_pykraken", "")
        submodule = submodule.strip(".")
        if submodule:
            description = f"{description} Access via the '{submodule}' submodule."

    lines: List[str] = []
    lines.append("---")
    lines.append(f"title: {title}")
    lines.append(f"description: {description}")
    lines.append("---")
    lines.append("")

    # Add disclaimer
    parts = set(current_module.split(".")) if current_module else set()
    if mod := next((p for p in ["physics", "ui"] if p in parts), None):
        lines.extend([
            '<Note type="warning" title="Experimental API">',
            f"  The {mod} submodule is an experimental and new API that is highly susceptible to breaking changes in the future.",
            "</Note>",
            ""
        ])

    if info.bases:
        inherited = []
        for base in info.bases:
            if base in linkable_classes:
                slug = camel_to_kebab(base)
                inherited.append(f"[{base}](/docs/classes/{slug})")
            else:
                # Still show if it's a relevant base but not in classes_map
                # (though usually we'd want to link if it's an internal class)
                inherited.append(f"`{base}`")
        if inherited:
            lines.append(f"Inherits from {', '.join(inherited)}.")
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
            formatted_type = format_type_for_table(type_str, linkable_classes)
            lines.append(f"| `{prop.name}` | {desc} | <code>{formatted_type}</code> |")

    if info.methods:
        lines.append("")
        lines.append("## Methods")
        lines.append("---")
        lines.append("")
        for method in info.methods:
            method_processed = process_sig(method, current_module, linkable_classes, package_name)
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

    # Add disclaimer
    parts = set(current_module.split(".")) if current_module else set()
    if mod := next((p for p in ["physics", "ui"] if p in parts), None):
        lines.extend([
            '<Note type="warning" title="Experimental API">',
            f"  The {mod} submodule is an experimental and new API that is highly susceptible to breaking changes in the future.",
            "</Note>",
            ""
        ])

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
        if "." in title:
            name_parts = title.split(".")
            title = f"{name_parts[-1]} ({'.'.join(name_parts[:-1])})"

        lines.append(f'<a id="{camel_to_kebab(info.name)}"></a>')
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

            # Handle nested names like MapObject.ShapeType
            parts = enum_info.name.split(".")
            enum_cls = mod
            for part in parts:
                enum_cls = getattr(enum_cls, part, None)
                if enum_cls is None:
                    break

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


def build_routes_items(titles_and_slugs: List[Tuple[str, str]], prepend_overview: bool = False) -> str:
    lines = []
    if prepend_overview:
        lines.append('      { title: "Overview", href: "", separator: true },')
    lines.extend([f"      {{ title: \"{title}\", href: \"/{slug}\" }}," for title, slug in titles_and_slugs])
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

    def format_sidebar_name(name: str) -> str:
        if "." in name:
            parts = name.split(".")
            return f"{parts[-1]} ({parts[0]})"
        return name

    class_items = [(format_sidebar_name(name), camel_to_kebab(name)) for name in class_names]
    class_items.sort(key=lambda x: x[0].lower())

    module_items = [(snake_to_title(name), camel_to_kebab(name)) for name in module_names]
    module_items.sort(key=lambda x: x[0].lower())

    updated = replace_routes_items(content, "Classes", build_routes_items(class_items, prepend_overview=True))
    updated = replace_routes_items(updated, "Functions", build_routes_items(module_items, prepend_overview=True))

    if updated != content:
        routes_path.write_text(updated, encoding="utf-8")
        return True
    return False


def write_type_links_file(
    target: Path, class_names: List[str], enum_names: List[str]
) -> bool:
    class_items = [(name, f"/docs/classes/{camel_to_kebab(name)}") for name in class_names]
    enum_items = [(name, f"/docs/manual/constants#{camel_to_kebab(name)}") for name in enum_names]
    class_items.extend(enum_items)
    class_items.sort(key=lambda x: x[0].lower())

    lines: List[str] = []
    lines.append("export const TYPE_LINKS = {")
    for name, href in class_items:
        lines.append(f"  \"{name}\": \"{href}\",")
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
    parser = argparse.ArgumentParser(description="Generate MDX API docs from PyKraken with Griffe.")
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

    package_module = load(pkg)
    classes_by_name = collect_griffe_classes(package_module, pkg)
    modules = collect_griffe_modules(package_module, pkg)

    print(f"Loaded {pkg} with Griffe")
    print(f"Parsed {len(classes_by_name)} class(es) and {len(modules)} module(s)")

    classes_dir = out_dir / "classes"
    functions_dir = out_dir / "functions"
    classes_dir.mkdir(parents=True, exist_ok=True)
    functions_dir.mkdir(parents=True, exist_ok=True)

    # Separate enums and skip some classes
    normal_classes: List[ClassInfo] = []
    enums: List[ClassInfo] = []
    for cls in classes_by_name.values():
        if cls.module_name and cls.module_name.split(".")[-1] == "cli":
            continue
        if cls.name.split('.')[-1] == "TerrainIndices":
            continue

        if cls.is_enum:
            enums.append(cls)
        else:
            normal_classes.append(cls)

    linkable_classes = {cls.name: cls for cls in normal_classes}
    linkable_classes.update({enum.name: enum for enum in enums})

    generated_class_dirs: List[str] = []
    for cls in normal_classes:
        slug = camel_to_kebab(cls.name)
        generated_class_dirs.append(slug)
        target = classes_dir / slug / "index.mdx"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            render_class_page(cls, pkg, linkable_classes), encoding="utf-8"
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
        # Skip the main package module and internal _pykraken module
        if mod.name in [pkg, "_pykraken", "cli"]:
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
        sorted({mod.name for mod in modules.values() if mod.name not in (pkg, "_pykraken", "cli")}),
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


def should_skip_file(file_path: Path, root: Path) -> bool:
    """Check if a file should be skipped during doc generation."""
    # Skip the classes index file (but not individual class index files)
    if file_path.name == "index.mdx":
        rel_path = file_path.relative_to(root)
        if rel_path == Path("classes/index.mdx"):
            return True
    return False


if __name__ == "__main__":
    raise SystemExit(main())
