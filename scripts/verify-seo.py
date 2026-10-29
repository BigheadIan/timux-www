#!/usr/bin/env python3
"""Check discovery boundaries, reciprocal languages and deployable metadata.

--live additionally checks production HTTP, redirect targets and deployed bytes.
"""
import hashlib
import importlib.util
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.timux.site'
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'x': 'http://www.w3.org/1999/xhtml'}
LIVE = '--live' in sys.argv


class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.metas = {}
        self.canonicals = []
        self.alternates = {}
        self.language = None
        self.feed(text.split('</head>')[0])

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html':
            self.language = a.get('lang')
        if tag == 'meta':
            self.metas[a.get('name', a.get('property'))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonicals.append(a.get('href'))
        if tag == 'link' and a.get('rel') == 'alternate' and 'hreflang' in a:
            assert a['hreflang'] not in self.alternates, 'duplicate language alternate'
            self.alternates[a['hreflang']] = a.get('href')


def content(file, path):
    local = (ROOT / file).read_bytes()
    if LIVE:
        with urlopen(Request(ORIGIN + path, headers={'User-Agent': 'TimuxSEOCheck/1.0',
                                                   'Cache-Control': 'no-cache'}), timeout=30) as response:
            assert response.status == 200, (path, response.status)
            assert response.url == ORIGIN + path, (path, 'redirect', response.url)
            body = response.read()
            assert body == local, (path, 'deployed bytes differ')
            assert 'noindex' not in response.headers.get('X-Robots-Tag', '').lower() or file in EXCLUDED
        print('PASS production HTTP 200 and SHA256:', path, hashlib.sha256(local).hexdigest())
    return local.decode()


EXCLUDED = ['og-generator.html', 'temp/logo-concepts.html', 'share/homepage-v3-preview/index.html']
pages = json.loads((ROOT / 'scripts/seo-pages.json').read_text())
assert len({p['path'] for p in pages}) == len(pages), 'duplicate URLs'
spec = importlib.util.spec_from_file_location('sitemap_builder', ROOT / 'scripts/build-sitemap.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
assert (ROOT / 'sitemap.xml').read_bytes() == builder.render(), 'sitemap must be regenerated'
xml = ET.fromstring(content('sitemap.xml', '/sitemap.xml'))
urls = xml.findall('s:url', NS)
expected = {ORIGIN + p['path'] for p in pages}
assert {u.find('s:loc', NS).text for u in urls} == expected
assert len(urls) == len(pages), 'duplicate sitemap entries'
assert all('?' not in u and '#' not in u and '/share/' not in u and '/temp/' not in u for u in expected)
robots = content('robots.txt', '/robots.txt')
assert 'Sitemap: ' + ORIGIN + '/sitemap.xml' in robots
parser = RobotFileParser()
parser.parse(robots.splitlines())
for p in pages:
    url = ORIGIN + p['path']
    assert (ROOT / p['file']).is_file()
    head = Head(content(p['file'], p['path']))
    assert head.canonicals == [url], (p['file'], 'canonical')
    assert head.language == p['language'], (p['file'], 'language')
    assert 'noindex' not in head.metas.get('robots', '').lower(), p['file']
    for key in ['description', 'og:title', 'og:description', 'og:image', 'twitter:card']:
        assert head.metas.get(key), (p['file'], key)
    assert head.metas.get('og:url') == url
    for agent in ['Googlebot', 'Bingbot', 'OAI-SearchBot']:
        assert parser.can_fetch(agent, url), (agent, url)
    group = p['translationGroup']
    if group:
        peers = [q for q in pages if q['translationGroup'] == group]
        languages = {q['language']: ORIGIN + q['path'] for q in peers}
        languages['x-default'] = languages['zh-Hant']
        assert head.alternates == languages, (p['file'], head.alternates)
        node = next(n for n in urls if n.find('s:loc', NS).text == url)
        assert {n.get('hreflang'): n.get('href') for n in node.findall('x:link', NS)} == languages
    print('PASS canonical, metadata, language and crawl access:', p['path'])
for file in EXCLUDED:
    path = '/' + file.removesuffix('index.html') if file.endswith('/index.html') else '/' + file
    assert ORIGIN + path not in expected
    head = Head(content(file, path))
    assert 'noindex' in head.metas.get('robots', '').lower(), file
    assert parser.can_fetch('Googlebot', ORIGIN + path), 'noindex must remain crawlable'
print('PASS preview/tool exclusions; sitemap boundaries; reciprocal translations')
