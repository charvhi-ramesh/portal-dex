// Production smoke runner. Without --base it requires a prior `npm run build`.
// Usage: node scripts/smoke.ts [--base <url>] route:/path "expected text" ... [route404:/other "expected" ...]
// (route tokens carry a `route:` prefix because Git Bash rewrites bare leading-slash arguments.)
// `route:/path` expects status 200; `routeNNN:/path` (a three-digit status, e.g. `route404:/path`)
// expects that status. An expectation starting with "!" and more text, e.g. "!absent text", asserts
// the body does NOT contain the rest. The expectation "@image" passes when the response
// content-type starts with "image/". A group with an explicit status may have no expectations
// (the status is the check); a plain `route:` group needs at least one.
// --base <url> checks an already running site instead of starting `next start`. The base must be
// https, or http on 127.0.0.1 or localhost only, with no credentials, query or hash; anything else
// is a usage error (exit 2) before any request (T-03-16).
// Without --base it starts `next start` on 127.0.0.1 (free OS-assigned port unless SMOKE_PORT is set),
// fetches each route and checks the status plus every expectation. Prints SMOKE OK (0) or SMOKE FAIL (1).
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { join } from "node:path";

type Group = { route: string; status: number; explicitStatus: boolean; expected: string[] };
type Parsed = { groups: Group[]; base: string | null };

const USAGE =
  'Usage: node scripts/smoke.ts [--base <url>] route:/path "expected text" "!absent text" "@image" ... [route404:/path "expected" ...]';
const ROUTE_TOKEN = /^route([0-9]{3})?:(.*)$/;
const HOST = "127.0.0.1";

// Returns the base without a trailing slash, or null when it is not allowed.
function parseBase(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const localHttp =
    url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost");
  if (url.protocol !== "https:" && !localHttp) return null;
  if (url.username !== "" || url.password !== "" || url.search !== "" || url.hash !== "") return null;
  if (value.includes("?") || value.includes("#")) return null; // an empty query or hash
  return url.origin + url.pathname.replace(/\/$/, "");
}

function parseArgs(argv: string[]): Parsed | null {
  const groups: Group[] = [];
  let base: string | null = null;
  let args = argv;
  if (args[0] === "--base") {
    if (args.length < 2) return null;
    base = parseBase(args[1]);
    if (base === null) return null;
    args = args.slice(2);
  }
  for (const arg of args) {
    const token = ROUTE_TOKEN.exec(arg);
    if (token) {
      groups.push({
        route: token[2],
        status: token[1] ? Number(token[1]) : 200,
        explicitStatus: token[1] !== undefined,
        expected: [],
      });
    } else if (groups.length === 0) {
      return null; // an argument before the first route token
    } else {
      groups[groups.length - 1].expected.push(arg);
    }
  }
  if (groups.length === 0) return null;
  const incomplete = (g: Group) =>
    g.route === "" || (!g.explicitStatus && g.expected.length === 0);
  if (groups.some(incomplete)) return null;
  return { groups, base };
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, HOST, () => {
      const port = (server.address() as AddressInfo).port;
      server.close(() => resolve(port));
    });
  });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function waitUntilReady(origin: string): Promise<boolean> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      await fetch(`${origin}/`);
      return true; // any HTTP response means the server is up
    } catch {
      await sleep(250);
    }
  }
  return false;
}

function stopServer(pid: number | undefined): void {
  if (pid === undefined) return;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
    }
  } catch {
    // already gone
  }
}

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed === null) {
    console.error(USAGE);
    return 2;
  }
  const { groups, base } = parsed;
  if (base === null && !existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
    console.log("SMOKE FAIL: run npm run build first");
    return 1;
  }

  let origin = base ?? "";
  let child: ReturnType<typeof spawn> | null = null;
  let spawnError: Error | null = null;
  if (base === null) {
    const port = process.env.SMOKE_PORT ? Number(process.env.SMOKE_PORT) : await freePort();
    origin = `http://${HOST}:${port}`;
    const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
    child = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", HOST], {
      stdio: "ignore",
      detached: process.platform !== "win32",
    });
    child.on("error", (err) => {
      spawnError = err;
    });
  }

  let failed = false;
  try {
    if (child !== null && (!(await waitUntilReady(origin)) || spawnError !== null)) {
      console.log(`FAIL server did not become ready on ${origin}`);
      return 1;
    }
    for (const group of groups) {
      let status = 0;
      let body = "";
      let contentType = "";
      try {
        const res = await fetch(`${origin}${group.route}`);
        status = res.status;
        contentType = res.headers.get("content-type") ?? "";
        body = await res.text();
      } catch (err) {
        console.log(`FAIL ${group.route} request error ${(err as Error).message}`);
        failed = true;
        continue;
      }
      if (status !== group.status) {
        console.log(`FAIL ${group.route} status ${status} (expected ${group.status})`);
        failed = true;
        continue;
      }
      if (group.explicitStatus) console.log(`PASS ${group.route} status ${status}`);
      for (const text of group.expected) {
        if (text === "@image") {
          if (contentType.startsWith("image/")) {
            console.log(`PASS ${group.route} @image`);
          } else {
            console.log(`FAIL ${group.route} @image content-type ${contentType}`);
            failed = true;
          }
          continue;
        }
        const absent = text.length > 1 && text.startsWith("!");
        const needle = absent ? text.slice(1) : text;
        if (body.includes(needle) !== absent) {
          console.log(`PASS ${group.route} ${text}`);
        } else {
          console.log(`FAIL ${group.route} ${text}`);
          failed = true;
        }
      }
    }
  } finally {
    if (child !== null) stopServer(child.pid);
  }

  console.log(failed ? "SMOKE FAIL" : "SMOKE OK");
  return failed ? 1 : 0;
}

process.exit(await main());
