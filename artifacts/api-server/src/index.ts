import app from "./app";
import { logger } from "./lib/logger";

export default app;

const rawPort = process.env["PORT"];

if (!rawPort || process.env["VERCEL"]) {
  if (!process.env["VERCEL"]) {
    logger.info("PORT not set; exporting Express app without starting a listener");
  }
} else {
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}
