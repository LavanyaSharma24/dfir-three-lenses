# Catching an Intruder Three Ways

**Live site:** https://lavanyasharma24.github.io/dfir-three-lenses/

Project site for our DFIR group project (CSE_3135 × CSE_3136, MIT Bengaluru): multi-source detection and forensic reconstruction of a simulated Windows 11 intrusion.

The site is plain HTML, CSS and vanilla JS. There is no build step and no dependencies apart from Google Fonts.

```
index.html     page content
styles.css     all styling
script.js      nav, scroll reveal, coverage-matrix tooltips, tabs, lightbox
images/        screenshots (a missing image shows a captioned placeholder)
```

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Expected screenshots

| File | Section |
|---|---|
| `images/fig01_hash_verification.png` | Methodology: chain of custody |
| `images/hayabusa-summary.png` | Results: Track 1 |
| `images/hayabusa-full-output.png` | Results: Track 1 |
| `images/custom-sigma-hits.png` | Results: Track 1 |
| `images/fig02_prefetch_attack_binaries.png` | Results: Track 2 |
| `images/fig04_taskcache_tasks.png` | Results: Track 2 |
| `images/fig03_hkcu_run_key.png` | Results: Track 2 |
| `images/fig05_hidefileext_t1112.png` | Results: Track 2 |

File names are case-sensitive on both GitHub Pages and Vercel.

## Deploy to GitHub Pages

1. Create a repository and push these files to the `main` branch, with `index.html` at the repo root:
   ```bash
   git init && git add . && git commit -m "Project site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set *Source* to **Deploy from a branch**, then choose `main` and `/ (root)`. Click **Save**.
4. After about a minute the site is live at `https://<you>.github.io/<repo>/`. All asset paths are relative, so the sub-path works without changes.

## Deploy to Vercel

**From the dashboard:** go to vercel.com → **Add New → Project**, import the GitHub repo, and set *Framework Preset* to **Other**. Leave the build command empty and the output directory as the root. Then click **Deploy**.

**From the CLI:**
```bash
npm i -g vercel
vercel          # first run links the project; accept the defaults
vercel --prod
```
