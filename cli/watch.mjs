import { esbuildDecorators } from "@anatine/esbuild-decorators";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import esbuild from "esbuild";
import rimraf from "rimraf";
import process from "process";
import logger from "./logger.mjs";
import path from "path";
import childProcess from "child_process";

export async function watch({
  outdir,
  entryPoint,
  format,
  outExtension,
  exec,
}) {
  rimraf.sync(outdir);

  logger.information("🔥 Watching project...");

  let fileName = path.basename(entryPoint);
  fileName = fileName.replace(path.extname(fileName), outExtension[".js"]);
  let outFile = path.resolve(outdir, fileName);

  function execOutput() {
    return childProcess.spawn("node", [`${outdir}/${fileName}`], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  }

  let runningChildProcess = null;

  function execCommand() {
    if (runningChildProcess) {
      runningChildProcess.kill();
    }

    runningChildProcess = execOutput();
  }

  await esbuild
    .build({
      plugins: [
        nodeExternalsPlugin(),
        esbuildDecorators({ tsconfig: "tsconfig.json" }),
      ],
      entryPoints: [entryPoint],
      bundle: true,
      outdir,
      splitting: format === "esm",
      platform: "node",
      format,
      sourcemap: "linked",
      outExtension,
      watch: {
        onRebuild(error /* _result */) {
          if (error) {
            logger.error(error);
            return;
          }
          logger.success("✓ Rebuild successful!");

          if (exec) {
            logger.success(`✓ Executing: ${outFile}`);
            execCommand();
          }
        },
      },
    })
    .catch(() => {
      logger.error("X Encountered an error when building. Exiting...");
      process.exit(1);
    });

  logger.success("✓ Build successful!");
  if (exec) {
    execCommand();
    if (exec) {
      logger.success(`✓ Executing: ${outFile}`);
      execCommand();
    }
  }
}
