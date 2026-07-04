export default () => ({
  port: parseInt(process.env.PORT ?? "4000", 10),
  database: {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
    username: process.env.DATABASE_USER ?? "nova",
    password: process.env.DATABASE_PASSWORD ?? "nova",
    name: process.env.DATABASE_NAME ?? "nova_worlds",
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:5174").split(","),
  internalApiKey: process.env.INTERNAL_API_KEY ?? "dev-internal-key-change-me",
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
  },
});
