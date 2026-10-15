import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [homeZh, homeEn, zh, en, ab, analytics, css, docs] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../en/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../about/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../en/about/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-about-ab.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-conversion.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-about-ab.css', import.meta.url), 'utf8'),
  readFile(new URL('../docs/about-ab-test.md', import.meta.url), 'utf8')
]);

for (const [name, html] of [['zh', zh], ['en', en]]) {
  assert.match(html, /data-about-experiment="about_copy_v1"/, `${name}: standalone experiment page`);
  assert.equal((html.match(/data-ab-variant="A"/g) || []).length, 1, `${name}: one A variant`);
  assert.equal((html.match(/data-ab-variant="B"/g) || []).length, 1, `${name}: one B variant`);
  assert.equal((html.match(/data-track="about_cta_click"/g) || []).length, 8, `${name}: equal CTA instrumentation across both variants`);
  assert.match(html, /timux_about_variant_v1/, `${name}: stable assignment bootstrap`);
  assert.match(html, /site-about-ab\.js\?v=20261015-ab2/, `${name}: AB runtime loaded`);
}

assert.doesNotMatch(homeZh, /data-about-experiment=/, 'Chinese homepage no longer embeds About experiment');
assert.doesNotMatch(homeEn, /data-about-experiment=/, 'English homepage no longer embeds About experiment');
assert.match(homeZh, /class="nav-trigger nav-about-link" href="\/about\/"[^>]*>.*關於我們.*About Timux/);
assert.match(homeEn, /class="nav-trigger nav-about-link" href="\/en\/about\/"[^>]*>.*About Us.*關於我們/);
assert.match(homeZh, /class="mobile-nav-about" href="\/about\/"/);
assert.match(homeEn, /class="mobile-nav-about" href="\/en\/about\/"/);

assert.ok((zh.match(/Timux/g) || []).length >= 12, 'Chinese copy keeps Timux prominent');
assert.doesNotMatch(en.slice(en.indexOf('<main'), en.indexOf('</main>')), /[\u4e00-\u9fff]/, 'English About main content contains no CJK text');
assert.match(ab, /experiment_impression/);
assert.match(ab, /about_content_view/);
assert.match(ab, /about_page_engagement/);
assert.match(ab, /aboutPreview === 'true'/);
for (const event of ['experiment_page_view', 'experiment_return_visit', 'page_scroll_depth', 'feature_used', 'agent_interaction', 'contact_form_started', 'contact_draft_ready', 'lead_submit_success']) {
  assert.match(analytics, new RegExp(event), `analytics event ${event}`);
}
assert.match(analytics, /fields_completed/);
assert.match(analytics, /context_length_bucket/);
assert.match(analytics, /requestAnimationFrame\(measureDepth\)/);
assert.match(css, /\.about-variant\[hidden\]/);
assert.match(css, /html\[data-about-variant="B"\]/);
assert.match(css, /@media \(max-width: 600px\)/);
assert.match(css, /\.about-nav-links\s*\{[^}]*align-self:\s*stretch/, 'desktop About navigation keeps its underline below the label');
assert.match(docs, /standalone `\/about\/`/);
assert.match(docs, /does not persist a lead or confirm receipt/);

console.log('PASS standalone About A/B routing, localization, analytics, and documentation');
