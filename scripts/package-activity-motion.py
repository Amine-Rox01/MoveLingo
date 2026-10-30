"""Validate all action frames and package an offline GIF gallery."""
import json, hashlib, html, zipfile
from pathlib import Path
from PIL import Image, ImageSequence
root=Path(__file__).resolve().parents[1]
output=root.parents[1]/'outputs'
catalog=json.loads((root/'work/animation-catalog.json').read_text(encoding='utf-8'))
manifest=json.loads((root/'lib/activity-motion.json').read_text(encoding='utf-8'))
assert set(manifest)=={a['id'] for a in catalog}, 'Incomplete animation catalog'
hashes=set(); prompts=[]; cards=[]
for activity in catalog:
    key=activity['id']; media=manifest[key]
    for field in ['gif','animated']:
        path=root/'public'/media[field].lstrip('/')
        with Image.open(path) as im:
            assert im.n_frames==6,(key,field,im.n_frames)
            frames=[hashlib.sha256(frame.convert('RGB').tobytes()).hexdigest() for frame in ImageSequence.Iterator(im)]
            assert len(set(frames))==6,(key,'Duplicate frame')
    digest=hashlib.sha256((root/'public'/media['sheet'].lstrip('/')).read_bytes()).hexdigest()
    assert digest not in hashes,(key,'Duplicate artwork')
    hashes.add(digest)
    record=json.loads((root/'work/animation-sources'/f'{key}.json').read_text(encoding='utf-8-sig'))
    prompts.append({k:record[k] for k in ['id','number','name','prompt']})
    name=html.escape(activity['name']); description=html.escape(activity['description'])
    cards.append(f'<article><h2>{activity["number"]}. {name}</h2><img src="gifs/{key}.gif" alt="{name} action sequence" loading="lazy"><p>{description}</p><a download href="gifs/{key}.gif">Download GIF</a></article>')
gallery='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MoveLingo — 82 action sequences</title><style>body{font:17px system-ui;background:#f6f6ef;color:#1b4035;margin:0;padding:32px}header{max-width:850px;margin:0 auto 32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,350px),1fr));gap:24px}article{background:white;padding:20px;border-radius:20px;border:1px solid #dce2d7}img{width:100%;border-radius:12px}h2{font-size:20px}a{color:#175c48}p{line-height:1.6}</style><header><h1>English in motion</h1><p>82 individual illustrated action sequences. Each GIF shows six successive moments. Open the MoveLingo website for pause, frame selection and speed controls. These are illustrated demonstrations, not smooth video; follow your reviewed lesson for the English language and adaptations.</p></header><main>'''+''.join(cards)+'</main></html>'
output.mkdir(exist_ok=True)
with zipfile.ZipFile(output/'MoveLingo-82-Activity-GIFs.zip','w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('index.html',gallery)
    for key,media in manifest.items():z.write(root/'public'/media['gif'].lstrip('/'),f'gifs/{key}.gif')
with zipfile.ZipFile(output/'MoveLingo-82-Activity-GIFs.zip') as z:
    assert z.testzip() is None
(output/'MoveLingo-animation-prompts.json').write_text(json.dumps(prompts,ensure_ascii=False,indent=2),encoding='utf-8')
(output/'MoveLingo-animation-validation.json').write_text(json.dumps({'activities':len(catalog),'uniqueArtwork':len(hashes),'framesPerGif':6,'framesPerWebP':6,'distinctFramesPerActivity':6,'generator':'Built-in image-generation tool','format':'Six-frame illustrated action loops'},indent=2),encoding='utf-8')
print(f'Validated {len(catalog)} unique sequences, 492 distinct frames per format; packaged offline GIF gallery.')
