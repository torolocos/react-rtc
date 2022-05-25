import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

export default [
  {
    plugins: [esbuild()],
    input: './src/index.ts',
    output: [
      {
        file: 'dist/esm/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
  },
  {
    plugins: [esbuild(), dts()],
    input: './src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
    },
  },
];
