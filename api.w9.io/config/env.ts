import dotenv from "dotenv";
dotenv.config();

const config = {
  SuperTokensUrl: String(process.env.SUPERTOKENS_CONNECTION_URI),
  SuperTokensApiKey: String(process.env.SUPERTOKENS_API_KEY),
  ApiUrl: String(process.env.API_URL),
  AppUrl: String(process.env.APP_URL),
  Port: Number(process.env.PORT),
};

export default config;
