import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import resolvePlugin from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

if (!process.env.TARGET) {
  throw new Error('no --environment flag');
}

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// packages 目录
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);

const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`));
const options = pkg.buildOptions;
const name = options.filename || path.basename(packageDir);

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`,
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`,
  },
  // runtime-only builds, for main "vue" package only
  'esm-bundler-runtime': {
    file: resolve(`dist/${name}.runtime.esm-bundler.js`),
    format: `es`,
  },
  'esm-browser-runtime': {
    file: resolve(`dist/${name}.runtime.esm-browser.js`),
    format: 'es',
  },
  'global-runtime': {
    file: resolve(`dist/${name}.runtime.global.js`),
    format: 'iife',
  },
};

function createConfig(format, output, plugins = []) {
  if (!output) {
    return;
  }
  const isGlobalBuild = /global/.test(format);
  if (isGlobalBuild) {
    output.name = options.name;
  }
  output.sourcemap = true;
  // 生成配置
  return {
    input: resolve('src/index.ts'),
    external: [],
    output,
    treeshake: {
      moduleSideEffects: false,
    },
    plugins: [
      json({
        namedExports: false,
      }),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      }),
      resolvePlugin(), // 解析第三方插件
    ],
  };
}

export default options.formats.map((format) => createConfig(format, outputConfigs[format]));
