import { createServer, type IncomingMessage } from "http";
import { parse } from "url";
import next from "next";
import { initServices, type ServicesContainer } from "./lib/init/container";

// This is the only time we read env variables directly/ outside the configuration service
// because we need to read the NODE_ENV variable to determine if we are in development mode,
// before we initialise the services container.
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

export type NextCtxRequest = IncomingMessage & {
  ctx: {
    services: ServicesContainer;
  };
};

void app.prepare().then(async () => {
  const services = await initServices();
  const { logger, configService: config } = services;
  const ctx = { services };

  const port = config.getEnv("PORT", 3000);

  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    const ctxReq = new Proxy(req, {
      get: (target, prop) => {
        if (prop === "ctx") return ctx;
        return target[prop as keyof IncomingMessage];
      },
    }) as NextCtxRequest;

    void handle(ctxReq, res, parsedUrl);
  }).listen(port);

  logger.info(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`,
  );
});
