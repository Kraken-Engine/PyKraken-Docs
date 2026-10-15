import rawApi from '../data/api.json';

export interface Member { name: string; id: string; kind: string; signatures: string[]; doc: string; values?: {name:string; value:string; doc:string}[] }
export interface ApiPage { language: string; slug: string; name: string; qualified: string; kind: string; doc: string; members: Member[]; counterpart: string | null; source?: string; bases?: string[] }
export const api = rawApi as {schemaVersion:number; versions:Record<string,string>; sourceCommit:string|null; pages:ApiPage[]};
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path: string) => base + '/' + path.replace(/^\//, '');
export const apiUrl = (page: ApiPage) => url(`api/${page.language}/${page.slug}/`);
const modules = import.meta.glob('../../contents/{guides,docs/manual,docs/preface}/**/*.mdx', { eager: true }) as Record<string, any>;
export const guides = Object.entries(modules).map(([path, mod]) => ({
  path: path.split('/contents/')[1].replace(/\/index\.mdx$/, ''),
  title: mod.frontmatter.title as string,
  description: (mod.frontmatter.description || '') as string,
  Content: mod.Content, headings: mod.getHeadings(),
}));
const order=['installation','create-window','build-executable','how-it-works','drawing-shapes','rendering-textures','vector-physics','fonts-and-text','spritesheet-animation','using-orchestrator','what-is-a-shader','using-shaders','uniforms','texture-samplers'];
guides.sort((a,b)=>(order.indexOf(a.path.split('/').pop()!) === -1 ? 100 : order.indexOf(a.path.split('/').pop()!))-(order.indexOf(b.path.split('/').pop()!) === -1 ? 100 : order.indexOf(b.path.split('/').pop()!)));
export const guideGroups = [
  {slug:'getting-started', title:'Getting started', color:'yellow'},
  {slug:'using-the-renderer', title:'Using the renderer', color:'mint'},
  {slug:'game-essentials', title:'Game essentials', color:'peach'},
  {slug:'implementing-shaders', title:'Implementing shaders', color:'lilac'},
];
export const friendly = (name: string) => name.replaceAll('_', ' ').replace(/^./, x=>x.toUpperCase());
export const manualGroups = [
  {title:'Engine essentials', color:'mint', paths:['the-input-types','constants','formats-and-codecs','event-attributes'].map(p=>'docs/manual/'+p)},
  {title:'About the engine', color:'lilac', paths:['docs/manual/comparison','docs/manual/changelog']},
  {title:'About these docs', color:'yellow', paths:['docs/preface','docs/preface/building']},
];
export const moduleGroups = [
  {title:'Rendering', color:'mint', icon:'rendering' as const, modules:['camera','color','draw','font','pixel_array','renderer','shaders','text','tilemap','ui','viewport','window']},
  {title:'Math & physics', color:'yellow', icon:'physics' as const, modules:['math','transform','collision','physics']},
  {title:'Animation & time', color:'lilac', icon:'animation' as const, modules:['animation_controller','orchestrator','ease','fx','time']},
  {title:'Input & events', color:'peach', icon:'input' as const, modules:['event','gamepad','input','key','mouse']},
  {title:'Engine & audio', color:'blue', icon:'audio' as const, modules:['core','log','mixer']},
];
export const memberLabel = (member: Member) => member.name==='__init__' ? 'Constructor' : member.name;
export function memberText(text: string, member: Member, page: ApiPage) {
  if (member.name!=='__init__') return text;
  return text.replace(/__init__\(self(?:,\s*)?/g, page.name+'(').replace(/\) -> None/g, ')');
}
export const escape = (text:string) => text.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function signatureHTML(text: string, page: ApiPage) {
  const candidates = api.pages.filter(p=>p.language===page.language && p.kind!=='module');
  return text.split(/([A-Za-z_][A-Za-z_0-9]*(?:(?:::|\.)[A-Za-z_][A-Za-z_0-9]*)*)/g).map(token=> {
    const leaf = token.split(/::|\./).pop();
    const matches = candidates.filter(p=>p.name.split(/::|\./).pop()===leaf);
    return matches.length===1 ? `<a href="${apiUrl(matches[0])}">${escape(token)}</a>` : escape(token);
  }).join('');
}
