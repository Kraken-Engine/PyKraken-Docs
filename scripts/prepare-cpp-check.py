"""Build a syntax-check translation unit for the authored C++ guide examples.

The small snippets intentionally rely on surrounding guide variables. Fixtures
provide those variables, without running a window, loading assets, or executing
the deliberately incorrect lifetime example.
"""
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
examples=json.loads((ROOT/'examples/cpp.json').read_text())
head='''#include <kraken/KrakenEngine.hpp>
#include <array>
#include <iostream>
#include <memory>
#include <string>
#include <vector>
struct alignas(16) WindUniform { float time=0, strength=1, scale=.1f, padding=0; };
'''
params={
 'fonts-and-text':{1:'kn::Font& font',2:'kn::Font& font',6:'kn::Text& label',7:'kn::Font& font',9:'kn::Font& font, kn::Vec2 pos',10:'kn::Font& font'},
 'using-orchestrator':{i:'kn::Orchestrator& orch, kn::Texture& texture, kn::Transform& transform' for i in range(1,12)},
 'spritesheet-animation':{2:'kn::AnimationController& controller',3:'kn::Texture& sheet, kn::AnimationController& controller',5:'kn::AnimationController& controller, bool attacking, bool onFloor, kn::Vec2 velocity'},
 'vector-physics':{1:'kn::Vec2 position',4:'kn::Vec2 targetPos, kn::Vec2 myPos'},
 'using-shaders':{3:'kn::shaders::Shader& invertShader, kn::Texture& spriteTexture'},
 'texture-samplers':{1:'kn::shaders::Shader& windShader, kn::Texture& grassTexture'},
 'uniforms':{3:'kn::shaders::Shader& windShader',4:'WindUniform windUniform, std::array<float,4> tintUniform'},
 'rendering-textures':{1:'kn::Texture& texture',2:'kn::Texture& texture, kn::Texture& texA, kn::Texture& texB'},
}
pieces=[head]
count=0
for key,blocks in examples.items():
    leaf=key.split('/')[-1]
    for i,block in enumerate(blocks):
        code=re.sub(r'^#include[^\n]*\n?', '', block, flags=re.M)
        standalone='int main()' in code or (leaf=='fonts-and-text' and i==4) or (leaf=='uniforms' and i==0)
        if standalone: code=code.replace('int main()', 'int exampleMain()')
        else: code=f'void example({params.get(leaf,{}).get(i, "")}) {{\n{code}\n}}'
        pieces.append(f'namespace example_{count} {{\n#line 1 "{key}/{i}.cpp"\n{code}\n}}\n')
        count+=1
window=(ROOT/'examples/guides/getting-started/create-window/0.cpp').read_text()
pieces.append(re.sub(r'^#include[^\n]*\n?', '', window, flags=re.M))
target=ROOT/'.cache/cpp-examples.cpp'
target.parent.mkdir(exist_ok=True)
target.write_text('\n'.join(pieces))
print(f'Prepared {count+1} C++ examples for syntax validation: {target}')
