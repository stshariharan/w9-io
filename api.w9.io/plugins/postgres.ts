import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { Pool } from "pg";
import { PostgresPluginOptions } from "../types/db";

const postGresPlugIn: FastifyPluginAsync<PostgresPluginOptions> = async (
  fastify,
  options
) => {
  const { dbs, maxRetries = 3, retryDelayMs = 1000 } = options;

  for (const { name, config } of dbs) {
    let retries = 0;
    let pool: Pool;

    while (retries < maxRetries) {
      try {
        // force clone config, avoids pg reusing
        pool = new Pool({ ...config });

        // Try to connect
        const client = await pool.connect();
        client.release();

        fastify.log.info(`PostgreSQL (${name}) connected`);
        break;
      } catch (err) {
        retries++;
        fastify.log.error(
          `PostgreSQL (${name}) failed (Attempt ${retries}/${maxRetries}): ${err}`
        );

        // Clean up failed pool
        if (pool!) {
          try {
            await pool.end();
          } catch {}
        }

        if (retries >= maxRetries) throw err;
        await new Promise((res) => setTimeout(res, retryDelayMs));
      }
    }

    fastify.decorate(name, pool!);

    fastify.addHook("onClose", async (instance) => {
      try {
        await instance[name].end();
        fastify.log.info(`PostgreSQL (${name}) pool closed`);
      } catch (err) {
        fastify.log.error(`Error closing PostgreSQL (${name}) pool: ${err}`);
      }
    });
  }
};

export default fp(postGresPlugIn);
