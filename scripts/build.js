const { exec, execFile } = require("child_process");
const { globSync } = require("glob");
const chokidar = require("chokidar");
const { platform } = process;
const path = require("path");
const fs = require("fs");
const { push } = require("./git");
const { getCompiler } = require("./utils");

const compiler = getCompiler();

function buildMac() {
  const distDir = path.resolve(__dirname, "../dist");
  const outputFile = path.join(distDir, "main"); // 没有 .exe
  const files = globSync("src/**/*.cpp");
  const filesStr = files.map((f) => `"${path.resolve(f)}"`).join(" ");

  // 使用 clang++ 或 brew 安装的 LLVM clang++
  const compiler = "/usr/bin/clang++"; // 或 '/opt/homebrew/opt/llvm/bin/clang++'
  const cmd = `"${compiler}" ${filesStr} -std=c++17 -O2 -o "${outputFile}"`;

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Compile failed:", error.message);
      console.error(stderr);
    } else {
      execFile(outputFile, (error, stdout, stderr) => {
        if (error) {
          console.error("运行出错:", error.message);
          console.error(stderr);
        } else {
          console.log(stdout);
        }
      });
    }
  });
}

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
  if (platform === "win32") {
    return buildWindows();
  } else {
    return buildMac();
  }
}

let buildTimeout = undefined;

function watchBuild() {
  const watcher = chokidar.watch(path.join(__dirname, "../src"), {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", (event, filepath) => {
    // if (buildTimeout) clearTimeout(buildTimeout);
    build();
    // buildTimeout = setTimeout(() => {
    //   build();
    // }, 100);
  });
}
function start() {
  watchBuild();
}

start();
