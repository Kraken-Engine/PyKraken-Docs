export {};
const root = document.documentElement;
const body = document.body;
const base = body.dataset.base || '/';
type Language = 'python' | 'cpp';
const language = () => (root.dataset.language || 'python') as Language;
function applyLanguage(next: Language) {
  root.dataset.language = next;
  document.cookie = `kraken_language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.querySelectorAll<HTMLButtonElement>('[data-language-choice]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.languageChoice===next)));
  document.querySelectorAll<HTMLButtonElement>('[data-code-language]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.codeLanguage===next)));
  document.querySelectorAll<HTMLAnchorElement>('[data-api-link]').forEach(a=>a.href=`${base}api/${next}/`);
}
applyLanguage(language());
document.querySelectorAll<HTMLButtonElement>('[data-language-choice],[data-code-language]').forEach(button=>button.addEventListener('click',()=>{
  const next = (button.dataset.languageChoice || button.dataset.codeLanguage) as Language;
  applyLanguage(next);
  if(body.dataset.apiLanguage && body.dataset.apiLanguage!==next) {
    const counterpart = body.dataset.counterpart;
    location.assign(`${base}api/${next}/${counterpart ? counterpart+'/' : ''}`);
  }
}));
document.querySelector('.theme-button')?.addEventListener('click',()=>{
  root.dataset.theme = root.dataset.theme==='dark'?'light':'dark';
  localStorage.setItem('kraken-theme',root.dataset.theme);
});
const sidebar = document.querySelector<HTMLDetailsElement>('.sidebar-container');
const mobile = matchMedia('(max-width: 700px)');
if(sidebar) { sidebar.open=!mobile.matches; mobile.addEventListener('change',e=>sidebar.open=!e.matches); }
document.querySelector<HTMLInputElement>('#api-filter')?.addEventListener('input',event=>{
  const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
  document.querySelectorAll<HTMLElement>('[data-filter-name]').forEach(a=>a.hidden=!a.dataset.filterName?.includes(query));
  if(query) document.querySelectorAll<HTMLDetailsElement>('.nav-group').forEach(d=>d.open=true);
});
document.querySelectorAll<HTMLElement>('.local-tabs').forEach((tabs,index)=>{
  const select = (value:string) => {
    tabs.querySelectorAll<HTMLButtonElement>('[data-local-tab]').forEach((b,i)=>{
      const selected = b.dataset.localTab===value;
      b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;
      b.id=`tabs-${index}-${i}`;b.setAttribute('aria-controls',`panel-${index}-${i}`);
    });
    tabs.querySelectorAll<HTMLElement>('[data-local-panel]').forEach((p,i)=>{p.hidden=p.dataset.localPanel!==value;p.id=`panel-${index}-${i}`;p.setAttribute('aria-labelledby',`tabs-${index}-${i}`);});
  };
  select(tabs.dataset.default || '');
  tabs.querySelectorAll<HTMLButtonElement>('[data-local-tab]').forEach(b=>{
    b.addEventListener('click',()=>select(b.dataset.localTab!));
    b.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const buttons=Array.from(tabs.querySelectorAll<HTMLButtonElement>('[data-local-tab]'));
      const i=buttons.indexOf(b);const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      select(buttons[next].dataset.localTab!);buttons[next].focus();
    });
  });
});
async function copy(button: HTMLButtonElement, text:string) {
  const original=button.textContent;
  try { await navigator.clipboard.writeText(text);button.textContent='Copied!'; }
  catch { button.textContent='Select to copy'; }
  setTimeout(()=>button.textContent=original,1800);
}
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b,b.dataset.copy!)));
document.querySelectorAll<HTMLElement>('.prose pre').forEach(pre=>{
  const code=pre.querySelector('code');if(!code)return;
  const button=document.createElement('button');button.className='copy-code';button.textContent='Copy';button.type='button';button.setAttribute('aria-label','Copy code example');
  button.addEventListener('click',()=>copy(button,code.textContent||''));pre.prepend(button);
});
// Fix original root-relative guide links for GitHub project-page deployments.
if(base!=='/') document.querySelectorAll<HTMLElement>('.prose [href^="/"],.prose [src^="/"]').forEach(el=>{
  const attr=el.hasAttribute('href')?'href':'src';const value=el.getAttribute(attr)!;
  if(!value.startsWith('//')&&!value.startsWith(base))el.setAttribute(attr,base+value.slice(1));
});
type Entry={title:string;description:string;href:string;language:string;kind:string};
let entries:Entry[]|undefined;
let searchPromise:Promise<Entry[]>|undefined;
const dialog=document.querySelector<HTMLDialogElement>('.search-dialog')!;
const input=document.querySelector<HTMLInputElement>('#search-input')!;
const results=document.querySelector<HTMLUListElement>('#search-results')!;
const status=document.querySelector<HTMLElement>('#search-status')!;
async function getEntries() {
  if(entries)return entries;
  if(!searchPromise)searchPromise=fetch(`${base}search-index.json`).then(r=>{if(!r.ok)throw new Error('Search unavailable');return r.json();}).then(data=>entries=data).catch(error=>{searchPromise=undefined;throw error;});
  return searchPromise;
}
async function search() {
  const query=input.value.toLowerCase().trim();results.replaceChildren();
  if(!query){status.textContent='Start typing to search the manual.';return;}
  status.textContent='Searching…';
  try {
    const data=await getEntries();if(query!==input.value.toLowerCase().trim())return;
    const words=query.split(/\s+/);
    const found=data.filter(e=>(!e.language||e.language===language())&&words.every(w=>(e.title+' '+e.description).toLowerCase().includes(w)))
      .sort((a,b)=>Number(b.title.toLowerCase().includes(query))-Number(a.title.toLowerCase().includes(query))).slice(0,35);
    status.textContent=found.length?`${found.length} results · ${language()==='python'?'Python':'C++'} and guides`:'No matches. Try a shorter name or switch API language.';
    for(const entry of found){const li=document.createElement('li');const a=document.createElement('a');a.href=entry.href;const strong=document.createElement('strong');strong.textContent=entry.title;const small=document.createElement('small');small.textContent=entry.kind+' · '+entry.description.slice(0,150);a.append(strong,small);li.append(a);results.append(li);}
  }catch{status.textContent='Search could not load. Check your connection and try again.';}
}
const openSearch=()=>{dialog.showModal();input.focus();void getEntries().catch(()=>{});};
document.querySelector('.search-open')?.addEventListener('click',openSearch);
document.querySelector('[data-search-close]')?.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
document.addEventListener('keydown',event=>{
  if((event.key==='/' && !['INPUT','TEXTAREA'].includes((event.target as HTMLElement).tagName))||((event.ctrlKey||event.metaKey)&&event.key==='k')){event.preventDefault();if(!dialog.open)openSearch();}
});
input.addEventListener('input',()=>void search());
