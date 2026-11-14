#!/usr/bin/env python3
"""Builds the app into www/ from src/ + questions/.
Usage: python3 tools/build.py [version]
Fails loudly (exit 1) if a question line is malformed, so a bad edit never reaches users."""
import json, sys, base64, hashlib, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
VERSION = sys.argv[1] if len(sys.argv) > 1 else '6.0'
SITE = 'https://danielsharon1.github.io/new-website/'
APK = 'https://github.com/danielsharon1/new-website/releases/latest/download/lomedet.apk'
NATIVE_MIN = open(P('tools', 'native_min.txt')).read().strip()

errors = []
cfg = json.load(open(P('questions', 'courses.json'), encoding='utf8'))
data = {'courses': cfg['courses'], 'q': {}}
for c in cfg['courses']:
    path = P('questions', c['id'] + '.txt')
    if not os.path.exists(path):
        errors.append(f"חסר קובץ שאלות: questions/{c['id']}.txt"); continue
    ntop = len(c.get('topics', []))
    qs, seen = [], set()
    for n, line in enumerate(open(path, encoding='utf8'), 1):
        line = line.strip()
        if not line or line.startswith('#'): continue
        p = [x.strip() for x in line.split('|')]
        where = f"questions/{c['id']}.txt שורה {n}"
        try:
            lvl, top = int(p[0]), int(p[1])
        except Exception:
            errors.append(f"{where}: רמה ונושא חייבים להיות מספרים"); continue
        if lvl not in (1, 2, 3): errors.append(f"{where}: רמה חייבת להיות 1, 2 או 3")
        if not 0 <= top < max(ntop, 1): errors.append(f"{where}: נושא {top} לא קיים ב-courses.json")
        if len(p) == 9:
            q = {'l': lvl, 't': top, 'q': p[2], 'o': [p[3], p[4], p[5]], 'w': [p[6], p[7]], 'e': p[8]}
        elif len(p) == 6:
            if p[3] not in ('נכון', 'לא נכון'):
                errors.append(f"{where}: בשאלת נכון/לא נכון התשובה חייבת להיות 'נכון' או 'לא נכון'"); continue
            q = {'l': lvl, 't': top, 'q': p[2], 'o': [p[3], 'לא נכון' if p[3] == 'נכון' else 'נכון'], 'w': [p[4]], 'e': p[5], 'tf': 1}
        else:
            errors.append(f"{where}: יש {len(p)} חלקים – צריך 9 (אמריקאית) או 6 (נכון/לא נכון)"); continue
        if any(not x for x in [q['q']] + q['o']): errors.append(f"{where}: שדה ריק")
        key = q['q']
        if key in seen: errors.append(f"{where}: שאלה כפולה")
        seen.add(key)
        q['id'] = c['id'] + '_' + hashlib.md5(key.encode()).hexdigest()[:8]
        qs.append(q)
    data['q'][c['id']] = qs
if errors:
    print('הבנייה נכשלה – יש לתקן:'); [print(' •', e) for e in errors]; sys.exit(1)

rd = lambda *a: open(P(*a), encoding='utf8').read()
avatar = base64.b64encode(open(P('src', 'avatar.jpg'), 'rb').read()).decode()
js = (rd('src', 'app.js').replace('__DATA__', json.dumps(data, ensure_ascii=False))
      .replace('__AVATAR__', avatar).replace('__VERSION__', VERSION).replace('__SITE__', SITE))
js += """
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
if('serviceWorker' in navigator && location.protocol.startsWith('http') && !(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform())){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
"""
note = 'התקנה כאפליקציה: באייפון (Safari) – כפתור השיתוף ← "הוסף למסך הבית". באנדרואיד – כפתור "הורדת האפליקציה לאנדרואיד" למעלה.'
body = rd('src', 'body.html').replace('__INSTALLNOTE__', note).replace('__APKURL__', APK)
head = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1f3b34">
<title>לומדת למבחן</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap" rel="stylesheet">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/favicon.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="לומדת למבחן">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
"""
html = f'<!DOCTYPE html>\n<html lang="he" dir="rtl">\n<head>\n{head}<style>\n{rd("src","base.css")}\n{rd("src","extra.css")}\n</style>\n</head>\n<body>\n{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n'
open(P('www', 'index.html'), 'w', encoding='utf8').write(html)
sw = rd('src', 'sw.js').replace('__VERSION__', VERSION)
open(P('www', 'sw.js'), 'w', encoding='utf8').write(sw)
json.dump({'version': VERSION, 'native_min': NATIVE_MIN, 'apk': APK}, open(P('www', 'version.json'), 'w'), ensure_ascii=False)
total = sum(len(v) for v in data['q'].values())
print(f'✓ נבנתה גרסה {VERSION}: {len(data["courses"])} קורסים, {total} שאלות')
