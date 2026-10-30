"""Refresh the user's runnable copy without touching local credentials or dependencies."""
import os, shutil
from pathlib import Path
source=Path(__file__).resolve().parents[1]
target=source.parents[1]/'outputs/MoveLingo-Gemini-ready'
assert target.is_dir(),target
skip={'node_modules','dist','.git','.next','.vinext','.wrangler','.sites-runtime','work','coverage','.agents','.codex'}
count=0
for base,dirs,files in os.walk(source):
    dirs[:]=[d for d in dirs if d not in skip]
    for name in files:
        if name.endswith('.tsbuildinfo') or (name.startswith('.dev.vars') and name!='.dev.vars.example') or name.startswith('.env') or name.endswith('.pem') or name.startswith('_qa'):continue
        path=Path(base)/name;dest=target/path.relative_to(source)
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(path,dest);count+=1
print(f'Refreshed {count} project files; local credential files were preserved.')
