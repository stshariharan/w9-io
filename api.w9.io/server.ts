import buildApp from "./app";
import config from "./config/env";

(async () => {
  const app = await buildApp();

  app.listen({
    port: config.Port,
  });
})();
