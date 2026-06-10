import base64
import csv
import io
import json
from pathlib import Path

import xmltodict
import yaml


def json_format(raw: str, indent: int = 2, minify: bool = False) -> str:
    obj = json.loads(raw)
    if minify:
        return json.dumps(obj, separators=(",", ":"))
    return json.dumps(obj, indent=indent, ensure_ascii=False)


def json_to_csv(raw: str) -> str:
    data = json.loads(raw)
    if not isinstance(data, list) or not data:
        raise ValueError("JSON must be a non-empty array of objects.")
    keys = list(data[0].keys())
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=keys, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(data)
    return buf.getvalue()


def json_to_yaml(raw: str) -> str:
    return yaml.dump(json.loads(raw), default_flow_style=False, allow_unicode=True)


def json_to_xml(raw: str) -> str:
    data = json.loads(raw)
    return xmltodict.unparse({"root": data}, pretty=True)


def csv_to_json_str(inp: Path) -> str:
    with open(inp, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    return json.dumps(rows, indent=2, ensure_ascii=False)


def xml_to_json(raw: str) -> str:
    return json.dumps(xmltodict.parse(raw), indent=2, ensure_ascii=False)


def yaml_to_json(raw: str) -> str:
    return json.dumps(yaml.safe_load(raw), indent=2, ensure_ascii=False)


def base64_encode_text(text: str) -> str:
    return base64.b64encode(text.encode("utf-8")).decode("ascii")


def base64_encode_bytes(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def base64_decode(encoded: str) -> bytes:
    return base64.b64decode(encoded)


def html_format(raw: str) -> str:
    try:
        from bs4 import BeautifulSoup
        return BeautifulSoup(raw, "html.parser").prettify()
    except ImportError:
        raise RuntimeError("beautifulsoup4 not installed. Run: pip install beautifulsoup4")


def svg_to_code(svg_bytes: bytes) -> str:
    return svg_bytes.decode("utf-8")


def code_to_svg(code: str) -> bytes:
    return code.encode("utf-8")
