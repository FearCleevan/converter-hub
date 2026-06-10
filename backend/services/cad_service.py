from pathlib import Path

import ezdxf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend


def _render_dxf(inp: Path, out: Path, fmt: str, dpi: int = 150) -> None:
    doc = ezdxf.readfile(str(inp))
    msp = doc.modelspace()
    fig = plt.figure(figsize=(12, 9))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor("white")
    ctx = RenderContext(doc)
    Frontend(ctx, MatplotlibBackend(ax)).draw_layout(msp, finalize=True)
    fig.savefig(str(out), format=fmt, dpi=dpi, bbox_inches="tight")
    plt.close(fig)


def dxf_to_png(inp: Path, out: Path, dpi: int = 150) -> None:
    _render_dxf(inp, out, "png", dpi)


def dxf_to_svg(inp: Path, out: Path) -> None:
    _render_dxf(inp, out, "svg")


def dxf_to_pdf(inp: Path, out: Path) -> None:
    _render_dxf(inp, out, "pdf")


def svg_to_dxf(inp: Path, out: Path) -> None:
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    msp.add_text(
        f"SVG source: {inp.name}",
        dxfattribs={"height": 2.5},
    )
    doc.saveas(str(out))


def inspect_dxf(inp: Path) -> dict:
    doc = ezdxf.readfile(str(inp))
    msp = doc.modelspace()
    entity_counts: dict[str, int] = {}
    for e in msp:
        entity_counts[e.dxftype()] = entity_counts.get(e.dxftype(), 0) + 1
    return {
        "dxf_version": doc.dxfversion,
        "layers": [layer.dxf.name for layer in doc.layers],
        "entity_counts": entity_counts,
        "total_entities": sum(entity_counts.values()),
    }


def stl_to_obj(inp: Path, out: Path) -> None:
    from stl import mesh as stl_mesh
    import numpy as np

    m = stl_mesh.Mesh.from_file(str(inp))
    vert_map: dict[tuple, int] = {}
    vertices: list[tuple] = []
    faces: list[tuple] = []

    def get_idx(v: tuple) -> int:
        if v not in vert_map:
            vert_map[v] = len(vertices) + 1
            vertices.append(v)
        return vert_map[v]

    for tri in m.vectors:
        face = tuple(get_idx(tuple(float(x) for x in v)) for v in tri)
        faces.append(face)

    with open(out, "w") as f:
        f.write(f"# Converted from {inp.name}\n")
        for v in vertices:
            f.write(f"v {v[0]} {v[1]} {v[2]}\n")
        for face in faces:
            f.write(f"f {face[0]} {face[1]} {face[2]}\n")


def obj_to_stl(inp: Path, out: Path) -> None:
    from stl import mesh as stl_mesh
    import numpy as np

    vertices: list[list[float]] = []
    faces: list[list[int]] = []

    with open(inp) as f:
        for line in f:
            parts = line.split()
            if not parts:
                continue
            if parts[0] == "v":
                vertices.append([float(x) for x in parts[1:4]])
            elif parts[0] == "f":
                idxs = [int(p.split("/")[0]) - 1 for p in parts[1:]]
                for i in range(1, len(idxs) - 1):
                    faces.append([idxs[0], idxs[i], idxs[i + 1]])

    verts = np.array(vertices)
    tris = np.zeros(len(faces), dtype=stl_mesh.Mesh.dtype)
    for i, face in enumerate(faces):
        for j in range(3):
            tris["vectors"][i][j] = verts[face[j]]
    m = stl_mesh.Mesh(tris)
    m.save(str(out))


def dwg_to_dxf(inp: Path, out: Path) -> None:
    try:
        doc, _ = ezdxf.recover.readfile(str(inp))
        doc.saveas(str(out))
    except Exception as e:
        raise RuntimeError(
            f"DWG read failed (ezdxf has limited DWG support): {e}. "
            "For full DWG support, install ODA File Converter."
        )
