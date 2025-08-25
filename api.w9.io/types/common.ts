interface ExternalApiConfig {
  name: string; // The property name to use in Fastify instance
  baseUrl: string; // Base URL for the API
  maxRetries?: number;
  retryDelayMs?: number;
}

interface ExternalApisPluginOptions {
  apis: ExternalApiConfig[];
}
