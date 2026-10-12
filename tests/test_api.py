import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('extract_api',ROOT/'scripts/extract_api.py')
extract=importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)

class ApiTests(unittest.TestCase):
    def test_standard_annotations_are_shortened(self):
        self.assertEqual(extract.clean('collections.abc.Sequence[os.PathLike | numpy.ndarray]'), 'Sequence[PathLike | ndarray]')
        self.assertEqual(extract.clean('typing.Callable[[physics.Body], builtins.bool]'), 'Callable[[physics.Body], bool]')

    def test_native_overloads_and_complex_defaults(self):
        class Native:
            __doc__='draw(value: tuple[int, int] = (1, 2)) -> None\ndraw(value: str = "a,b") -> bool\n\nOverloaded function.\n\n1. ``draw(value: tuple[int, int] = (1, 2)) -> None``\n\nFirst overload.'
        signatures,doc=extract.function_docs(Native,'draw')
        self.assertEqual(len(signatures),2)
        self.assertIn('(1, 2)',signatures[0])
        self.assertIn('"a,b"',signatures[1])
        self.assertIn('First overload',doc)

    def test_live_snapshot_is_complete_and_distinct(self):
        data=json.loads((ROOT/'src/data/api.json').read_text(encoding='utf-8'))
        extract.validate(data['pages'])
        self.assertEqual(data['versions'],{'python':'1.8.0','cpp':'1.8.0'})
        for language in ('python','cpp'):
            pages={p['slug']:p for p in data['pages'] if p['language']==language}
            self.assertIn('type-camera',pages)
            self.assertIn('camera',pages)
            self.assertGreater(len(pages['type-vec2']['members']),10)
        python={p['name']:p for p in data['pages'] if p['language']=='python'}
        for page in python.values():
            self.assertTrue(all(not m['name'].startswith('__') or m['name']=='__init__' for m in page['members']))
        self.assertTrue(all(m['kind']!='constant' for p in python.values() for m in p['members']))
        self.assertEqual(len(python['core']['members']),2)
        self.assertIn('DrawOptions',python)
        self.assertEqual(next(m for m in python['DrawOptions']['members'] if m['name']=='alpha')['signatures'],['alpha: float'])
        self.assertGreater(len(next(m for m in python['Vec2']['members'] if m['name']=='__init__')['signatures']),1)
        self.assertGreater(len(python['EventType']['members']),100)
        self.assertEqual(python['tilemap.TileLayer.Tile']['counterpart'],'type-tilemap-tilelayer-tile')

    def test_counterparts_exist_and_do_not_cross_modules_and_classes(self):
        pages=json.loads((ROOT/'src/data/api.json').read_text(encoding='utf-8'))['pages']
        for page in pages:
            if page['counterpart']:
                target=next(p for p in pages if p['language']!=page['language'] and p['slug']==page['counterpart'])
                self.assertEqual(page['kind']=='module',target['kind']=='module')

    def test_cpp_nested_types_enums_and_overloads(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/'index.xml').write_text('<doxygenindex><compound refid="test" kind="class"><name>kn::Sample</name></compound></doxygenindex>')
            (root/'test.xml').write_text('''<doxygen><compounddef prot="public"><sectiondef>
            <memberdef kind="function" prot="public"><type>void</type><name>run</name><argsstring>(int x)</argsstring></memberdef>
            <memberdef kind="function" prot="public"><type>bool</type><name>run</name><argsstring>(float x) const</argsstring></memberdef>
            <memberdef kind="function" prot="private"><type>void</type><name>secret</name></memberdef>
            <memberdef kind="enum" prot="public"><name>Mode</name><enumvalue><name>Fast</name><initializer>= 2</initializer></enumvalue></memberdef>
            </sectiondef></compounddef></doxygen>''')
            pages=extract.cpp_pages(root)
            page=next(p for p in pages if p['name']=='Sample')
            self.assertEqual(next(p for p in pages if p['name']=='Sample::Mode')['kind'],'enum')
            self.assertEqual(len(page['members']),2)
            self.assertEqual(len(page['members'][0]['signatures']),2)
            self.assertEqual(page['members'][1]['values'][0]['value'],'= 2')

if __name__=='__main__':unittest.main()
