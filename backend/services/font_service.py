from pathlib import Path
from fontTools.ttLib import TTFont


def convert_font(inp: Path, out: Path, output_fmt: str) -> None:
    font = TTFont(str(inp))
    fmt = output_fmt.lower()
    if fmt == "woff":
        font.flavor = "woff"
    elif fmt == "woff2":
        font.flavor = "woff2"
    else:
        font.flavor = None
    font.save(str(out))


def inspect_font(inp: Path) -> dict:
    font = TTFont(str(inp))
    name_table = font.get("name")
    names: dict = {}
    if name_table:
        for record in name_table.names:
            try:
                names[record.nameID] = record.toUnicode()
            except Exception:
                pass
    return {
        "family": names.get(1, ""),
        "style": names.get(2, ""),
        "full_name": names.get(4, ""),
        "version": names.get(5, ""),
        "tables": list(font.keys()),
        "glyph_count": len(font.getGlyphOrder()),
    }
