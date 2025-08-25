import fastify from "fastify";
import config from "./config/env";
import { SuperTokensConfig } from "./config/supertokens";
import supertokens from "supertokens-node";

const app = fastify({
  logger: true,
  caseSensitive: false,
});

const buildApp = async () => {
  supertokens.init(SuperTokensConfig);

  return app;
};

export default buildApp;
