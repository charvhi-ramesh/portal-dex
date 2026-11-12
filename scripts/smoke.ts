// Production smoke runner. Requires a prior `npm run build`.
// Usage: node scripts/smoke.ts route:/path "expected text" ... [route404:/other "expected" ...]
// (route tokens carry a `route:` prefix because Git Bash rewrites bare leading-slash arguments.)
// `route:/path` expects status 200; `routeNNN:/path` (a three-digit status, e.g. `route404:/path`)
// expects that status. An expectation starting with "!" and more text, e.g. "!absent text", asserts
// the body does NOT contain the rest. A group with an explicit status may have no expectations
// (the status is the check); a plain `route:` group needs at least one.
// Starts `next start` on 127.0.0.1 (free OS-assigned port unless SMOKE_PORT is set), fetches each
// route and checks the status plus every expectation. Prints SMOKE OK (0) or SMOKE FAIL (1).
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { join } from "node:path";

type Group = { route: string; status: number; explicitStatus: boolean; expected: string[] };

const USAGE =
  'Usage: node scripts/smoke.ts route:/path "expected text" "!absent text" ... [route404:/path "expected" ...]';
const ROUTE_TOKEN = /^route([0-9]{3})?:(.*)$/;
const HOST = "127.0.0.1";

function parseArgs(argv: string[]): Group[] | null {
  const groups: Group[] = [];
  for (const arg of argv) {
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
  return groups;
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

async function waitUntilReady(port: number): Promise<boolean> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://${HOST}:${port}/`);
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
  const groups = parseArgs(process.argv.slice(2));
  if (groups === null) {
    console.error(USAGE);
    return 2;
  }
  if (!existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
    console.log("SMOKE FAIL: run npm run build first");
    return 1;
  }

  const port = process.env.SMOKE_PORT ? Number(process.env.SMOKE_PORT) : await freePort();
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(port), "-H", HOST],
    { stdio: "ignore", detached: process.platform !== "win32" },
  );
  let spawnError: Error | null = null;
  child.on("error", (err) => {
    spawnError = err;
  });

  let failed = false;
  try {
    if (!(await waitUntilReady(port)) || spawnError !== null) {
      console.log(`FAIL server did not become ready on ${HOST}:${port}`);
      return 1;
    }
    for (const group of groups) {
      let status = 0;
      let body = "";
      try {
        const res = await fetch(`http://${HOST}:${port}${group.route}`);
        status = res.status;
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
    stopServer(child.pid);
  }

  console.log(failed ? "SMOKE FAIL" : "SMOKE OK");
  return failed ? 1 : 0;
}

process.exit(await main());
