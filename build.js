const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const chalk = require('chalk');
const rollup = require('./rollup');
const uglifyJs = require('uglify-es');
const minify = require('html-minifier').minify;

zip();

async function compileHtml() {
    const options = {
        collapseWhitespace: true
    };
    let html = await fs.readFile('index.html');
    return minify(html.toString(), options);
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

    try {
        const dest = `${name}.zip`;

        // delete any existing builds
        await fs.remove(dest);

        let zip = new AdmZip();

        console.log(chalk.cyan('=> zipping files...'));

        let html = await compileHtml();
        let js = await compileJs();

        zip.addFile('index.html', new Buffer(html));
        zip.addFile('bundle.js', new Buffer(js));
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
    } catch(e) {
        console.log(e);
    }
}