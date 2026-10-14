import {api, apiUrl, guides, url, memberLabel, memberText} from '../lib/content';
export function GET() {
  const entries = [
    ...guides.map(g=>({title:g.title,description:g.description,href:url(g.path+'/'),language:'',kind:'Guide'})),
    ...api.pages.flatMap(p=>[
      {title:p.qualified,description:p.doc.slice(0,180),href:apiUrl(p),language:p.language,kind:p.kind},
      ...p.members.map(m=>({title:p.qualified+(p.language==='cpp'?'::':'.')+memberLabel(m),description:memberText(m.signatures[0] || '',m,p),href:apiUrl(p)+'#'+m.id,language:p.language,kind:m.kind})),
    ]),
  ];
  return new Response(JSON.stringify(entries),{headers:{'Content-Type':'application/json'}});
}
