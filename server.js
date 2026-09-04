/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");

// Load production secrets (DB creds, API keys, etc.) before Next.js is even
// required, so its own config/module evaluation already sees them in
// process.env. An absolute path keeps this correct regardless of the
// working directory the process was launched from (cPanel's Node.js App
// runner, a systemd unit, a plain `node server.js` from elsewhere, ...).
// Only ENOENT (the file legitimately doesn't exist - e.g. local dev, which
// uses .env.local via Next's own loader instead) is swallowed; any other
// error (bad permissions, a malformed file) is a real problem and should
// still fail startup loudly.
try {
  process.loadEnvFile(path.join(__dirname, ".env.production.local"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const { createServer } = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((request, response) => {
      handle(request, response);
    }).listen(port, "0.0.0.0", () => {
      console.log(`Portfolio server ready on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start the portfolio server", error);
    process.exit(1);
  });
