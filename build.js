const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const chalk = require('chalk');
const rollup = require('./rollup');
const uglifyJs = require('uglify-js');
const minify = require('html-minifier').minify;

/**
 * @todo Modularize all the functions
 * @todo Find package that does promise based fs stuff?
 */

/*
# steps

## javascript

- rollup
- uglify

## html

- minify

## css

- postcss
- minify

*/
zip();

async function compileHtml() {
    //
}

async function compileJs() {
    const options = {
        toplevel: true,
        compress: {
            passes: 2
        },
        mangle: {
            toplevel: true
        },
        output: {
            beautify: false,
            preamble: "/* uglified */"
        }
    };

    let js = await rollup();
    return (uglifyJs.minify(js.code, options)).code;
}



async function zip(name = 'dist') {

    const dest = `${name}.zip`;
    // delete any existing builds
    await fs.remove(dest);

    let zip = new AdmZip();

    console.log(chalk.cyan('=> zipping files...'));

    let html = await fs.readFile('dist/index.html');
    let js = await compileJs(); //fs.readFile('dist/bundle.js');

    zip.addFile('index.html', new Buffer(html));
    zip.addFile('bundle.js', new Buffer(js));
    // let willSendThis = zip.toBuffer();
    zip.writeZip(dest);

    const stats = fs.statSync(dest);
    const fileSizeInBytes = stats.size;
    const MAX_SIZE = 13000;

    if (fileSizeInBytes <= MAX_SIZE) {
        console.log(`size: ${chalk.green(fileSizeInBytes + 'k')} (yay!)\n`);
    }
    else {
        console.log(`size: ${chalk.red(fileSizeInBytes + 'k')} (uh-oh...)\n`);
    }
}