const config = require('./config.ts');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const options = {};

function reducer(a, b) {
    return a.concat(b);
}

function parseGlob(sourceGlob) {
    return new Promise( async resolve => {
        await glob(sourceGlob, options, function (err, files) {
            resolve(files);
        });
    });
}

function readFileSync(filePath) {
    const filePathAbsolute = path.resolve('./', filePath);
    return fs.readFileSync(filePathAbsolute).toString();
}

async function sources() {
    return await new Promise( resolve => {
        Promise.all(config.files.map(parseGlob)).then(results => {
            results = new Set(results.reduce(reducer));
            resolve(Array.from(results).map(readFileSync).join('\n'))
        });
    });
}

exports.reader = {
    sources: sources
};

