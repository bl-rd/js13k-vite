const http = require('http');
const fs = require('fs-extra');
const phantom = require('phantom');
const cheerio = require('cheerio');

getSvg();

/**
 * Starts up a server to read in some SVG from html.
 * Writes as usable data module to frames.js
 */
async function getSvg() {
    const html = await fs.readFile(`${process.argv[2]}.html` || 'svg.html');

    const server = await startServer(html);
    
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open('http://localhost:3333');
    const content = await page.property('content');

    const data = await getData(content);
    let code = JSON.stringify(Array.from(data), null, 2);
    await fs.writeFile('src/frames.js', `export default frames = ${code}`);

    await instance.exit();

    server.close();
    
}

/**
 * Gets the polygon html
 * @param {String} html
 */
function startServer(html) {
    return Promise.resolve(http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html.toString());
    }).listen(3333));
}

/**
 * Pares the html for polygon data
 * @param {String} content The html to parse
 * @return {Map}
 */
async function getData(content) {

    return new Promise((resolve, reject) => {
        const $ = cheerio.load(content);

        let animations = new Map();

        // get all the animations
        $('.animation').each((index, element) => {
            animations.set(element.attribs.id, {});
        });
        
        // Extract the animation cycles
        for (let [key, value] of animations) {
            $(`#${key} .cycle`).each((cycleIndex, element) => {
                let id = element.attribs.id;
                animations.get(key)[id] = [];
                $(`#${key} #${id} svg`).each((svgIndex, element) => {
                    let things = [];
                    element.children.forEach(child => {
                        if (child.name === 'polygon') {
                            let points = child.attribs.points;
                            things.push(makePointsArray(points));
                        }
                    });
                    animations.get(key)[id].push(things);

                });
            });

        }
        resolve(animations);
    });
}

/**
 * Turns the points string into a useable int array
 * @param {String} points 
 * @return {Array}
 */
function makePointsArray(points) {
    let data = [];
    points
        .split(' ')
        .map(p => {
            let temp = [];
            p.split(',').map(d => temp.push(parseInt(d, 10)));
            data.push(temp);
        });
    return data;
}