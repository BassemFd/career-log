# CV (web version)

Source of `public/cv-bassem-fayed.pdf`, the CV behind the hero's "Download CV"
button. It's the public variant of the master CV doc: same content, **no phone
number**. Keep it coherent with the doc and with `content/experience.json`.

Regenerate after editing `cv.html` (macOS, Chrome installed):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --virtual-time-budget=5000 --print-to-pdf=public/cv-bassem-fayed.pdf "file://$PWD/cv/cv.html"
```

Check it's still one A4 page before committing.
