Place the font files here to host fonts locally for the app.

Recommended files (woff2):
- Baloo2-Regular.woff2
- Baloo2-Bold.woff2
- Sarabun-Regular.woff2
- Sarabun-Bold.woff2

Where to get them:
- Baloo 2 (Google Fonts): https://fonts.google.com/specimen/Baloo+2
- Sarabun (Google Fonts): https://fonts.google.com/specimen/Sarabun

Quick curl example (run from project root):

```bash
# Baloo 2 Regular (example URL - verify actual woff2 link from Google Fonts css)
curl -L -o public/fonts/Baloo2-Regular.woff2 "<woff2-url-for-baloo-regular>"
curl -L -o public/fonts/Baloo2-Bold.woff2 "<woff2-url-for-baloo-bold>"
curl -L -o public/fonts/Sarabun-Regular.woff2 "<woff2-url-for-sarabun-regular>"
curl -L -o public/fonts/Sarabun-Bold.woff2 "<woff2-url-for-sarabun-bold>"
```

After placing the files, rebuild the app:

```bash
npm run build
npm run deploy
```

If you want, I can fetch the font files for you and add them to the repo (I will need permission to download and include them). Otherwise follow the steps above to add them manually.