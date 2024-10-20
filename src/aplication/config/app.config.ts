export const envConfiguration = () => ({
  port: process.env.PORT || 3005,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
});
