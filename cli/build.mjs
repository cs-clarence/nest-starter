import { esbuildDecorators } from "@anatine/esbuild-decorators";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import esbuild from "esbuild";
import rimraf from "rimraf";
import process from "process";
import logger from "./logger.mjs";
import { resolve, dirname } from "path";

export async function build({
  inProd,
  outdir,
  entryPoint,
  format,
  outExtension,
}) {
  rimraf.sync(outdir);

  logger.information("🔥 Building project...");

  if (inProd) {
    logger.information(
      "🔥 Building project in production mode. This will bundle and minify the project and remove unused modules.",
    );
  }

  await esbuild
    .build({
      plugins: [
        nodeExternalsPlugin(),
        esbuildDecorators({ tsconfig: "tsconfig.json" }),
      ],
      entryPoints: [entryPoint],
      bundle: true,
      treeShaking: inProd,
      outdir,
      splitting: format === "esm",
      platform: "node",
      format,
      minify: inProd,
      sourcemap: inProd ? false : "linked",
      outExtension,
      // splitting: inProd,
      define: {
        "process.env.NODE_ENV": inProd ? '"production"' : '"development"',
        "process.env.BUILD": inProd ? '"production"' : '"development"',
      },
    })
    .catch(() => {
      logger.error("X Encountered an error when building. Exiting...");
      process.exit(1);
    });

  logger.success(
    `✓ Build successful!
✓ Output located at ${resolve(dirname("."), outdir)}`,
  );
}
