import { defineConfig } from "vitest/config";
import { VitePluginNode } from "vite-plugin-node";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(async () => {
  return {
    server: {
      port: 3000,
    },
    build: {
      minify: true,
    },
    test: {
      globals: true,
    },
    plugins: [
      ...VitePluginNode({
        adapter: "nest",
        tsCompiler: "esbuild",
        appPath: "./src/index.ts",
        appName: "app",
        exportName: "app",
      }),
      viteTsConfigPaths(),
    ],
    resolve: {
      alias: {},
    },
    optimizeDeps: {
      exclude: [
        "@nestjs/microservices",
        "@nestjs/websockets",
        "cache-manager",
        "class-transformer",
        "class-validator",
        "fastify-swagger",
      ],
    },
  };
});
