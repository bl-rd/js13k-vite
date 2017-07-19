const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const rollup = require('rollup');

let inputOptions = {
    entry: 'src/main.js',
    format: 'cjs',
    plugins: [
        resolve(),
        babel({exclude: 'node_modules/**'})
    ],
    dest: 'dist/bundle.js'
};

function rollin() {
    return rollup.rollup(inputOptions)
        .then(bundle => bundle.generate({
            dest: 'dist/bundlez.js',
            format: 'cjs'
        }));
}

module.exports = rollin;