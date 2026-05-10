#!/usr/bin/env node
/* eslint-env node */

const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.DEV_API_PROXY_PORT || 8787);
const TARGET_ORIGIN =
  process.env.DEV_API_TARGET_ORIGIN || "https://citizen-monitors.onrender.com";

const REQUEST_TIMEOUT_MS = Number(process.env.DEV_API_TIMEOUT_MS || 180000);
const MAX_BODY_BYTES = Number(process.env.DEV_API_MAX_BODY_BYTES || 60 * 1024 * 1024);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");

  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) return;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (!key || process.env[key]) return;

      process.env[key] = value.replace(/^["']|["']$/g, "");
    });
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const INHOUSE_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN ||
  process.env.INHOUSE_ACCESS_TOKEN ||
  "";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Accept,Content-Type,Authorization,X-Inhouse-Access-Token",
  };
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...getCorsHeaders(),
  });

  res.end(JSON.stringify(payload));
}

function buildUpstreamUrl(req) {
  const localUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  return new URL(`${localUrl.pathname}${localUrl.search}`, TARGET_ORIGIN);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > MAX_BODY_BYTES) {
        reject(
          new Error(
            `Request body too large. Max ${Math.round(
              MAX_BODY_BYTES / 1024 / 1024
            )}MB allowed by local proxy.`
          )
        );

        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);

    req.on("aborted", () => {
      reject(new Error("Client aborted the request."));
    });
  });
}

function buildProxyHeaders(req, upstreamUrl, bodyBuffer) {
  const headers = { ...req.headers };

  Object.keys(headers).forEach((headerName) => {
    const lowerHeaderName = headerName.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(lowerHeaderName)) {
      delete headers[headerName];
    }
  });

  headers.host = upstreamUrl.host;
  headers.accept = headers.accept || "application/json";
  headers["accept-encoding"] = "identity";
  headers["content-length"] = String(bodyBuffer.length);
  headers["x-forwarded-host"] = req.headers.host || `localhost:${PORT}`;
  headers["x-forwarded-proto"] = "http";

  if (INHOUSE_ACCESS_TOKEN && !headers["x-inhouse-access-token"]) {
    headers["x-inhouse-access-token"] = INHOUSE_ACCESS_TOKEN;
  }

  return headers;
}

async function proxyRequest(req, res) {
  const upstreamUrl = buildUpstreamUrl(req);
  const isHttps = upstreamUrl.protocol === "https:";

  let bodyBuffer;

  try {
    bodyBuffer = await readRequestBody(req);
  } catch (error) {
    console.error("[dev-api-proxy] body read error:", error);

    writeJson(res, 413, {
      message:
        error instanceof Error
          ? error.message
          : "Unable to read request body.",
    });
    return;
  }

  const options = {
    protocol: upstreamUrl.protocol,
    hostname: upstreamUrl.hostname,
    port: upstreamUrl.port || (isHttps ? 443 : 80),
    method: req.method,
    path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
    headers: buildProxyHeaders(req, upstreamUrl, bodyBuffer),
    timeout: REQUEST_TIMEOUT_MS,
  };

  console.log(`[dev-api-proxy] → ${req.method} ${upstreamUrl.href}`);

  const client = isHttps ? https : http;

  const upstreamReq = client.request(options, (upstreamRes) => {
    const statusCode = upstreamRes.statusCode || 502;

    console.log(
      `[dev-api-proxy] ← ${statusCode} ${req.method} ${upstreamUrl.pathname}`
    );

    const responseHeaders = {
      ...upstreamRes.headers,
      ...getCorsHeaders(),
    };

    Object.keys(responseHeaders).forEach((headerName) => {
      if (HOP_BY_HOP_HEADERS.has(headerName.toLowerCase())) {
        delete responseHeaders[headerName];
      }
    });

    res.writeHead(statusCode, responseHeaders);
    upstreamRes.pipe(res);
  });

  upstreamReq.setTimeout(REQUEST_TIMEOUT_MS, () => {
    upstreamReq.destroy(
      new Error(`Upstream timeout after ${REQUEST_TIMEOUT_MS}ms`)
    );
  });

  upstreamReq.on("error", (error) => {
    console.error("[dev-api-proxy] upstream error:", error);

    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    writeJson(res, 502, {
      message:
        error instanceof Error ? error.message : "Local API proxy failed.",
    });
  });

  upstreamReq.end(bodyBuffer);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    writeJson(res, 400, {
      message: "Missing request URL.",
    });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, getCorsHeaders());
    res.end();
    return;
  }

  proxyRequest(req, res).catch((error) => {
    console.error("[dev-api-proxy] fatal error:", error);

    if (!res.headersSent) {
      writeJson(res, 502, {
        message:
          error instanceof Error
            ? error.message
            : "Local API proxy failed.",
      });
    }
  });
});

server.timeout = REQUEST_TIMEOUT_MS;

server.on("clientError", (error, socket) => {
  console.error("[dev-api-proxy] client error:", error.message);

  if (!socket.destroyed) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev-api-proxy] http://localhost:${PORT} → ${TARGET_ORIGIN}`);
  console.log(
    `[dev-api-proxy] inhouse token ${
      INHOUSE_ACCESS_TOKEN ? "loaded" : "missing"
    }`
  );
  console.log(
    `[dev-api-proxy] max body ${Math.round(MAX_BODY_BYTES / 1024 / 1024)}MB`
  );
});