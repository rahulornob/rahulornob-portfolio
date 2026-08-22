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

## CMS production settings

Add these environment variables to the cPanel Node.js application:

```text
CMS_ADMIN_EMAIL=your-email@example.com
CMS_ADMIN_PASSWORD=use-a-long-unique-password
CMS_SESSION_SECRET=use-a-random-64-character-value
CMS_DATA_DIR=/home/endbrack/portfolio-cms
```

Generate the session secret with:

```bash
openssl rand -hex 32
```

`CMS_DATA_DIR` must be outside the Git repository. The server creates:

- `content.json` — all published website copy and content
- `media/` — images uploaded through the CMS

Back up this folder from cPanel. Code deployments never overwrite it.

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

Content changes made at `/admin` are live immediately and do not require these deployment commands.
