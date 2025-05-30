const { exec } = require("child_process");
const path = require("path");

const srcDir = path.resolve(__dirname, "src");
const checkInterval = 10 * 60 * 1000; // 10分钟
// 缓存每个文件的最后修改时间
const fileModTimes = new Map();
function scanFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}
function initFileModTimes() {
  const files = scanFiles(srcDir);
  files.forEach((file) => {
    const stat = fs.statSync(file);
    fileModTimes.set(file, stat.mtimeMs);
  });
}
function checkForChanges() {
  console.log("Checking for file changes...");
  let changed = false;

  const files = scanFiles(srcDir);
  files.forEach((file) => {
    const stat = fs.statSync(file);
    const lastModTime = fileModTimes.get(file);
    if (!lastModTime || stat.mtimeMs > lastModTime) {
      console.log(`File changed: ${file}`);
      changed = true;
      fileModTimes.set(file, stat.mtimeMs);
    }
  });

  return changed;
}
function pushToMaster() {
  console.log("Detected changes, executing git push...");

  exec("git add .", (err, stdout, stderr) => {
    if (err) {
      console.error("git add failed:", stderr);
      return;
    }
    console.log("git add succeeded");

    exec('git commit -m "push"', (err2, stdout2, stderr2) => {
      if (err2) {
        // 如果没有可提交的更改，git commit 会报错，忽略该错误
        if (stderr2.includes("nothing to commit")) {
          console.log("No changes to commit.");
        } else {
          console.error("git commit failed:", stderr2);
          return;
        }
      } else {
        console.log("git commit succeeded");
      }

      exec("git push origin master", (err3, stdout3, stderr3) => {
        if (err3) {
          console.error("git push failed:", stderr3);
          return;
        }
        console.log("git push succeeded:", stdout3);
      });
    });
  });
}
function push() {
  initFileModTimes();

  setInterval(() => {
    if (checkForChanges()) {
      pushToMaster();
    } else {
      console.log("No changes detected.");
    }
  }, checkInterval);
}

module.exports = {
  push,
};
