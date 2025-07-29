const json = require('@rollup/plugin-json');
const typescript = require('rollup-plugin-typescript2');
const external = require('rollup-plugin-peer-deps-external');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const babel = require('@rollup/plugin-babel').default;
const cleanup = require('rollup-plugin-cleaner');
const pkg = require('./package.json');

const extensions = ['.js', '.ts'];

module.exports = {
  input: "lib/index.ts",
output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
    }
],
  plugins: [
    json(),
    cleanup({ targets: ['./dist/'] }),
    external(),
    resolve({ extensions }),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: "**/tests/**",
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    commonjs({ include: ["node_modules/**"] }),
    babel({
      extensions,
      include: ['lib/**/*'],
      babelHelpers: 'runtime',
    }),
  ],
  external: ['video.js'] // 外部ライブラリはここで指定
};
