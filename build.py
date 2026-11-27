"""Pre-fill English text into index.html so the page paints and indexes before JS runs.
Run after editing strings: python build.py  (reads strings.js, rewrites index.html in place)."""
import html, json, re
S = json.loads(open("strings.js", encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))["en"]
page = open("index.html", encoding="utf-8").read()

def fill(m):
    key = m.group(3)
    if key not in S:
        raise SystemExit(f"missing string: {key}")
    return f"{m.group(1)}{html.escape(S[key], quote=False)}</{m.group(2)}>"

# elements with data-t="key" whose content is plain text (no child tags)
page, n = re.subn(r'(<(\w+)\b[^>]*\bdata-t="([^"]+)"[^>]*>)[^<]*</\2>', fill, page)
open("index.html", "w", encoding="utf-8", newline="\n").write(page)
print(f"filled {n} elements")
