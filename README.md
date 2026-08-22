# Rahul Ornob Portfolio

Next.js portfolio with a lightweight self-hosted CMS.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The CMS is at `http://localhost:3000/admin`.

Local-only login defaults:

- Email: `admin@local.test`
- Password: `portfolio`

## Local content workflow

Content and uploads are versioned with the website:

- `content/site-content.json` — website content
- `public/media/` — uploaded images

After editing and testing through the local CMS:

```bash
git add content/site-content.json public/media
git commit -m "Update portfolio content"
git push origin main
```

Production editing is disabled by default so the cPanel repository remains clean. The production CMS can still be opened as a read-only preview.

Optional production login variables:

```text
CMS_ADMIN_EMAIL=your-email@example.com
CMS_ADMIN_PASSWORD=use-a-long-unique-password
CMS_SESSION_SECRET=use-a-random-64-character-value
```

## cPanel deployment

Application root: `repositories/portfolio`

Startup file: `server.js`

After pulling a new code version:

```bash
source /home/endbrack/nodevenv/repositories/portfolio/24/bin/activate
cd /home/endbrack/repositories/portfolio
npm install --include=dev
NEXT_TEST_WASM=1 NODE_OPTIONS=--max-old-space-size=1024 npm run build
touch tmp/restart.txt
```

Local content changes become live after pushing them to GitHub and deploying the HEAD commit in cPanel.
