import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    plugins: [typescript()],
    input: './src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/esm/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
  },
  {
    plugins: [dts()],
    input: './src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
    },
  },
];
