# minecraft-anim

Анімація Minecraft-скінів у стилі TikTok-едітів: модель → рендер → монтаж зі звуком.

## Модель зі скіна

```bash
python3 tools/make_bbmodel.py skins/hero.png models/hero.bbmodel            # класична (зовнішній шар — коробки)
python3 tools/make_bbmodel.py skins/hero.png models/hero_3d.bbmodel --layers 3d   # зовнішній шар — вокселі
```

Файли `.bbmodel` відкриваються в Blockbench. Кістки: `root > body > (head, right_arm, left_arm)`, `right_leg`, `left_leg`.

## Рендер

```bash
npm install
node render/render.mjs shots/preview_turntable.mjs out/frames --mp4 out/preview_turntable.mp4
node render/render.mjs shots/model_sheet.mjs out/sheet
```

Шот (`shots/*.mjs`) описує камеру й пози кісток для кожного кадру; `render/scene.js` — світло й стилі (`dark`, `studio`).

## Монтаж

```bash
node render/render.mjs shots/intro_solo.mjs out/intro_frames
python3 tools/compose.py edit/intro.json out/intro_frames out/intro_solo.mp4
```

`edit/intro.json` — фрагмент пісні, рядки субтитрів (час появи й до коли друкуються), склейки та спалахи.
Компоновка: кадр посередині, розмиті копії зверху/знизу, піксельні субтитри (шрифт Tiny5, OFL).

## Аналіз пісні

```bash
pip install librosa soundfile matplotlib
python3 audio/analyze.py audio/song.m4a --lyrics audio/lyrics.txt --out out/audio
```

Дає `timeline.json` (темп, удари, сильні долі, гучність, частини пісні, що повторюються), `analysis.png` і `lyrics.srt`.
Таймінги рядків у `lyrics.srt` — лише чернетка: вони оцінені по вокалу без розпізнавання мови.
Аудіо в репозиторій не комітиться (`.gitignore`).
