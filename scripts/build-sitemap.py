#!/usr/bin/env python3
"""Build from the reviewed public-page allowlist, never from a directory scan."""
import json
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.timux.site'
SM = 'http://www.sitemaps.org/schemas/sitemap/0.9'
XHTML = 'http://www.w3.org/1999/xhtml'


def render():
    pages = json.loads((ROOT / 'scripts/seo-pages.json').read_text())
    ET.register_namespace('', SM)
    ET.register_namespace('xhtml', XHTML)
    tree = ET.Element(f'{{{SM}}}urlset')
    for page in pages:
        url = ET.SubElement(tree, f'{{{SM}}}url')
        ET.SubElement(url, f'{{{SM}}}loc').text = ORIGIN + page['path']
        group = page['translationGroup']
        if group:
            translations = [p for p in pages if p['translationGroup'] == group]
            for other in translations:
                ET.SubElement(url, f'{{{XHTML}}}link', rel='alternate',
                              hreflang=other['language'], href=ORIGIN + other['path'])
            default = next(p for p in translations if p['language'] == 'zh-Hant')
            ET.SubElement(url, f'{{{XHTML}}}link', rel='alternate',
                          hreflang='x-default', href=ORIGIN + default['path'])
    # lastmod is optional. Omit until editorial dates are maintained reliably;
    # deployment time or asset-only changes must not pretend to be content updates.
    ET.indent(tree, space='  ')
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True) + b'\n'


if __name__ == '__main__':
    (ROOT / 'sitemap.xml').write_bytes(render())
    print('Generated sitemap.xml from reviewed public pages')
