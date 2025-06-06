const path = require("path");
const { platform } = process;

function getCompiler() {
  let compilerPath = "";
  if (platform === "win32") {
    // Windows 下指定你本机MinGW的完整路径，注意转义反斜杠或使用正斜杠
    compilerPath = path.join(
      __dirname,
      "../compilers/windows/llvm/bin/clang++.exe"
    ); // 请改成你的实际路径
  } else if (platform === "darwin") {
    // macOS 下也可以自定义路径，默认用 g++ 即可
    compilerPath = "g++";
  } else if (platform === "linux") {
    compilerPath = "g++";
  }

  console.log("compiler", compilerPath);
  return compilerPath;
}

function getFormat() {
  let compilerPath = "";
  if (platform === "win32") {
    compilerPath = path.join(
      __dirname,
      "../compilers/windows/llvm/bin/clang-format.exe"
    );
  } else if (platform === "darwin") {
    compilerPath = "g++";
  } else if (platform === "linux") {
    compilerPath = "g++";
  }

  console.log("compiler", compilerPath);
  return compilerPath;
}

module.exports = {
  getCompiler,
  getFormat,
};
