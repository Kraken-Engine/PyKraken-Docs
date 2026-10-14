import { Marked } from 'marked';
import { escape } from './content';
const markdown = new Marked({renderer:{html:({text})=>escape(text)}});
export function docHTML(text:string) {
  // Native Python comments use Google-style sections. Keep their parameter
  // descriptions readable instead of allowing indentation to become code.
  const lines=text.split('\n');let inSection=false;
  const converted=lines.map(line=>{
    const section=line.match(/^(Args|Arguments|Parameters|Returns|Raises|Attributes|Methods|Note|Notes|Example|Examples):\s*$/);
    if(section){inSection=true;return `\n#### ${section[1]}\n`;}
    if(inSection && /^\S/.test(line) && line.trim())inSection=false;
    if(inSection){
      const param=line.match(/^\s+([\w.*]+)(?:\s+\(([^)]+)\))?:\s*(.*)$/);
      if(param)return `- **${param[1]}**${param[2]?' (`'+param[2]+'`)':''} — ${param[3]}`;
      return line.replace(/^ {4}/,'');
    }
    return line;
  }).join('\n');
  return markdown.parse(converted,{async:false});
}
