import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root);const html=files.filter(f=>f.endsWith('.html'));
const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
const failures=new Set();let links=0;
for(const file of html){
  const content=fs.readFileSync(file,'utf8');
  for(const match of content.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
    const href=match[1].split('#')[0].split('?')[0];
    if(!href.startsWith('/')||href.startsWith('//'))continue;
    let relative=decodeURIComponent(href);
    if(base&&relative.startsWith(base+'/'))relative=relative.slice(base.length);
    const target=path.join(root,relative.replace(/^\//,''));
    links++;
    if(fs.existsSync(path.join(target,'index.html'))&&!href.endsWith('/'))failures.add(`${path.relative(root,file)} -> missing trailing slash: ${href}`);
    if(!fs.existsSync(target)&&!fs.existsSync(path.join(target,'index.html')))failures.add(`${path.relative(root,file)} -> ${href}`);
  }
  if(!content.includes('<title>'))failures.add(`${file}: no title`);
}
const data=JSON.parse(fs.readFileSync('src/data/api.json','utf8'));
for(const page of data.pages){
  const file=path.join(root,'api',page.language,page.slug,'index.html');
  if(!fs.existsSync(file)){failures.add(`Missing API page ${file}`);continue;}
  const content=fs.readFileSync(file,'utf8');
  for(const member of page.members)if(!content.includes(`id="${member.id}"`))failures.add(`Missing member ${page.name}.${member.name}`);
}
const guideFiles=walk('contents/guides').filter(f=>f.endsWith('.mdx'));
for(const file of guideFiles){const relative=file.replaceAll('\\','/').replace(/^contents\//,'').replace(/\.mdx$/,'.html');if(!fs.existsSync(path.join(root,relative)))failures.add(`Missing preserved guide: ${file}`);}
if(failures.size){console.error([...failures].slice(0,80).join('\n'));throw new Error(`${failures.size} broken build checks`);}
const js=files.filter(f=>f.endsWith('.js'));const bytes=js.reduce((n,f)=>n+fs.statSync(f).size,0);
console.log(`Verified ${html.length} pages, ${links} internal links/assets, ${guideFiles.length} preserved guides, and every generated API member.`);
console.log(`Total emitted JavaScript: ${(bytes/1024).toFixed(1)} KiB across ${js.length} files. Search index is fetched on demand.`);
