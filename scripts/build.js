const { exec, execFile } = require("child_process");
const { globSync } = require("glob");
const chokidar = require("chokidar");

const path = require("path");
const fs = require("fs");
const { push } = require("./git");
const { getCompiler } = require("./utils");

const compiler = getCompiler();

function buildWindows() {
  const distDir = path.resolve(__dirname, "../dist");
  const outputFile = path.join(distDir, "main.exe");
  const files = globSync("src/**/*.cpp");
  const filesStr = files.map((f) => `"${path.resolve(f)}"`).join(" ");
  const cmd = `"${compiler}" ${filesStr} -fuse-ld=lld -o "${outputFile}"`;

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Compile failed:", error, stderr);
    } else {
      execFile(
        path.join(__dirname, "../dist/main.exe"),
        (error, stdout, stderr) => {
          if (error) {
            console.error("执行出错:", error);
            return;
          }
          console.log(stdout);
        }
      );
    }
  });
}
function build() {
  return buildWindows();
}

let buildTimeout = undefined;

function watchBuild() {
  const watcher = chokidar.watch(path.join(__dirname, "../src"), {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", (event, filepath) => {
    if (buildTimeout) clearTimeout(buildTimeout);
    buildTimeout = setTimeout(() => {
      build();
    }, 100);
  });
}
function start() {
  watchBuild();
}

start();
