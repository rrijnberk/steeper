const config = require('./config.ts');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

function resolveFiles() {
    const globOptions = {};

    return config.files.map(fileGlob  => new Promise(resolve => {
        glob(fileGlob, globOptions, function (err, filePaths) {
            resolve(filePaths);
        });
    }));
}

function resolveSources(filePath) {
    return new Promise(resolve => {
        fs.readFile(path.resolve('./', filePath)).then(resolve);
    });
}

exports.resolveFiles = resolveFiles;
exports.resolveSources = resolveSources;