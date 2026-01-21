module.exports = {
  apps: [
    {
      name: "class-companion-backend",
      script: "server.js",
      instances: "max", // Use all available cores
      exec_mode: "cluster", // Enable clustering
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: false, // Disable watch in production
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
