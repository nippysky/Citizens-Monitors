/* eslint-env node */

const http = require("node:http");
const { Buffer } = require("node:buffer");
const { spawn } = require("node:child_process");

const TARGET_ORIGIN =
  process.env.DEV_API_TARGET_ORIGIN || "https://citizen-monitors.onrender.com";

const PORT = Number(process.env.DEV_API_PROXY_PORT || 8787);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
]);

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined);
    });

    req.on("error", reject);
  });
}

function buildCurlHeaders(headers) {
  const args = [];

  for (const [key, value] of Object.entries(headers)) {
    const normalizedKey = key.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(normalizedKey)) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    const headerValue = Array.isArray(value) ? value.join(", ") : String(value);

    args.push("-H", `${key}: ${headerValue}`);
  }

  return args;
}

function proxyWithCurl({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const marker = "__DEV_PROXY_STATUS__:";

    const args = [
      "-sS",
      "--location",
      "--connect-timeout",
      "20",
      "--max-time",
      "90",
      "-X",
      method,
      ...buildCurlHeaders(headers),
      "-H",
      "Accept: application/json",
      "-w",
      `\n${marker}%{http_code}`,
      url,
    ];

    if (body && method !== "GET" && method !== "HEAD") {
      args.splice(args.length - 1, 0, "--data-binary", "@-");
    }

    const child = spawn("curl", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks = [];
    const stderrChunks = [];

    child.stdout.on("data", (chunk) => {
      stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    child.stderr.on("data", (chunk) => {
      stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    child.on("error", reject);

    child.on("close", (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (code !== 0) {
        reject(
          new Error(
            stderr ||
              `curl exited with code ${code}. Upstream request did not complete.`
          )
        );
        return;
      }

      const markerIndex = stdout.lastIndexOf(marker);

      if (markerIndex === -1) {
        reject(new Error("Could not read upstream HTTP status from curl."));
        return;
      }

      const responseBody = stdout.slice(0, markerIndex).trimStart();
      const statusText = stdout.slice(markerIndex + marker.length).trim();
      const status = Number(statusText);

      if (!Number.isFinite(status)) {
        reject(new Error(`Invalid upstream status from curl: ${statusText}`));
        return;
      }

      resolve({
        status,
        body: responseBody,
      });
    });

    if (body && method !== "GET" && method !== "HEAD") {
      child.stdin.write(body);
    }

    child.stdin.end();
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(
      JSON.stringify({
        message: "Missing request URL.",
      })
    );

    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":
        "Accept,Content-Type,Authorization,X-Inhouse-Access-Token",
    });

    res.end();
    return;
  }

  const method = req.method || "GET";
  const upstreamUrl = `${TARGET_ORIGIN}${req.url}`;

  try {
    const body = await readRequestBody(req);

    console.log("[dev-api-proxy] →", method, upstreamUrl);

    const upstream = await proxyWithCurl({
      method,
      url: upstreamUrl,
      headers: req.headers,
      body,
    });

    console.log("[dev-api-proxy] ←", upstream.status, req.url);

    res.writeHead(upstream.status, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":
        "Accept,Content-Type,Authorization,X-Inhouse-Access-Token",
    });

    res.end(upstream.body);
  } catch (error) {
    console.error("[dev-api-proxy] error:", error);

    res.writeHead(502, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(
      JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : "Local API proxy failed.",
      })
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[dev-api-proxy] http://localhost:${PORT} → ${TARGET_ORIGIN}`
  );
});