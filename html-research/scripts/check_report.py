#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def main(path):
    p = Path(path)
    if not p.is_file():
        return ["file not found: %s" % path]
    html = p.read_text(encoding="utf-8", errors="replace")
    bad = []

    for tag in re.findall(r"<script\b[^>]*>", html, re.I):
        if re.search(r"\bsrc\s*=", tag, re.I):
            bad.append("external script tag: %s" % tag[:120])
    for tag in re.findall(r"<link\b[^>]*>", html, re.I):
        href = re.search(r'href\s*=\s*["\']([^"\']+)', tag, re.I)
        if href and href.group(1).startswith(("http://", "https://", "//")):
            bad.append("external link tag: %s" % tag[:120])
    for tag in re.findall(r"<(?:img|iframe|video|audio|source|object|embed)\b[^>]*>", html, re.I):
        src = re.search(r'(?:src|data)\s*=\s*["\']([^"\']+)', tag, re.I)
        if src and src.group(1).startswith(("http://", "https://", "//")):
            bad.append("external asset: %s" % tag[:120])
    if re.search(r"@import", html, re.I):
        bad.append("css @import found")
    if re.search(r"url\(\s*['\"]?(?:https?:)?//", html, re.I):
        bad.append("css url() pointing at a remote host")
    if re.search(r"fonts\.(googleapis|gstatic)\.com", html, re.I):
        bad.append("external web font")

    if not re.search(r'<link[^>]+rel\s*=\s*["\'](?:shortcut )?icon', html, re.I):
        bad.append("no embedded favicon")
    if re.search(r"prefers-color-scheme\s*:\s*dark", html, re.I):
        bad.append("dark theme block found, report must be light only")
    if not re.search(r'<input[^>]+type\s*=\s*["\']search', html, re.I):
        bad.append("no search input")
    if 'class="card"' not in html:
        bad.append("no cards")
    if html.count("http") < 5:
        bad.append("too few source links")
    if not re.search(r"REPORT\s*=", html):
        bad.append("REPORT data object missing")

    cards = html.count('"group":')
    pros = html.count('"pros":')
    cons = html.count('"cons":')
    gaps = html.count('"gaps":')
    if cards:
        if pros < cards:
            bad.append("%d cards but only %d have pros" % (cards, pros))
        if cons < cards:
            bad.append("%d cards but only %d have cons" % (cards, cons))
        if gaps < cards * 0.6:
            bad.append("only %d of %d cards have gaps" % (gaps, cards))
    if "What The Industry Does" not in html:
        bad.append("no 'What The Industry Does' group")
    if '"groupOrder"' not in html:
        bad.append("no groupOrder set")

    if bad:
        print("FAIL %s" % p)
        for b in bad:
            print("  - %s" % b)
        return bad
    print("OK %s (%d KB, %d cards, %d pros/cons sets, %d gap lists)"
          % (p, p.stat().st_size // 1024, cards, min(pros, cons), gaps))
    return []

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: check_report.py <report.html>")
        sys.exit(2)
    sys.exit(1 if main(sys.argv[1]) else 0)
