const http = require("http");
const zlib = require("zlib");

const TARGET_PORT = 3000;
const PROXY_PORT  = 3001;

function formatHTML(raw) {
  const INDENT = "  ";
  const VOID = new Set([
    "area","base","br","col","embed","hr","img","input",
    "link","meta","param","source","track","wbr"
  ]);
  const INLINE = new Set([
    "a","abbr","b","bdo","big","button","cite","code","dfn",
    "em","i","kbd","label","map","output","q","samp","select",
    "small","span","strong","sub","sup","textarea","time","u","var"
  ]);

  // Stash script/style blocks to protect their content
  const stash = [];
  let html = raw.replace(
    /(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/gi,
    (m) => {
      stash.push(m);
      return "~~STASH" + (stash.length - 1) + "~~";
    }
  );

  // Split by HTML tags (keep delimiters)
  const tokens = html.split(/(<[^>]*>)/g).filter(t => t.length > 0);

  let out   = "";
  let depth = 0;
  const pad = (d) => INDENT.repeat(Math.max(0, d));

  for (const tok of tokens) {
    const t = tok.trim();
    if (!t) continue;

    // DOCTYPE
    if (/^<!DOCTYPE/i.test(t)) {
      out += t + "\n";
      continue;
    }

    // HTML comment
    if (/^<!--/.test(t)) {
      out += "\n" + pad(depth) + t;
      continue;
    }

    // Closing tag
    if (/^<\//.test(t)) {
      const name = (t.match(/^<\/([a-zA-Z][^\s>]*)/) || [])[1] || "";
      if (INLINE.has(name.toLowerCase())) {
        out += t;
      } else {
        depth = Math.max(0, depth - 1);
        out += "\n" + pad(depth) + t;
      }
      continue;
    }

    // Opening / void tag
    if (/^<[^!]/.test(t)) {
      const name  = (t.match(/^<([a-zA-Z][^\s>/]*)/) || [])[1] || "";
      const lower = name.toLowerCase();
      const isVoid = VOID.has(lower) || /\/>$/.test(t);
      if (INLINE.has(lower)) {
        out += t;
      } else {
        out += "\n" + pad(depth) + t;
        if (!isVoid) depth++;
      }
      continue;
    }

    // Text node (may contain stash markers)
    if (t) {
      const restored = t.replace(/~~STASH(\d+)~~/g, (m, idx) => {
        const block = stash[parseInt(idx)] || "";
        const openTag  = block.match(/^(<[^>]+>)/)?.[1]  || "";
        const closeTag = block.match(/<\/[a-z]+>$/i)?.[0] || "";
        const inner    = block.slice(openTag.length, block.length - closeTag.length).trim();
        if (!inner) return "\n" + pad(depth) + openTag + closeTag;
        return (
          "\n" + pad(depth) + openTag +
          "\n" + pad(depth + 1) + inner.replace(/\n+/g, "\n" + pad(depth + 1)).trim() +
          "\n" + pad(depth) + closeTag
        );
      });
      // Only output if different from raw stash placeholder
      const lines = restored.split('\n');
      for (const line of lines) {
        const lt = line.trim();
        if (lt) out += "\n" + pad(depth) + lt;
      }
    }
  }

  return out.trim() + "\n";
}

//  PROXY 
const server = http.createServer((clientReq, clientRes) => {
  const opts = {
    hostname : "localhost",
    port     : TARGET_PORT,
    path     : clientReq.url || "/",
    method   : clientReq.method,
    headers  : Object.assign({}, clientReq.headers, {
      host             : "localhost:" + TARGET_PORT,
      "accept-encoding": "identity"
    }),
  };

  const proxyReq = http.request(opts, (proxyRes) => {
    const ct = proxyRes.headers["content-type"] || "";

    if (!ct.includes("text/html")) {
      clientRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(clientRes);
      return;
    }

    const chunks = [];
    proxyRes.on("data", (c) => chunks.push(c));
    proxyRes.on("end", () => {
      const enc = proxyRes.headers["content-encoding"] || "";
      const buf = Buffer.concat(chunks);

      const decomp = (data, cb) => {
        if      (enc === "gzip")    zlib.gunzip(data, cb);
        else if (enc === "br")      zlib.brotliDecompress(data, cb);
        else if (enc === "deflate") zlib.inflate(data, cb);
        else                        cb(null, data);
      };

      decomp(buf, (err, unpacked) => {
        const raw  = (err ? buf : unpacked).toString("utf8");
        let   body;
        try { body = formatHTML(raw); }
        catch(e) { console.error("Format error:", e.message); body = raw; }

        const headers = Object.assign({}, proxyRes.headers);
        delete headers["content-encoding"];
        delete headers["transfer-encoding"];
        headers["content-type"]   = "text/html; charset=utf-8";
        headers["content-length"] = Buffer.byteLength(body, "utf8").toString();

        clientRes.writeHead(proxyRes.statusCode || 200, headers);
        clientRes.end(body);
      });
    });
  });

  proxyReq.on("error", (e) => {
    clientRes.writeHead(502, { "Content-Type": "text/plain" });
    clientRes.end("Proxy error: " + e.message);
  });

  clientReq.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
  console.log("\n=================================================");
  console.log("  HTML Formatting Proxy running!");
  console.log("=================================================");
  console.log("  Proxy  : http://localhost:" + PROXY_PORT + "  (formatted)");
  console.log("  Next.js: http://localhost:" + TARGET_PORT + "  (raw)");
  console.log("-------------------------------------------------");
  console.log("  Open exam page and press Ctrl+U for clean HTML");
  console.log("=================================================\n");
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE")
    console.error("ERROR: Port " + PROXY_PORT + " is already in use.");
  else
    console.error("Server error:", e);
});
