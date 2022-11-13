const fs = require('fs');

// 获取打包文件目录s
const dirs = fs.readdirSync('packages').filter((p) => {
  // 过滤文件
  return fs.statSync(`packages/${p}`).isDirectory();
});
 
console.log(dirs);
