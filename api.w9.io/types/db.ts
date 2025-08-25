export interface PostgresDBConfig {
  name: string; // Fastify instance property name
  config: object; // Postgres connection string
}

//Postgres Plugin Options

export interface PostgresPluginOptions {
  dbs: PostgresDBConfig[];
  maxRetries?: number;
  retryDelayMs?: number;
}

//MSSQL Plugin Options

export interface MSSQLDBConfig {
  name: string;
  connectionString: string;
}

export interface MSSQLPluginOptions {
  dbs: MSSQLDBConfig[];
  maxRetries?: number;
  retryDelayMs?: number;
}

//Redis Plugin Options

export interface RedisPluginOptions {
  host: string;
  port: number;
  password?: string;
  connectTimeout?: number;
  syncTimeout?: number;
  responseTimeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

//Elastic Plugin Options

export interface ElasticPluginOptions {
  node: string;
  username?: string;
  password?: string;
  apiKey?: string;
  caCertPath?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}
