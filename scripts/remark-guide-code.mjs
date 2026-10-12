import fs from 'node:fs';
import path from 'node:path';

// Authored translations are separate from preserved guide source. Keys are the
// guide path and zero-based Python block index; no automatic code translation.
export function guideCode() {
  const translations = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'examples/cpp.json'), 'utf8'));
  return (tree, file) => {
    const source = String(file.path || '').replaceAll('\\', '/');
    const guide = source.split('/contents/')[1]?.replace(/\/index\.mdx$/, '') || '';
    let pythonIndex = 0;
    const visit = (node) => {
      const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
      const prefix = value => {
        if (typeof value !== 'string' || /^(?:[a-z]+:|\/\/|#|\?)/i.test(value)) return value;
        const [, pathname, suffix] = value.match(/^([^?#]*)(.*)$/);
        const route = pathname && !pathname.endsWith('/') && !path.posix.extname(pathname) ? pathname+'/' : pathname;
        return (route.startsWith('/') ? base : '') + route + suffix;
      };
      if (node.url) node.url = prefix(node.url);
      for (const attribute of node.attributes || []) {
        if (['href', 'src'].includes(attribute.name)) attribute.value = prefix(attribute.value);
      }
      if (!node.children) return;
      node.children = node.children.flatMap(child => {
        if (child.type !== 'code') { visit(child); return [child]; }
        const [originalLanguage, filename] = (child.lang || 'text').split(':');
        const language = originalLanguage === 'py' ? 'python' : originalLanguage;
        child.lang = language === 'plaintext' ? 'text' : language;
        if (filename) child.meta = `title="${filename}"`;
        if (language !== 'python' || !guide.startsWith('guides/')) return [child];
        const index = pythonIndex++;
        const translation = path.join(process.cwd(), 'examples', guide, `${index}.cpp`);
        const cpp = fs.existsSync(translation) ? fs.readFileSync(translation, 'utf8') : translations[guide]?.[index] || null;
        if (!cpp) throw new Error(`Missing C++ example: ${guide}/${index}`);
        const element = (name, children, attrs = []) => ({ type: 'mdxJsxFlowElement', name, attributes: attrs, children });
        const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });
        return [element('div', [
          element('div', [
            element('button', [{type:'text', value:'Python'}], [attr('type','button'), attr('data-code-language','python')]),
            element('button', [{type:'text', value:'C++'}], [attr('type','button'), attr('data-code-language','cpp')]),
          ], [attr('className','code-tabs'), attr('aria-label','Example language')]),
          element('div', [child], [attr('data-code-panel','python')]),
          element('div', cpp ? [{type:'code', lang:'cpp', value:cpp}] : [element('p', [{type:'text',value:'This guide currently has a Python example. Select Python to view it; the C++ API is available in the reference.'}])], [attr('data-code-panel','cpp')]),
        ], [attr('className','language-example')])];
      });
    };
    visit(tree);
  };
}
