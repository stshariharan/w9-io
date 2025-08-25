import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server.ts"],
  format: ["esm"], // or ["esm", "cjs"] if you want both
  target: "node20", // match your Node runtime
  platform: "node",
  clean: true,
  bundle: true,
  sourcemap: true,
  outDir: "dist",
  minify: true,
  keepNames: true,

  external: [
    "mssql",
    "pg",
    "ioredis",
    "@elastic/elasticsearch",
    "@aws-sdk/client-ses",
    "aws-sdk",
    "jsonwebtoken",
    "safe-buffer",
    "jws",
    "crypto-js",
  ],

  watch: process.env.NODE_ENV === "development",

  onSuccess:
    process.env.NODE_ENV === "development"
      ? 'echo "✅ Build successful!" && node dist/server.js'
      : undefined,
});
