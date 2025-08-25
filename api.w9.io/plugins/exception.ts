import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { exceptionMiddleware } from "../middlewares/exception";

const exceptionPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler(exceptionMiddleware)
};

export default fp(exceptionPlugin, {
    name: "exceptionPlugin",
});
