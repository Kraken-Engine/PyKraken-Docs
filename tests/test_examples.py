import json
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]

class ExampleTests(unittest.TestCase):
    def test_every_python_block_has_a_cpp_example(self):
        examples=json.loads((ROOT/'examples/cpp.json').read_text())
        count=0
        for guide in (ROOT/'contents/guides').rglob('*.mdx'):
            blocks=re.findall(r'```(?:python|py)(?=[:\s])[^\n]*\n(.*?)```',guide.read_text(encoding='utf-8'),re.S)
            key=guide.parent.relative_to(ROOT/'contents').as_posix()
            for i,_ in enumerate(blocks):
                file=ROOT/'examples'/key/f'{i}.cpp'
                translated=file.read_text() if file.exists() else examples.get(key,[])[i] if i<len(examples.get(key,[])) else ''
                self.assertTrue(translated.strip(),f'Missing C++ example {key}/{i}')
                count+=1
        self.assertGreater(count,50)

    def test_cpp_qualified_symbols_exist_in_source_snapshot(self):
        data=json.loads((ROOT/'src/data/api.json').read_text(encoding='utf-8'))
        symbols=set()
        for page in data['pages']:
            if page['language']!='cpp':continue
            symbols.add(page['qualified'])
            symbols.update(page['qualified']+'::'+name for name in page.get('omittedConstants',[]))
            for member in page['members']:
                symbols.add(page['qualified']+'::'+member['name'])
        examples=json.loads((ROOT/'examples/cpp.json').read_text())
        for key,blocks in examples.items():
            for i,block in enumerate(blocks):
                for name in re.findall(r'kn::\w+(?:::\w+)*',block):
                    self.assertIn(name,symbols,f'Unknown symbol in {key}/{i}: {name}')

if __name__=='__main__':unittest.main()
