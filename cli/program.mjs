import { Command, Option } from "commander";
import console from "console";
import { watch } from "./watch.mjs";
import { build } from "./build.mjs";
import pkg from "./pkg.mjs";
import logger from "./logger.mjs";
import process from "process";
import { moduleExtensions } from "./module-extensions.mjs";
const program = new Command();

program
  .name("cli.mjs")
  .version("", "-v, --version")
  .description("Builds a project with esbuild");

program
  .command("build <file>")
  .option("-p, --prod", "Build project in production mode", false)
  .option(
    "-o, --outdir <dir>",
    "Output directory for the built project",
    "dist",
  )
  .addOption(
    new Option("-f, --format <format>", "Module format for the project")
      .choices(["esm", "cjs", "iife", "infer"])
      .default("infer"),
  )
  .action(async (file, options) => {
    console.log(file);
    console.log(options);

    let format = options.format;

    if (format === "infer") {
      if (typeof pkg.type === "string") {
        format = pkg.type === "module" ? "esm" : "cjs";
      }
    }

    if (options.format in moduleExtensions) {
      logger.error(
        "X You're using an unsupported module format. The supported formats are: cjs, esm, iife.",
      );
      process.exit(1);
    }

    await build({
      inProd: options.prod,
      outdir: options.outdir,
      entryPoint: file,
      format,
      outExtension: {
        ".js":
          options.format === "infer" ? ".js" : moduleExtensions[options.format],
      },
    });
  });

program
  .command("watch <file>")
  .option(
    "-o, --outdir <dir>",
    "Output directory for the built project",
    ".esbuild",
  )
  .addOption(
    new Option("-f, --format <format>", "Module format for the project")
      .choices(["esm", "cjs", "iife", "infer"])
      .default("infer"),
  )
  .option(
    "-e, --exec",
    "Execute the output file or a command after building/rebuilding",
    false,
  )
  .action(async (file, options) => {
    let format = options.format;

    if (format === "infer") {
      if (typeof pkg.type === "string") {
        format = pkg.type === "module" ? "esm" : "cjs";
      }
    }

    await watch({
      entryPoint: file,
      exec: options.exec,
      format,
      outdir: options.outdir,
      outExtension: {
        ".js":
          options.format === "infer" ? ".js" : moduleExtensions[options.format],
      },
    });
  });

export default program;
