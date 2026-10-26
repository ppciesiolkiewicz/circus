// Local dev server: node dev.js  →  http://localhost:4321
// Serves the repo as Vercel does (folder → index.html) and answers Range
// requests, which the browser needs to seek the mp3 to the run-in.
// No basic auth on book.html here; middleware.js only runs on Vercel.
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = __dirname, PORT = +process.env.PORT || 4321;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!req.url.split("?")[0].endsWith("/")) return res.writeHead(301, { Location: req.url + "/" }).end();
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) return res.writeHead(404).end("Not found");
  const size = fs.statSync(file).size, type = TYPES[path.extname(file)] || "application/octet-stream";
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (m) {
    const start = m[1] ? +m[1] : size - +m[2], end = m[1] && m[2] ? +m[2] : size - 1;
    res.writeHead(206, { "Content-Type": type, "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": size, "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Paradise Circus on http://localhost:${PORT}/creature/`));
