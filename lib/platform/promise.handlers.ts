const objectAssignDeep = require(`object-assign-deep`);

function filesArrayPromiseHandler(resolveSources) {
    return function (filesArrayPromise) {
        return new Promise(resolve => {
            filesArrayPromise.then(filesArray => {
                resolve(
                    filesArray.map(resolveSources)
                );
            });
        });
    }
}

function objectArrayPromisesHandler(objectArrayPromises) {
    objectArrayPromises = objectArrayPromises.reduce((a, b) => a.concat(b));
    return Promise.all(objectArrayPromises);
}

function objectPromisesHandler(objects) {
    return new Promise(resolve => {
        resolve(objects.reduce((a, b) => objectAssignDeep(a, b)));
    });
}

function sourceArrayPromiseHandler(parseTEASource) {
    return function (sourceArrayPromise) {
        return new Promise(resolve => {
            sourceArrayPromise.then(sourceArray => {
                resolve(
                    sourceArray.map(
                        sourcePromise => sourcePromiseHandler(parseTEASource, sourcePromise)));
            });
        });
    }
}

function sourcePromiseHandler(parseTEASource, sourcePromise) {
    return new Promise(resolve => {
        sourcePromise.then(source => {
            resolve(parseTEASource(source.toString()));
        });
    });
}

exports.filesArrayPromiseHandler = filesArrayPromiseHandler;
exports.objectArrayPromisesHandler = objectArrayPromisesHandler;
exports.objectPromisesHandler = objectPromisesHandler;
exports.sourceArrayPromiseHandler = sourceArrayPromiseHandler;