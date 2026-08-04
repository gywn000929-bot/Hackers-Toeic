#!/usr/bin/env node
/**
 * src/template.html + src/data/*.js → 단일 HTML 파일로 묶습니다.
 *   node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'opic_ih_daily_english.html');
const DATA_DIR = path.join(ROOT, 'src', 'data');

const template = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js')).sort();
const data = files.map(f => fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).join('\n');

if (!template.includes('/*__DATA__*/')) {
  console.error('템플릿에 /*__DATA__*/ 자리표시자가 없습니다.');
  process.exit(1);
}

const html = template.replace('/*__DATA__*/', () => data);
fs.writeFileSync(OUT, html, 'utf8');

/* 집계 */
const sandbox = { window: { TOPICS: [] } };
new Function('window', data)(sandbox.window);
const topics = sandbox.window.TOPICS;
let w = 0, p = 0, s = 0;
topics.forEach(t => { w += t.words.length; p += t.phrases.length; s += t.sents.length; });

console.log(`파일     : ${files.length}개 데이터 → ${path.basename(OUT)} (${(html.length / 1024).toFixed(0)} KB)`);
console.log(`주제     : ${topics.length}개`);
console.log(`단어     : ${w}`);
console.log(`표현·숙어: ${p}`);
console.log(`문장     : ${s}`);
console.log(`합계     : ${w + p + s}개`);

topics.forEach((t, i) => {
  const n = t.words.length + t.phrases.length + t.sents.length;
  console.log(`  ${String(i + 1).padStart(2, '0')} ${t.icon} ${t.title.padEnd(18, ' ')} ${String(n).padStart(3)}개 (단어 ${t.words.length} / 표현 ${t.phrases.length} / 문장 ${t.sents.length})`);
});
