const { exec } = require("child_process");
const chokidar = require("chokidar");

const path = require("path");
const { push } = require("./git");
const { format } = require("./format");

const compiler = getCompiler();

function getCompiler() {
  let compilerPath = "";
  if (platform === "win32") {
    // Windows 下指定你本机MinGW的完整路径，注意转义反斜杠或使用正斜杠
    compilerPath = "C:/mingw64/bin/g++.exe"; // 请改成你的实际路径
  } else if (platform === "darwin") {
    // macOS 下也可以自定义路径，默认用 g++ 即可
    compilerPath = "g++";
  } else if (platform === "linux") {
    compilerPath = "g++";
  }

  return compilerPath;
}
function buildWindows() {
  const srcDir = path.resolve(__dirname, "src");
  const distDir = path.resolve(__dirname, "dist");
  const outputFile = path.join(distDir, "main.exe");

  const cmd = `"${compiler}" src\*.cpp -o "${outputFile}"`;

  console.log("Compile command:", cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Compile failed:", stderr);
    } else {
      console.log("Compile succeeded:", stdout);
    }
  });
}
function build() {
  return buildWindows();
  const srcDir = path.resolve(__dirname, "src");
  const distDir = path.resolve(__dirname, "dist");
  const outputFile = path.join(distDir, "main.exe");

  const cppFiles = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".cpp"))
    .map((f) => path.join(srcDir, f));

  if (cppFiles.length === 0) {
    console.error("No .cpp files found");
    process.exit(1);
  }

  const cmd = `"${compiler}" -g ${cppFiles
    .map((f) => `"${f}"`)
    .join(" ")} -o "${outputFile}"`;

  console.log("Compile command:", cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Compile failed:", stderr);
    } else {
      console.log("Compile succeeded:", stdout);
    }
  });
}

let buildTimeout = undefined;

function watchBuild() {
  const watcher = chokidar.watch(["src/**/*.cpp", "src/**/*.h"], {
    persistent: true,
  });
  watcher.on("all", (event, filepath) => {
    console.log(`Detected ${event} on ${filepath}`);

    // 清除之前的定时器
    if (buildTimeout) clearTimeout(buildTimeout);

    // 1秒后执行编译（如果1秒内没新改动就编译）
    buildTimeout = setTimeout(() => {
      build();
    }, 1000);
  });
}
function start() {
  watchBuild();
  push();
  format();
}

start();
