import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Run after npm run build. Checks every generated page, not only the homepage.
const root = path.resolve('dist');
const files = await readdir(root, { recursive: true });
const pages = files.filter(file => file.endsWith('.html'));
assert(pages.length > 0, 'Build the site before running this check.');
const html = new Map(await Promise.all(pages.map(async file => [file.replaceAll('\\','/'), await readFile(path.join(root,file),'utf8')])));
const attr = (tag,name) => new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(tag)?.[1];
const ids = source => [...source.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
let checked = 0;
for (const [file,source] of html) {
  const pageIds = ids(source);
  assert.equal(new Set(pageIds).size,pageIds.length,`${file}: duplicate IDs`);
  assert(source.includes('<h1'),`${file}: missing page heading`);
  assert.equal((source.match(/<main(?:\s|>)/g)||[]).length,1,`${file}: expected one main region`);
  assert(source.includes('aria-label="主导航"'),`${file}: missing global navigation`);
  const audioTags = [...source.matchAll(/<audio\b[^>]*>/g)];
  assert.equal(audioTags.length,1,`${file}: expected one music player`);
  assert(!/\sautoplay(?:\s|=|>)/.test(audioTags[0][0]),`${file}: music must start with user input`);
  const base = new URL(file.replace(/index\.html$/,''),'https://site.test/');
  for (const [tag] of source.matchAll(/<(?:a|img|script|link|audio)\b[^>]*>/g)) {
    if (tag.startsWith('<img')) assert(attr(tag,'alt') !== undefined,`${file}: image without alt text`);
    const ref = attr(tag,'href') || attr(tag,'src');
    if (!ref || ref.startsWith('data:')) continue;
    const url = new URL(ref.replaceAll('&amp;','&'),base);
    if (url.origin !== base.origin) continue;
    const relative = decodeURIComponent(url.pathname).replace(/^\//,'');
    const candidates = [relative,relative.replace(/\/$/,'')+'/index.html'];
    let found;
    for (const candidate of candidates) {
      try { if ((await stat(path.join(root,candidate))).isFile()) { found=candidate;break; } } catch {}
    }
    assert(found,`${file}: broken local URL ${ref}`);
    if (url.hash && html.has(found)) assert(ids(html.get(found)).includes(decodeURIComponent(url.hash.slice(1))),`${file}: missing fragment ${ref}`);
    checked++;
  }
}
const home = html.get('index.html');
for (const id of ['about','work','notes','moments','contact','curiosity-field']) assert(ids(home).includes(id), 'Missing homepage section: '+id);
assert(!home.includes('data-window'), 'The former desktop should be removed.');
assert(home.includes('data-motion-toggle'), 'Motion must be pausable.');
const projectCount = (await readdir('src/content/projects')).filter(file=>file.endsWith('.json')).length;
const articleCount = pages.filter(file=>file.replaceAll('\\','/').startsWith('blog/') && file.replaceAll('\\','/') !== 'blog/index.html').length;
assert.equal((html.get('projects/index.html').match(/data-filter-item(?:\s|>)/g)||[]).length,projectCount,'All project files must appear in the project list.');
assert.equal((html.get('blog/index.html').match(/data-filter-item(?:\s|>)/g)||[]).length,articleCount,'Published article routes must agree with the archive.');
for (const [file,source] of html) if (file.startsWith('blog/') && file !== 'blog/index.html') {
  assert(source.includes('data-giscus-config='),`${file}: missing comments`);
  assert(source.includes('id="reading-content"'),`${file}: missing article body`);
}
console.log(`PASS: ${pages.length} pages, ${checked} local links/assets, ${articleCount} articles, ${projectCount} projects, comments and unique IDs.`);
