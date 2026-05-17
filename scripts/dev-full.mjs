import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));

function loadLocalEnv() {
  const envPath = new URL("../.env.local", import.meta.url);
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function start(name, command, env) {
  const child = spawn(command, {
    cwd: workspaceRoot,
    env,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code && !shuttingDown) {
      console.error(`${name} exited with code ${code}`);
      shutdown();
    }
  });

  return child;
}

let shuttingDown = false;
const children = [];

function shutdown() {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

loadLocalEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Set it in your shell or create a local .env.local file.");
  process.exit(1);
}

const apiPort = process.env.API_PORT ?? "8080";
const webPort = process.env.PORT ?? "21576";

children.push(
  start("api", "pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/api-server run start", {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: apiPort,
  }),
);

children.push(
  start("web", "pnpm --filter @workspace/barber-hub run dev", {
    ...process.env,
    PORT: webPort,
    BASE_PATH: process.env.BASE_PATH ?? "/",
    API_URL: process.env.API_URL ?? `http://localhost:${apiPort}`,
  }),
);

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
