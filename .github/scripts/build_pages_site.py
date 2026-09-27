#!/usr/bin/env python3
"""Build a GitHub Pages site that previews every branch's HTML demos.

- main  → only library.html, published at / and /library.html
- others → all files under /<branch-slug>/
- review hub → /review/
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tarfile
from html import escape
from io import BytesIO
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SITE = REPO_ROOT / "site"
SKIP_BRANCHES = {"HEAD", "gh-pages"}

# Friendly labels shown on the review hub (git branch names stay unchanged).
DISPLAY_NAMES = {
    "main": "Qi",
    "claireoconnor612-patch-1": "Claire",
}


def display_name(branch: str) -> str:
    return DISPLAY_NAMES.get(branch, branch)


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kwargs)


def list_branches() -> list[str]:
    # Use full refnames so short names like "origin" are never mistaken for branches.
    out = run(
        ["git", "for-each-ref", "--format=%(refname)", "refs/remotes/origin/"],
        cwd=REPO_ROOT,
    ).stdout
    branches: list[str] = []
    for line in out.splitlines():
        ref = line.strip()
        prefix = "refs/remotes/origin/"
        if not ref.startswith(prefix):
            continue
        name = ref[len(prefix) :]
        if not name or name in SKIP_BRANCHES:
            continue
        branches.append(name)
    return sorted(set(branches), key=str.lower)


def slugify(branch: str) -> str:
    slug = branch.replace("/", "-")
    slug = re.sub(r"[^a-zA-Z0-9._-]+", "-", slug)
    return slug.strip("-") or "branch"


def branch_has_file(branch: str, path: str) -> bool:
    result = subprocess.run(
        ["git", "cat-file", "-e", f"origin/{branch}:{path}"],
        cwd=REPO_ROOT,
        capture_output=True,
    )
    return result.returncode == 0


def show_file(branch: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"origin/{branch}:{path}"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
    ).stdout


def extract_branch(branch: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    archive = subprocess.run(
        ["git", "archive", f"origin/{branch}"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
    ).stdout
    with tarfile.open(fileobj=BytesIO(archive), mode="r:") as tar:
        # data filter avoids Python 3.14 deprecation and skips unsafe paths
        tar.extractall(dest, filter="data")
    for junk in (".github", ".git"):
        junk_path = dest / junk
        if junk_path.exists():
            shutil.rmtree(junk_path)


def find_html_pages(root: Path) -> list[str]:
    pages = sorted(
        str(p.relative_to(root)).replace("\\", "/")
        for p in root.rglob("*.html")
        if p.is_file()
    )
    return pages


def write_redirect(dest: Path, target: str) -> None:
    dest.write_text(
        f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url={escape(target)}">
  <title>Redirecting…</title>
  <link rel="canonical" href="{escape(target)}">
</head>
<body>
  <p>Redirecting to <a href="{escape(target)}">{escape(target)}</a>…</p>
</body>
</html>
""",
        encoding="utf-8",
    )


def inject_review_banner(html: str) -> str:
    """Add a review-hub banner and replace root nav with library-only links."""
    if "Browse all branches" not in html:
        banner = """
<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;background:rgba(56,189,248,0.08);border:1px solid #26354d;border-radius:8px;padding:0.45rem 0.8rem;font-size:0.78rem;margin-bottom:0.5rem;">
  <span style="color:#94a3b8;">Main branch preview — <strong style="color:#f1f5f9;">library demo only</strong></span>
  <a href="review/" style="color:#38bdf8;text-decoration:none;font-weight:600;">Browse all branches &amp; pages →</a>
</div>
"""
        html = re.sub(r"(<body[^>]*>)", r"\1\n" + banner, html, count=1, flags=re.I)

    replacement_nav = """
  <nav class="top-nav">
    <div style="font-weight: 600; color: #cbd5e1;">HarmoniCube Demos:</div>
    <div class="nav-links">
      <a href="library.html" class="nav-link active">Library Bi-Directional Demo</a>
    </div>
    <div style="font-weight: 600; color: #cbd5e1; margin-top: 6px;">Team Branches:</div>
    <div class="nav-links">
      <a href="review/" class="nav-link" style="border-color: #38bdf8; color: #38bdf8;">All branch demos →</a>
    </div>
  </nav>
"""
    html, count = re.subn(
        r"<nav class=\"top-nav\">.*?</nav>",
        replacement_nav,
        html,
        count=1,
        flags=re.I | re.S,
    )
    if not count:
        print("::warning::Could not rewrite top-nav on main library page")
    return html


def render_review(entries: list[dict]) -> str:
    entries = sorted(
        entries,
        key=lambda e: (0 if e["branch"] == "main" else 1, e["branch"].lower()),
    )
    cards: list[str] = []
    for entry in entries:
        branch = entry["branch"]
        label = entry.get("label") or display_name(branch)
        pages = entry.get("pages") or []
        note = entry.get("note") or ""

        if branch == "main":
            href = "../library.html"
        elif pages:
            slug = entry.get("slug") or ""
            href = f"../{escape(slug)}/"
        else:
            href = ""

        if href:
            action = (
                f'<a class="open-demo" href="{href}">Open demo →</a>'
            )
        else:
            action = '<p class="note"><em>No HTML pages</em></p>'

        note_html = f'<p class="note">{escape(note)}</p>' if note else ""
        cards.append(
            f"""
<article class="card">
  <h2><code>{escape(label)}</code></h2>
  {note_html}
  {action}
</article>
"""
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wicked Problem #2: Agency in Assistive AI</title>
  <style>
    :root {{
      --bg: #0b0f17;
      --panel: #131b28;
      --border: #26354d;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --accent: #38bdf8;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1e293b, var(--bg));
      color: var(--text);
      min-height: 100vh;
      padding: 2rem 1.25rem 3rem;
    }}
    .wrap {{ max-width: 960px; margin: 0 auto; }}
    h1 {{ font-size: 1.6rem; margin: 0 0 1.25rem; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.1rem;
    }}
    .card h2 {{ margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; }}
    .card code {{ font-size: 0.95rem; color: #e2e8f0; }}
    .note {{ color: var(--muted); font-size: 0.8rem; margin: 0 0 0.75rem; }}
    .open-demo {{
      display: inline-block;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }}
    .open-demo:hover {{ text-decoration: underline; }}
    a {{ color: var(--accent); text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Wicked Problem #2: Agency in Assistive AI</h1>
    <div class="grid">
      {''.join(cards)}
    </div>
  </div>
</body>
</html>
"""


def write_summary(entries: list[dict]) -> None:
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return
    lines = [
        "## Preview site built",
        "",
        "- **Site URL:** `https://crowdcamp-2026.github.io/Agency-in-assistive-AI/`",
        "- **Root (Qi / library only):** `/` and `/library.html`",
        "- **All branches & pages:** `/review/`",
        "",
        "Branches included:",
    ]
    for entry in sorted(entries, key=lambda e: (e["branch"] != "main", e["branch"].lower())):
        if entry["branch"] == "main":
            lines.append("- `main` (Qi) → `/` (library only)")
        else:
            lines.append(f"- `{entry['branch']}` → `{entry['path']}`")
    Path(summary_path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir(parents=True)
    (SITE / "review").mkdir()

    branches = list_branches()
    print("Found branches:", ", ".join(branches) or "(none)")
    entries: list[dict] = []

    # --- main: library only at site root ---
    if "main" in branches and branch_has_file("main", "library.html"):
        library = show_file("main", "library.html").decode("utf-8", errors="replace")
        library = inject_review_banner(library)
        (SITE / "library.html").write_text(library, encoding="utf-8")
        (SITE / "index.html").write_text(library, encoding="utf-8")
        entries.append(
            {
                "branch": "main",
                "label": display_name("main"),
                "slug": "",
                "path": "/",
                "pages": ["library.html"],
                "note": "",
            }
        )
        print("Main: published library.html as / and /library.html")
    elif "main" in branches:
        print("::warning::main has no library.html — root will be the review hub")

    # --- every other branch: full tree under /<slug>/ ---
    for branch in branches:
        if branch == "main":
            continue
        slug = slugify(branch)
        dest = SITE / slug
        extract_branch(branch, dest)
        pages = find_html_pages(dest)
        if not pages:
            print(f"::warning::Branch '{branch}' has no HTML pages")
        elif "index.html" not in pages:
            write_redirect(dest / "index.html", pages[0])
        entries.append(
            {
                "branch": branch,
                "label": display_name(branch),
                "slug": slug,
                "path": f"/{slug}/",
                "pages": pages,
                "note": "",
            }
        )
        print(f"Published branch '{branch}' → /{slug}/ ({len(pages)} html page(s))")

    review_html = render_review(entries)
    (SITE / "review" / "index.html").write_text(review_html, encoding="utf-8")
    (SITE / "review" / "manifest.json").write_text(
        json.dumps(entries, indent=2) + "\n", encoding="utf-8"
    )

    if not (SITE / "index.html").exists():
        (SITE / "index.html").write_text(
            review_html.replace('href="../"', 'href="review/"').replace(
                'href="../library.html"', 'href="review/"'
            ),
            encoding="utf-8",
        )
        print("Root fallback: review hub")

    write_summary(entries)
    print("Wrote site/review/index.html")
    print("Site URL: https://crowdcamp-2026.github.io/Agency-in-assistive-AI/")


if __name__ == "__main__":
    main()
