#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, subprocess, tempfile
root = Path.cwd()
pages = ['index.html','en/index.html','about/index.html','en/about/index.html','method/index.html','demo/index.html','demo/customer-service/index.html']
class Document(HTMLParser):
 def __init__(self):
  super().__init__(); self.refs=[]; self.ids=set(); self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:
   assert a['id'] not in self.ids, ('duplicate id', a['id'])
   self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  for key in ['href','src']:
   if key in a:self.refs.append(a[key])
documents={}
for name in pages:
 s=(root/name).read_text();d=Document();d.feed(s);documents[name]=d
 expected_h1 = 2 if name in ['about/index.html','en/about/index.html'] else 1
 assert d.h1==expected_h1,(name,'h1 count')
 expected_lang = 'en' if name == 'en/index.html' else 'zh-Hant'
 assert f'lang="{expected_lang}"' in s,(name,'language')
 for forbidden in ['All systems operational','Policy coverage','待批准','MapleHome','SoFun']:
  assert forbidden not in s,(name,forbidden)
 for body in re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',s,re.S):
  if not body.strip() or body.lstrip().startswith('{'):continue
  with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as tmp:
   tmp.write(body);tmp.flush();subprocess.run(['node','--check',tmp.name],check=True)
for name,d in documents.items():
 for ref in d.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=(root/unquote(u.path).lstrip('/')) if u.path.startswith('/') else ((root/name).parent/unquote(u.path))
  if not u.path:target=root/name
  if target.is_dir():target=target/'index.html'
  assert target.is_file(),(name,'missing local target',ref)
  if u.fragment and target.suffix=='.html':
   other=Document();other.feed(target.read_text());assert unquote(u.fragment) in other.ids,(name,'missing anchor',ref)
 print('PASS HTML, scripts, assets, links:',name)
PY
node --check assets/site-back-to-top.js
node --check assets/site-conversion.js
node --check assets/site-story.js
node --check assets/site-case-replay.js
node --check assets/site-case-journey.js
node --check assets/site-orbit.js
node --check assets/site-mega-nav.js
node --check assets/site-mobile-parity.js
node --check assets/site-about-ab.js
node --check assets/site-case-switcher.js
node --check tests/homepage-v4-smoke.mjs
node --check tests/homepage-v17-motion.mjs
node --check tests/homepage-en-smoke.mjs
node --check tests/homepage-v58-mobile-solution-carousel.mjs
node --check tests/homepage-v59-mobile-manual-carousels.mjs
node --check tests/homepage-v65-hero-scenes.mjs
node --check tests/homepage-v70-image-loading.mjs
node tests/about-ab-test.mjs
node --check scripts/build-en-home.mjs
node --check scripts/build-en-about.mjs
git diff --check -- index.html en/index.html method demo assets/site-base.css assets/site-conversion.css assets/site-conversion.js assets/site-mobile-parity.css assets/site-mobile-parity.js assets/site-about-ab.css assets/site-about-ab.js docs tests scripts
