import "fastify";
import { Pool as PgPool } from "pg";
import { ConnectionPool as MsPool } from "mssql";
import { Redis as RedisClient } from "ioredis";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import apicallPlugin from "./plugins/apicall";
import { AxiosInstance } from "axios";
import * as baseModels from "../models/basemodels/basemodels";

declare module "fastify" {
  interface FastifyInstance {
    appDB: MsPool;
    hubDB: MsPool;
    pgAppDB: PgPool;
    redis: RedisClient;
    elasticsearch: ElasticClient;
    [key: string]: any;
    apicall: apicallPlugin;
    oAuthApi: AxiosInstance;
    addressBookApi: AxiosInstance;
    statesApi: AxiosInstance;
  }

  interface FastifyRequest {
    UserDetail: baseModels.UserDetail | null;
    RequestId: string;
    FormType?: string;
  }
}
