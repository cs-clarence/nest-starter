/* eslint-disable */
const esbuild = require("esbuild");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const path = require("path");
const commandLineArgs = require("command-line-args");
const clc = require("cli-color");
const { nodeExternalsPlugin } = require("esbuild-node-externals");
const { esbuildDecorators } = require("@anatine/esbuild-decorators");

const success = clc.green.bold;
const warning = clc.yellow.bold;
const message = clc.blue.bold;
const error = clc.red.bold;

async function main() {
  /**@type {[import("command-line-args").OptionDefinition]} */
  const optionsDefinitions = [
    {
      name: "prod",
      alias: "p",
      type: Boolean,
      defaultValue: false,
    },
    {
      name: "watch",
      alias: "w",
      type: Boolean,
      defaultValue: false,
    },
    {
      name: "outdir",
      alias: "o",
      type: String,
      defaultValue: "dist",
    },
    {
      name: "watch-outdir",
      alias: "d",
      type: String,
      defaultValue: ".esbuild",
    },
    {
      name: "entry-point",
      alias: "e",
      type: String,
      defaultValue: "src/index.ts",
    },
    {
      name: "format",
      alias: "f",
      type: String,
    },
  ];

  const options = commandLineArgs(optionsDefinitions);

  if (!options.format) {
    const pkg = require("./package.json");
    if (typeof pkg.type === "string") {
      options.format = pkg.type === "module" ? "esm" : "cjs";
    } else {
      options.format = "cjs";
    }
  }

  if (options.watch) {
    console.log(
      message(
        "🔥 Running in watch mode. The project will be rebuilt and rerun upon changes.\n",
      ),
    );
  }

  if (options.prod) {
    console.log(
      message(
        "🔥 Building project in production mode. This will bundle and minify the project and remove unused code.\n",
      ),
    );
  }

  if (options.watch && options.prod) {
    console.warn(
      warning(
        `You're running in watch mode and in production mode. This is not recommended.
Production mode will build the project with optimizations enabled and without sourcemaps which is not suitable for a development environment.
Remove the --prod/-p flag to turn off production mode.\n
`,
      ),
    );
  }

  if (["cjs", "esm", "iife"].indexOf(options.format?.toLowerCase()) === -1) {
    console.error(
      error(
        `X You're using an unsupported module format.
The supported formats are: cjs, esm, iife.
The default module format is cjs.
`,
      ),
    );
    process.exit(1);
  }

  await build({
    inProd: options.prod,
    watch: options.watch,
    outDir: options.outdir,
    watchOutDir: options["watch-outdir"],
    entryPoint: options["entry-point"],
    format: options.format?.toLowerCase(),
  });
}

async function build({
  inProd,
  outDir,
  watch,
  watchOutDir,
  entryPoint,
  format,
}) {
  const outputDestination = watch ? watchOutDir : outDir;

  rimraf.sync(outputDestination);

  let runningChildProcess = null;

  const formatToExtension = {
    esm: ".js",
    cjs: ".js",
    iife: ".js",
  };

  function runOutputFile() {
    if (runningChildProcess) {
      runningChildProcess.kill();
    }

    let fileName = path.basename(entryPoint);
    fileName = fileName.replace(
      path.extname(fileName),
      formatToExtension[format],
    );

    runningChildProcess = childProcess.spawn(
      "node",
      [`${watchOutDir}/${fileName}`],
      { cwd: process.cwd(), stdio: "inherit" },
    );
  }

  const result = await esbuild
    .build({
      plugins: [
        nodeExternalsPlugin(),
        esbuildDecorators({ tsconfig: "tsconfig.json" }),
      ],
      entryPoints: [entryPoint],
      bundle: true,
      treeShaking: inProd,
      outdir: outputDestination,
      splitting: format === "esm",
      platform: "node",
      format,
      minify: inProd,
      sourcemap: inProd ? false : "linked",
      outExtension: {
        ".js": formatToExtension[format],
      },
      // splitting: inProd,
      incremental: watch,
      define: {
        "process.env.NODE_ENV": inProd ? '"production"' : '"development"',
        "process.env.BUILD": inProd ? '"production"' : '"development"',
      },
      watch: watch && {
        onRebuild: (err, _res) => {
          if (err) {
            console.error(err, "\n");
            console.error(
              error(
                "X Encountered an error when building. Watching for changes before rebuild...\n",
              ),
            );
            return;
          }
          console.log(success("✓ Rebuild successful!\n"));

          runOutputFile();
        },
      },
    })
    .catch(() => {
      console.error(
        error("X Encountered an error when building. Exiting...\n"),
      );
      process.exit(1);
    });

  if (watch) {
    runOutputFile();
  }

  console.log(
    success(
      `✓ Build successful!
✓ Output located at ${path.resolve(__dirname, outputDestination)}\n`,
    ),
  );

  return result;
}

main();
