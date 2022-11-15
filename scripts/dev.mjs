import fs from 'fs';
import path from 'path';
import { execa } from 'execa';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// 获取打包文件目录s
const dirs = fs.readdirSync('packages').filter((p) => {
  // 过滤文件
  return fs.statSync(`packages/${p}`).isDirectory();
});

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
    stdout: 'inherit', // 子进程继承父进程配置
  });
}

function runParallel(dirs, iteratorFn) {
  let result = [];
  for (const item of dirs) {
    result.push(iteratorFn(item));
  }
  return Promise.all(result);
}

runParallel(dirs, build).then(() => {
  console.log('build success!');
});
