from pathlib import Path
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')
for p in sorted(Path('contents/guides').rglob('*.mdx')):
    blocks=re.findall(r'```(?:python|py)(?=[:\s])[^\n]*\n(.*?)```',p.read_text(encoding='utf-8'),re.S)
    for i,block in enumerate(blocks):
        print(f'\n=== {p.parent.as_posix().removeprefix("contents/")}/{i}.cpp ===\n{block}')
