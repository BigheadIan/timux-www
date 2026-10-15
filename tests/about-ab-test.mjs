import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [zh, en, ab, analytics, css, docs] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../en/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-about-ab.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-conversion.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/site-about-ab.css', import.meta.url), 'utf8'),
  readFile(new URL('../docs/about-ab-test.md', import.meta.url), 'utf8')
]);

for (const [name, html] of [['zh', zh], ['en', en]]) {
  assert.match(html, /data-about-experiment="about_copy_v1"/, `${name}: experiment section`);
  assert.equal((html.match(/data-ab-variant="A"/g) || []).length, 1, `${name}: one A variant`);
  assert.equal((html.match(/data-ab-variant="B"/g) || []).length, 1, `${name}: one B variant`);
  assert.equal((html.match(/data-track="about_cta_click"/g) || []).length, 4, `${name}: equal CTA instrumentation`);
  assert.match(html, /timux_about_variant_v1/, `${name}: stable assignment bootstrap`);
  assert.match(html, /site-about-ab\.js\?v=20261015-ab1/, `${name}: AB runtime loaded`);
}

assert.ok((zh.match(/Timux/g) || []).length >= 12, 'Chinese copy keeps Timux prominent');
assert.doesNotMatch(en.slice(en.indexOf('id="about"'), en.indexOf('id="solutions"')), /[\u4e00-\u9fff]/, 'English About copy contains no CJK text');
assert.match(ab, /experiment_impression/);
assert.match(ab, /about_section_view/);
assert.match(ab, /about_section_engagement/);
for (const event of ['experiment_page_view', 'experiment_return_visit', 'page_scroll_depth', 'agent_interaction', 'contact_form_started', 'contact_draft_ready']) {
  assert.match(analytics, new RegExp(event), `analytics event ${event}`);
}
assert.match(css, /\.about-variant\[hidden\]/);
assert.match(css, /@media \(max-width: 600px\)/);
assert.match(docs, /does not persist a lead or confirm receipt/);

console.log('PASS About copy A/B structure, localization, analytics, and documentation');
