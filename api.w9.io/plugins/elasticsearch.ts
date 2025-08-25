import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import fs from "fs";
import { ElasticPluginOptions } from "../types/db";

const elasticPlugin: FastifyPluginAsync<ElasticPluginOptions> = async (
  fastify,
  opts
) => {
  const {
    node,
    username,
    password,
    apiKey,
    caCertPath,
    maxRetries = 5,
    retryDelayMs = 2000,
  } = opts;

  let client: ElasticClient;
  let retries = 0;

  // Load CA cert if provided
  let ca: Buffer | undefined;
  if (caCertPath) {
    try {
      ca = fs.readFileSync(caCertPath);
    } catch (err) {
      fastify.log.error(
        `Failed to read CA certificate at ${caCertPath}: ${err}`
      );
      throw err; // Rethrow so we don't start the connection with bad cert
    }
  }

  while (retries < maxRetries) {
    try {
      client = new ElasticClient({
        node,
        auth: apiKey
          ? { apiKey }
          : username && password
          ? { username, password }
          : undefined,
        tls: ca ? { ca, rejectUnauthorized: true } : undefined,
      });

      await client.ping();
      fastify.log.info("Elasticsearch connected");
      break;
    } catch (err: unknown) {
      retries++;
      if (err instanceof Error) {
        fastify.log.error(
          `Elasticsearch connection failed (Attempt ${retries}/${maxRetries}): ${err.message}`
        );
      } else {
        fastify.log.error(
          `Elasticsearch connection failed (Attempt ${retries}/${maxRetries}): ${String(
            err
          )}`
        );
      }
      if (retries >= maxRetries) throw err;
      await new Promise((res) => setTimeout(res, retryDelayMs));
    }
  }

  // Decorate Fastify instance
  fastify.decorate("elasticsearch", client!);

  fastify.addHook("onClose", async (instance) => {
    await instance.elasticsearch.close();
    fastify.log.info("🔌 Elasticsearch connection closed");
  });
};

export default fp(elasticPlugin, { name: "elasticsearch" });
