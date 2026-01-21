const dotenv = require("dotenv");
const envSchema = require("./env.schema");

dotenv.config();

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  mongoUri: parsedEnv.data.MONGO_URI,
  jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
  jwtAccessExpiry: parsedEnv.data.JWT_ACCESS_EXPIRY,
  jwtRefreshExpiry: parsedEnv.data.JWT_REFRESH_EXPIRY,
  clientOrigin: parsedEnv.data.CLIENT_ORIGIN,
  logLevel: parsedEnv.data.LOG_LEVEL,
};

module.exports = env;
