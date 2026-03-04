
export const config = {
  port: parseInt(process.env.PORT || "3001"),
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  dockerSocket: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
  baseDomain: process.env.BASE_DOMAIN || "localhost",
  buildCachePath: process.env.BUILD_CACHE_PATH || "/tmp/builds",
  maxConcurrentBuilds: parseInt(process.env.MAX_CONCURRENT_BUILDS || "3"),
};
