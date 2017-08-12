import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'src/main.js',
    format: 'cjs',
    plugins: [
        resolve(),
        commonjs(),
        babel({exclude: 'node_modules/**'})
    ],
    dest: 'dist/bundle.js'
};