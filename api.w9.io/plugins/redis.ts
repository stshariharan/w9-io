import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import Redis, { Redis as RedisClient } from "ioredis";
import { RedisPluginOptions } from "../types/db";

const redisPlugin: FastifyPluginAsync<RedisPluginOptions> = async (
  fastify,
  opts
) => {
  const {
    host,
    port,
    password,
    connectTimeout = 30000,
    responseTimeout = 30000,
    maxRetries = 3,
    retryDelayMs = 2000,
  } = opts;

  let retries = 0;
  let client: RedisClient;

  while (retries < maxRetries) {
    try {
      client = new Redis({
        host,
        port,
        password,
        connectTimeout,
        commandTimeout: responseTimeout,
        retryStrategy: (times) => {
          if (times > maxRetries) return null;
          return retryDelayMs;
        },
      });

      await client.ping();
      fastify.log.info("Redis connected");
      break;
    } catch (err) {
      retries++;
      fastify.log.error(
        `Redis connection failed (Attempt ${retries}/${maxRetries}): ${err}`
      );
      if (retries >= maxRetries) throw err;
      await new Promise((res) => setTimeout(res, retryDelayMs));
    }
  }

  fastify.decorate("redis", client!);

  fastify.addHook("onClose", async (instance) => {
    await instance.redis.quit();
    fastify.log.info("Redis connection closed");
  });
};

export default fp(redisPlugin, {
  name: "redisPlugin",
});
