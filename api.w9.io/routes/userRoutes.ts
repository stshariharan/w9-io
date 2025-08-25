import { FastifyInstance } from "fastify";

export async function userRoutes(fastify: FastifyInstance) {
  const { container } = fastify;

  fastify.post("/:formType/Create", async (request, reply) => {
    const { formType } = request.params as { formType: string };

    // if you want to attach it to request for controller use
    (request as any).FormType = formType;

    await container.createController.Create(request, reply);
  });

  fastify.put("/:formType/Update", async (request, reply) => {
    const { formType } = request.params as { formType: string };

    // if you want to attach it to request for controller use
    (request as any).FormType = formType;

    await container.updateController.Update(request, reply);
  });

  fastify.get("/Get", async (request, reply) => {
    return container.getController.Get(request, reply);
  });
}
