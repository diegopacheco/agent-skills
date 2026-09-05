#!/usr/bin/env python3
import re
import sys
from pathlib import Path

VERDICTS = {"true", "false", "partly", "unverifiable"}

def field_count(html, name):
    return len(re.findall(r'["\']?%s["\']?\s*:' % name, html))

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
    if 'class="card' not in html:
        bad.append("no cards")
    if not re.search(r"FACTCHECK\s*=", html):
        bad.append("FACTCHECK data object missing")

    ids = re.findall(r'["\']?id["\']?\s*:\s*["\'](F\d+)["\']', html)
    n = len(ids)
    if n < 2:
        bad.append("only %d facts, a fact check needs several" % n)
    if len(set(ids)) != n:
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        bad.append("duplicate fact ids: %s" % ", ".join(dupes))
    expected = ["F%d" % i for i in range(1, n + 1)]
    if sorted(set(ids), key=lambda x: int(x[1:])) != expected:
        bad.append("fact ids are not F1..F%d without gaps: %s" % (n, ", ".join(ids)))

    verdicts = re.findall(r'["\']?verdict["\']?\s*:\s*["\']([a-zA-Z]+)["\']', html)
    seen = [v for v in verdicts if v.lower() not in VERDICTS]
    if seen:
        bad.append("unknown verdicts: %s (allowed: %s)" % (", ".join(sorted(set(seen))), ", ".join(sorted(VERDICTS))))
    graded = [v.lower() for v in verdicts if v.lower() in VERDICTS]
    if n and len(graded) < n:
        bad.append("%d facts but only %d verdicts" % (n, len(graded)))

    for name, label in (("claim", "claim"), ("verdictLine", "verdictLine"),
                        ("where", "where"), ("confidence", "confidence")):
        c = field_count(html, name)
        if n and c < n:
            bad.append("%d facts but only %d have %s" % (n, c, label))

    links = field_count(html, "links")
    if n and links < n:
        bad.append("%d facts but only %d carry their own sources" % (n, links))
    checks = field_count(html, "checks")
    if n and checks < n:
        bad.append("%d facts but only %d were triple checked" % (n, checks))

    body = re.search(r"FACTCHECK\s*=(.*)", html, re.S)
    if body:
        blob = body.group(1)
        unsourced = 0
        for chunk in re.split(r'["\']?id["\']?\s*:\s*["\']F\d+["\']', blob)[1:]:
            v = re.search(r'["\']?verdict["\']?\s*:\s*["\']([a-zA-Z]+)["\']', chunk)
            l = re.search(r'["\']?links["\']?\s*:\s*\[\s*\{', chunk)
            if v and v.group(1).lower() == "true" and not l:
                unsourced += 1
        if unsourced:
            bad.append("%d facts ruled true with no source, they must be unverifiable" % unsourced)

    if field_count(html, "sources") < 1 or html.count("http") < 5:
        bad.append("too few sources")

    if bad:
        print("FAIL %s" % p)
        for b in bad:
            print("  - %s" % b)
        return bad

    tally = {v: graded.count(v) for v in sorted(VERDICTS)}
    print("OK %s (%d KB, %d facts — %d true, %d false, %d partly, %d unverifiable)"
          % (p, p.stat().st_size // 1024, n, tally["true"], tally["false"],
             tally["partly"], tally["unverifiable"]))
    return []

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: check_report.py <report.html>")
        sys.exit(2)
    sys.exit(1 if main(sys.argv[1]) else 0)
