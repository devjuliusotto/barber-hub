import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));

const child = spawn(
  "pnpm --filter @workspace/barber-hub run dev",
  {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      PORT: process.env.PORT ?? "21576",
      BASE_PATH: process.env.BASE_PATH ?? "/",
    },
    stdio: "inherit",
    shell: true,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
