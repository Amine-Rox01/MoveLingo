"""Encode generated six-panel artwork as GIF/WebP; does not synthesize intermediate poses."""
import json, hashlib, shutil
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
records = sorted((ROOT/'work/animation-sources').glob('*.json'))
OUT = ROOT/'public/images/activity-motion'
OUT.mkdir(parents=True, exist_ok=True)
catalog = {a['id']: a for a in json.loads((ROOT/'work/animation-catalog.json').read_text(encoding='utf-8'))}
manifest = {}
for record in records:
    entry = json.loads(record.read_text(encoding='utf-8-sig'))
    entry['name'] = catalog[entry['id']]['name']
    source = Path(entry['source'])
    if not source.exists():
        raise FileNotFoundError(source)
    aid = entry['id']
    target = OUT/aid
    target.mkdir(exist_ok=True)
    sheet = Image.open(source).convert('RGB')
    signature = hashlib.sha256(source.read_bytes()).hexdigest()
    stamp = target/'source.sha256'
    if not stamp.exists() or stamp.read_text() != signature:
        width, height = sheet.size
        frames = []
        for row in range(3):
            for col in range(2):
                frame = sheet.crop((round(col*width/2), round(row*height/3), round((col+1)*width/2), round((row+1)*height/3)))
                frame = frame.resize((640, round(640*(height/3)/(width/2))), Image.Resampling.LANCZOS)
                frames.append(frame)
        frames[0].save(target/'poster.webp', 'WEBP', quality=88, method=4)
        sheet.save(target/'sheet.webp', 'WEBP', quality=87, method=4)
        durations = [1500, 1200, 1200, 1200, 1200, 1800]
        frames[0].save(target/'demo.webp', 'WEBP', save_all=True, append_images=frames[1:], duration=durations, loop=0, quality=85, method=4)
        palette = sheet.resize((640, round(640*sheet.height/sheet.width))).quantize(colors=192, method=Image.Quantize.MEDIANCUT)
        indexed = [frame.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG) for frame in frames]
        indexed[0].save(target/'demo.gif', save_all=True, append_images=indexed[1:], duration=durations, loop=0, disposal=2, optimize=False)
        stamp.write_text(signature)
    with Image.open(target/'poster.webp') as poster:
        fw, fh = poster.size
    manifest[aid] = {'name':entry['name'], 'number':entry['number'], 'poster':f'/images/activity-motion/{aid}/poster.webp', 'sheet':f'/images/activity-motion/{aid}/sheet.webp', 'gif':f'/images/activity-motion/{aid}/demo.gif', 'animated':f'/images/activity-motion/{aid}/demo.webp', 'frameCount':6, 'columns':2, 'rows':3, 'width':fw, 'height':fh, 'durationMs':8100}

(ROOT/'lib/activity-motion.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Encoded {len(manifest)} distinct activities as six-frame GIF and WebP loops.')

# Contact sheets are local QA artifacts, not public app assets.
qa = ROOT/'work/animation-review'
qa.mkdir(exist_ok=True)
ordered = sorted(manifest.items(), key=lambda pair:pair[1]['number'])
for offset in range(0,len(ordered),8):
    page = Image.new('RGB',(1200,4*440),'#faf8f1')
    draw = ImageDraw.Draw(page)
    for index,(aid,info) in enumerate(ordered[offset:offset+8]):
        entry = json.loads((ROOT/'work/animation-sources'/f'{aid}.json').read_text(encoding='utf-8'))
        img = Image.open(entry['source']).convert('RGB')
        img.thumbnail((580,400))
        x=(index%2)*600+10;y=(index//2)*440+30
        page.paste(img,(x,y))
        draw.text((x,y-20),f"{info['number']:02}. {info['name']}",fill='#163c32')
    page.save(qa/f'contact-{offset//8+1:02}.jpg',quality=90)
