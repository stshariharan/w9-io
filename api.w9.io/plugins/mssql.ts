import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { MSSQLPluginOptions } from "../types/db";
import sql from "mssql";

const mssqlPlugin: FastifyPluginAsync<MSSQLPluginOptions> = async (
  fastify,
  opts
) => {
  const { dbs, maxRetries = 3, retryDelayMs = 1000 } = opts;

  for (const { name, connectionString } of dbs) {
    let retries = 0;
    let pool: sql.ConnectionPool;

    while (retries < maxRetries) {
      try {
        // Option 1: Use connection string directly
        pool = new sql.ConnectionPool(connectionString);

        // Add connection timeout
        const connectPromise = pool.connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 15000)
        );

        await Promise.race([connectPromise, timeoutPromise]);

        fastify.log.info(`MSSQL (${name}) connected`);
        break;
      } catch (err) {
        retries++;
        fastify.log.error(
          `MSSQL (${name}) failed (Attempt ${retries}/${maxRetries}): ${err}`
        );

        // Clean up failed pool
        if (pool!) {
          try {
            await pool.close();
          } catch (closeErr) {
            // Ignore close errors for failed connections
          }
        }

        if (retries >= maxRetries) throw err;
        await new Promise((res) => setTimeout(res, retryDelayMs));
      }
    }

    fastify.decorate(name, pool!);

    fastify.addHook("onClose", async (instance) => {
      try {
        if (instance[name] && instance[name].connected) {
          await instance[name].close();
          fastify.log.info(`MSSQL (${name}) pool closed`);
        }
      } catch (err) {
        fastify.log.error(`Error closing MSSQL (${name}) pool: ${err}`);
      }
    });
  }
};

export default fp(mssqlPlugin, {
  name: "mssqlPlugin",
});
