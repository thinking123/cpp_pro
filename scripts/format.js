const chokidar = require("chokidar");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const fs = require("fs");

function format() {
  // ✅ 1. 判断系统类型
  const platform = os.platform(); // 'win32', 'darwin', 'linux'

  // ✅ 2. 设置 clang-format 路径（你可以修改成实际路径）
  let clangFormatPath = "";
  if (platform === "win32") {
    clangFormatPath = '"C:\\Program Files\\LLVM\\bin\\clang-format.exe"'; // 示例路径，注意带引号
  } else if (platform === "darwin") {
    clangFormatPath = "/opt/homebrew/bin/clang-format";
  } else {
    clangFormatPath = "/usr/bin/clang-format";
  }

  // ✅ 3. 指定要监视的目录和文件类型
  const watchDir = path.resolve(__dirname, "src");
  const watchExt = [".cpp", ".h"];

  console.log(`Watching C++ files in ${watchDir}...`);

  const watcher = chokidar.watch(watchDir, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher.on("change", (filePath) => {
    const ext = path.extname(filePath);
    if (!watchExt.includes(ext)) return;

    formatFile(filePath);
  });

  function formatFile(file) {
    if (!fs.existsSync(file)) {
      console.warn(`File not found: ${file}`);
      return;
    }

    const cmd = `${clangFormatPath} -i "${file}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Format failed: ${file}`);
        console.error(stderr);
      } else {
        console.log(`Formatted: ${file}`);
      }
    });
  }
}

module.exports = {
  format,
};
